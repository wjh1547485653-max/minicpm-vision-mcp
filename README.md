# MiniCPM Vision MCP 🎬👁️🎵

为 **DeepSeek V4.0 等单模态大模型** 装上眼睛和耳朵 —— 本地运行的视觉+音频 MCP 服务器，基于 **Ollama + MiniCPM-V 4.6 + faster-whisper**。

> 图片描述 · 视频帧分析 · 音频语音转文字 · 完全本地 · 数据不出机

## ✨ 为什么选这个？

| | 本项目 | xkiranj/ollama-vision-mcp | MikeyBeez/mcp-vision |
|---|---|---|---|
| 图片识别 | ✅ | ✅ | ✅ |
| **视频分析** | ✅ 唯一！| ❌ | ❌ |
| **音频转录** | ✅ 唯一！| ❌ | ❌ |
| 中文模型 | ✅ MiniCPM 原生中文 | ❌ llava 英文为主 | ❌ |
| 安装 | 1 文件，丢进去就行 | Python venv + pip | macOS 限定 |
| Windows | ✅ | ⚠️ | ❌ |
| 自动清理 | ✅ 分析完自动删视频 | ❌ | ❌ |

## 🚀 快速开始

### 1. 安装 Ollama 并拉取模型

```bash
ollama pull minicpm-v4.6
```

### 2. 安装依赖

```bash
npm install @ffmpeg-installer/ffmpeg @modelcontextprotocol/sdk
pip install faster-whisper
```

### 3. 配置 AI Agent

**Claude Desktop** (`claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "vision": {
      "command": "node",
      "args": ["/path/to/vision_mcp_server.mjs"]
    }
  }
}
```

**Reasonix** (`reasonix.toml`)：

```toml
[[plugins]]
name    = "vision"
command = "node"
args    = ["/path/to/vision_mcp_server.mjs"]
```

重启客户端即可使用。

## 🛠️ 工具

### `describe_image` — 描述图片

```
输入: 图片文件的绝对路径
输出: 中文图片内容描述
```

### `describe_video` — 分析视频

```
输入: 视频文件路径 或 HTTP/HTTPS URL, interval (可选)
输出: 时间线帧描述 + AI 总结 + 自动清理
```

### `describe_audio` — 音频转文字 🆕

```
输入: 视频/音频文件路径 或 URL
输出: 音频元数据 + faster-whisper 语音转文字
```

## 📊 视频分析流程

```
URL/文件 → 下载 → FFmpeg 提取关键帧 → MiniCPM-V 逐帧分析 → 汇总总结 → 自动清理
```

## 🔧 依赖

- [Ollama](https://ollama.com) + [MiniCPM-V 4.6](https://ollama.com/library/minicpm-v4.6)
- [FFmpeg](https://ffmpeg.org) via `@ffmpeg-installer/ffmpeg`
- [faster-whisper](https://github.com/SYSTRAN/faster-whisper) for audio transcription
- [@modelcontextprotocol/sdk](https://npmjs.com/package/@modelcontextprotocol/sdk)

## 🌍 适用场景

- 📸 让 DeepSeek 等纯文本模型看懂截图和照片
- 🎬 快速了解视频内容，不用逐秒观看
- 🎵 提取视频中的语音并转文字
- 📱 分析抖音/B站等平台视频
- 🔒 敏感图片/视频本地处理，数据不出机
- 🇨🇳 中文内容理解（MiniCPM 原生中文）

## 📄 许可证

MIT License

## 🙏 致谢

- [MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V) · [Ollama](https://ollama.com) · [faster-whisper](https://github.com/SYSTRAN/faster-whisper) · [MCP](https://modelcontextprotocol.io)
