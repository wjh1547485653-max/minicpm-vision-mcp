# MiniCPM Vision MCP 🎬👁️

Give your **DeepSeek V4.0 / Claude Desktop / Cursor** AI Agent the power of sight — a fully local vision MCP server powered by **Ollama + MiniCPM-V 4.6**.

> Image description · Video frame analysis · 100% local · Your data stays on your machine

## ✨ Why This Project?

| | This Project | xkiranj/ollama-vision-mcp | MikeyBeez/mcp-vision |
|---|---|---|---|
| Image Recognition | ✅ | ✅ | ✅ |
| **Video Analysis** | ✅ Only One! | ❌ | ❌ |
| Chinese Model | ✅ MiniCPM native | ❌ llava English-focused | ❌ |
| Setup | 1 file drop-in | Python venv + pip | macOS only |
| Windows | ✅ | ⚠️ | ❌ |
| Auto Cleanup | ✅ Deletes temp files | ❌ | ❌ |

## 🚀 Quick Start

### 1. Install Ollama & Pull Model

```bash
ollama pull minicpm-v4.6
```

### 2. Install FFmpeg (required for video)

```bash
npm install @ffmpeg-installer/ffmpeg
```

### 3. Configure Your AI Agent

**Claude Desktop** (`claude_desktop_config.json`):

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

Restart your client. Done.

## 🛠️ Tools

### `describe_image` — Describe Images

Input: absolute path to image file. Output: Chinese description.

### `describe_video` — Analyze Videos

Input: video file path or HTTP/HTTPS URL, optional `interval` seconds.
Output: per-frame descriptions + timeline + AI summary + auto cleanup.

## 📊 Video Pipeline

```
URL/File → Download → FFmpeg keyframes → MiniCPM-V per-frame → Summary → Cleanup
```

## 🔧 Dependencies

- [Ollama](https://ollama.com) + [MiniCPM-V 4.6](https://ollama.com/library/minicpm-v4.6)
- [FFmpeg](https://ffmpeg.org) via `@ffmpeg-installer/ffmpeg`
- [@modelcontextprotocol/sdk](https://npmjs.com/package/@modelcontextprotocol/sdk)

## 📄 License

MIT

## 🙏 Acknowledgments

[MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V) · [Ollama](https://ollama.com) · [MCP](https://modelcontextprotocol.io)
