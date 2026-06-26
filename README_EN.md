# MiniCPM Vision MCP 🎬👁️🎵

Give your **DeepSeek V4.0 / Claude Desktop / Cursor** AI Agent sight AND hearing — a fully local vision + audio MCP server powered by **Ollama + MiniCPM-V 4.6 + faster-whisper**.

> Image description · Video frame analysis · Audio transcription · 100% local

## ✨ Why This Project?

| | This Project | xkiranj/ollama-vision-mcp | MikeyBeez/mcp-vision |
|---|---|---|---|
| Image Recognition | ✅ | ✅ | ✅ |
| **Video Analysis** | ✅ Only One! | ❌ | ❌ |
| **Audio Transcription** | ✅ Only One! | ❌ | ❌ |
| Chinese Model | ✅ MiniCPM native | ❌ llava English-focused | ❌ |
| Setup | 1 file drop-in | Python venv + pip | macOS only |
| Windows | ✅ | ⚠️ | ❌ |
| Auto Cleanup | ✅ Deletes temp files | ❌ | ❌ |

## 🛠️ Tools

### `describe_image` — Describe Images
### `describe_video` — Analyze Videos (frames + summary)
### `describe_audio` — Transcribe Audio 🆕 (faster-whisper tiny)

## 🚀 Quick Start

```bash
ollama pull minicpm-v4.6
npm install @ffmpeg-installer/ffmpeg @modelcontextprotocol/sdk
pip install faster-whisper
```

Configure Claude Desktop / Reasonix → restart → done.

## 📄 License

MIT
