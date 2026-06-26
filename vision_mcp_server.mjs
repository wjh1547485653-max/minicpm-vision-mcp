import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { readFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "fs";
import { execSync } from "child_process";
import { request } from "http";
import { request as httpsRequest } from "https";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODEL = "minicpm-v4.6";
const OLLAMA = { hostname: "127.0.0.1", port: 11434 };
const FRAME_DIR = join(__dirname, "_vision_frames");
const INTERVAL = 8; // seconds between frames

// --- ffmpeg path ---
let _ffmpegPath = null;
function getFfmpegPath() {
  if (_ffmpegPath) return _ffmpegPath;
  // Try npm-installed ffmpeg binary
  const pkgPath = join(__dirname, "node_modules", "@ffmpeg-installer", "win32-x64", "ffmpeg.exe");
  if (existsSync(pkgPath)) { _ffmpegPath = pkgPath; return pkgPath; }
  // Fallback: assume ffmpeg on PATH
  _ffmpegPath = "ffmpeg";
  return _ffmpegPath;
}

function run(cmd, ignoreError) {
  try { return execSync(cmd, { encoding: "utf8", stdio: "pipe", timeout: 60000 }); }
  catch (e) {
    if (ignoreError && e.stdout) return e.stdout;
    if (ignoreError && e.stderr) return e.stderr;
    throw e;
  }
}

// --- Ollama vision ---
function cleanOutput(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
}

async function ollamaGenerate(prompt, imagesBase64) {
  const body = JSON.stringify({ model: MODEL, prompt, images: imagesBase64, stream: false });
  return new Promise((resolve, reject) => {
    const req = request({ ...OLLAMA, path: "/api/generate", method: "POST", headers: { "Content-Type": "application/json" } }, (res) => {
      let data = "";
      res.on("data", (c) => (data += c));
      res.on("end", () => {
        try { resolve(JSON.parse(data).response || data); }
        catch { resolve(data); }
      });
    });
    req.on("error", reject);
    req.setTimeout(120000, () => { req.destroy(); reject(new Error("Ollama timeout")); });
    req.write(body);
    req.end();
  });
}

// --- Image description ---
const IMAGE_PROMPT = "请详细描述这张图片的内容。用中文回复。";
const FRAME_PROMPT = "用一句话概括这个画面：1.核心内容是什么 2.有哪些关键文字。不要描述UI布局细节。用中文。";

async function describeImage(imagePath) {
  const img = readFileSync(imagePath);
  const b64 = img.toString("base64");
  return ollamaGenerate(IMAGE_PROMPT, [b64]);
}

// --- Video analysis ---
function getDuration(filePath) {
  const out = run(`"${getFfmpegPath()}" -i "${filePath}" 2>&1`, true);
  const m = out.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
  if (!m) throw new Error("Cannot parse duration from video");
  return parseInt(m[1]) * 3600 + parseInt(m[2]) * 60 + parseInt(m[3]) + (parseInt(m[4]) > 0 ? 1 : 0);
}

function extractFrames(videoPath, interval) {
  const dur = getDuration(videoPath);
  const frameCount = Math.ceil(dur / interval);

  if (existsSync(FRAME_DIR)) rmSync(FRAME_DIR, { recursive: true });
  mkdirSync(FRAME_DIR, { recursive: true });

  run(`"${getFfmpegPath()}" -i "${videoPath}" -vf "fps=1/${interval}" -q:v 2 "${FRAME_DIR}/f_%04d.jpg" -y`);

  const files = run(`cmd /c "dir /b "${FRAME_DIR}""`).trim().split(/\r?\n/).filter(f => f).map(f => join(FRAME_DIR, f));
  return { files, duration: dur, frameCount };
}

function downloadFile(url, destPath) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? httpsRequest : request;
    const req = mod(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return downloadFile(res.headers.location, destPath).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", c => chunks.push(c));
      res.on("end", () => {
        writeFileSync(destPath, Buffer.concat(chunks));
        resolve(destPath);
      });
    });
    req.on("error", reject);
    req.setTimeout(60000, () => { req.destroy(); reject(new Error("Download timeout")); });
    req.end();
  });
}

async function describeVideo(videoPathOrUrl, interval) {
  interval = interval || INTERVAL;
  let videoPath = videoPathOrUrl;
  let downloaded = false;

  // Download if URL
  if (videoPathOrUrl.startsWith("http://") || videoPathOrUrl.startsWith("https://")) {
    const dest = join(__dirname, `_temp_video_${Date.now()}.mp4`);
    videoPath = await downloadFile(videoPathOrUrl, dest);
    downloaded = true;
  }

  if (!existsSync(videoPath)) throw new Error(`Video file not found: ${videoPath}`);

  const { files, duration, frameCount } = extractFrames(videoPath, interval);

  // Analyze each frame with concise prompt
  const results = [];
  for (let i = 0; i < files.length; i++) {
    const sec = Math.min((i + 1) * interval, duration);
    try {
      const raw = await ollamaGenerate(FRAME_PROMPT, [readFileSync(files[i]).toString("base64")]);
      results.push({ time: sec, description: cleanOutput(raw) });
    } catch (e) {
      results.push({ time: sec, description: `[识别失败]` });
    }
  }

  // Secondary summary
  let finalSummary = "";
  try {
    const allDescs = results.map(r => `[${r.time}s] ${r.description}`).join("\n");
    finalSummary = cleanOutput(await ollamaGenerate(
      `以下是视频各时间段的画面描述，请用200字以内总结这个视频的整体内容、核心主题和关键信息点。用中文。\n\n${allDescs}`,
      []
    ));
  } catch (e) { finalSummary = "(摘要生成失败)"; }

  // Build output
  let output = `视频时长: ${duration}秒 | 分析帧数: ${results.length} | 间隔: ${interval}秒\n`;
  output += "=".repeat(50) + "\n";
  for (const r of results) {
    output += `\n[${r.time}s] ${r.description}\n`;
  }
  output += "\n" + "=".repeat(50) + "\n";
  output += `📝 **总结**: ${finalSummary}\n`;

  // Cleanup
  if (existsSync(FRAME_DIR)) rmSync(FRAME_DIR, { recursive: true });
  if (downloaded && existsSync(videoPath)) rmSync(videoPath);

  return output;
}

