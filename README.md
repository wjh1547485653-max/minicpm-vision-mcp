# MiniCPM Vision MCP 🎬👁️

为 **DeepSeek V4.0 / Claude Desktop / Cursor** 等 AI Agent 装上眼睛 —— 本地运行的视觉 MCP 服务器，基于 **Ollama + MiniCPM-V 4.6**。

> 图片描述 · 视频帧提取分析 · 完全本地 · 数据不出机

## ✨ 为什么选这个？

| | 本项目 | xkiranj/ollama-vision-mcp | MikeyBeez/mcp-vision |
|---|---|---|---|
| 图片识别 | ✅ | ✅ | ✅ |
| **视频分析** | ✅ 唯一！| ❌ | ❌ |
| 中文模型 | ✅ MiniCPM 原生中文 | ❌ llava 英文为主 | ❌ |
| 安装 | 1 文件，丢进去就行 | Python venv + pip | macOS 限定 |
| Windows | ✅ | ⚠️ | ❌ |
| 自动清理 | ✅ 分析完自动删视频 | ❌ | ❌ |

## 🚀 快速开始

### 1. 安装 Ollama 并拉取模型

```bash
ollama pull minicpm-v4.6
```

### 2. 安装 FFmpeg（视频分析需要）

```bash
npm install @ffmpeg-installer/ffmpeg
```

### 3. 配置 AI Agent

**Claude Desktop** (`claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "vision": {
      "command": "node",
      "args": ["C:\\path\\to\\vision_mcp_server.mjs"]
    }
  }
}
```

**Reasonix** (`reasonix.toml`)：

```toml
[[plugins]]
name    = "vision"
command = "C:\\Program Files\\nodejs\\node.exe"
args    = ["C:\\path\\to\\vision_mcp_server.mjs"]
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
输入: 视频文件路径 或 HTTP/HTTPS URL
      interval (可选): 帧提取间隔秒数，默认 8s
输出: 
  - 每帧的简洁描述
  - 完整时间线分析
  - AI 自动总结 (200字)
  - 分析完成后自动清理临时文件
```

## 📊 视频分析流程

```
URL/文件 → 下载(如需要) → FFmpeg 提取关键帧 → 
MiniCPM-V 逐帧分析 → 汇总总结 → 自动清理
```

## 🔧 依赖

- [Ollama](https://ollama.com) - 本地 LLM 运行时
- [MiniCPM-V 4.6](https://ollama.com/library/minicpm-v4.6) - 开源视觉模型 (1.6GB)
- [FFmpeg](https://ffmpeg.org) - 视频帧提取（`@ffmpeg-installer/ffmpeg`）
- [@modelcontextprotocol/sdk](https://www.npmjs.com/package/@modelcontextprotocol/sdk) - MCP 协议

## 🌍 适用场景

- 📸 让 AI 看懂你发的截图和照片
- 🎬 快速了解视频内容，不用逐秒观看
- 📱 分析抖音/B站等平台视频
- 🔒 敏感图片/视频本地处理，数据不出机
- 🇨🇳 中文内容理解（MiniCPM 原生中文）

## 📄 许可证

MIT License

## 🙏 致谢

- [MiniCPM-V](https://github.com/OpenBMB/MiniCPM-V) - 开源视觉语言模型
- [Ollama](https://ollama.com) - 本地模型运行框架
- [Model Context Protocol](https://modelcontextprotocol.io) - MCP 协议规范