// --- Audio extraction ---
function extractAudio(videoPath) {
  const audioPath = join(__dirname, `_temp_audio_${Date.now()}.mp3`);
  run(`"${getFfmpegPath()}" -i "${videoPath}" -vn -ar 16000 -ac 1 -b:a 64k "${audioPath}" -y`);
  return audioPath;
}

function getAudioInfo(filePath) {
  const out = run(`"${getFfmpegPath()}" -i "${filePath}" 2>&1`, true);
  const durM = out.match(/Duration: (\d+):(\d+):(\d+)\.(\d+)/);
  const audioM = out.match(/Stream #\d+:\d+.*Audio: (\w+).*, (\d+) Hz, (\w+)/);
  const duration = durM ? parseInt(durM[1])*3600 + parseInt(durM[2])*60 + parseInt(durM[3]) : 0;
  return {
    duration,
    codec: audioM?.[1] || 'unknown',
    sampleRate: audioM?.[2] || 'unknown',
    channels: audioM?.[3] || 'unknown'
  };
}

async function describeAudio(videoPathOrUrl) {
  let videoPath = videoPathOrUrl;
  let downloaded = false;
  let audioPath = null;

  if (videoPathOrUrl.startsWith("http://") || videoPathOrUrl.startsWith("https://")) {
    const dest = join(__dirname, `_temp_video_${Date.now()}.mp4`);
    videoPath = await downloadFile(videoPathOrUrl, dest);
    downloaded = true;
  }

  if (!existsSync(videoPath)) throw new Error(`File not found: ${videoPath}`);

  // If already an audio file, analyze directly
  const ext = videoPath.split('.').pop().toLowerCase();
  if (['mp3', 'wav', 'm4a', 'aac', 'ogg', 'flac'].includes(ext)) {
    audioPath = videoPath;
  } else {
    audioPath = extractAudio(videoPath);
  }

  const info = getAudioInfo(audioPath);
  const sizeMB = (readFileSync(audioPath).length / (1024*1024)).toFixed(1);

  let output = `🎵 音频分析\n`;
  output += `时长: ${info.duration}秒 | 编码: ${info.codec} | 采样率: ${info.sampleRate}Hz | 声道: ${info.channels}\n`;
  output += `文件大小: ${sizeMB}MB\n`;

  // Try transcription with faster-whisper
  try {
    const transcribeScript = join(__dirname, "transcribe_audio.py");
    if (existsSync(transcribeScript)) {
      const result = run(`D:/Python312/python.exe "${transcribeScript}" "${audioPath}" tiny`, true);
      const data = JSON.parse(result);
      if (data.segments && data.segments.length > 0) {
        output += `\n📝 语音转文字 (faster-whisper tiny, 语言: ${data.language}):\n`;
        output += data.segments.join('\n');
      }
    }
  } catch (e) {
    output += `\n⚠️ 转录失败: ${e.message}\n`;
  }

  // Cleanup
  if (downloaded && existsSync(videoPath)) rmSync(videoPath);
  if (audioPath !== videoPathOrUrl && existsSync(audioPath)) rmSync(audioPath);

  return output;
}

// --- MCP Server ---
const server = new Server({ name: "minicpm-vision", version: "2.2.0" }, { capabilities: { tools: {} } });

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "describe_image",
      description: "用本地视觉模型（MiniCPM-V 4.6）描述图片内容。传入图片文件的绝对路径。",
      inputSchema: {
        type: "object",
        properties: { path: { type: "string", description: "图片文件的绝对路径" } },
        required: ["path"]
      }
    },
    {
      name: "describe_video",
      description: "分析视频内容：自动提取关键帧，逐帧用视觉模型描述，返回完整时间线总结。支持本地文件路径或 HTTP/HTTPS URL。分析完成后自动清理临时文件。",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "视频文件的绝对路径，或 HTTP/HTTPS URL" },
          interval: { type: "number", description: "提取帧的间隔秒数，默认 8 秒。视频越长间隔应越大" }
        },
        required: ["path"]
      }
    },
    {
      name: "describe_audio",
      description: "提取视频/音频文件的音频轨道，分析音频元数据（时长、编码、采样率等）。支持本地文件路径或 HTTP/HTTPS URL。",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "视频或音频文件的绝对路径，或 HTTP/HTTPS URL" }
        },
        required: ["path"]
      }
    }
  ]
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  try {
    if (req.params.name === "describe_image") {
      const desc = await describeImage(req.params.arguments.path);
      return { content: [{ type: "text", text: desc }] };
    }
    if (req.params.name === "describe_video") {
      const summary = await describeVideo(req.params.arguments.path, req.params.arguments.interval);
      return { content: [{ type: "text", text: summary }] };
    }
    if (req.params.name === "describe_audio") {
      const result = await describeAudio(req.params.arguments.path);
      return { content: [{ type: "text", text: result }] };
    }
    throw new Error(`Unknown tool: ${req.params.name}`);
  } catch (e) {
    return { content: [{ type: "text", text: `Error: ${e.message}` }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
