# MiniCPM Vision MCP Docker Image
# Requires: Ollama running on host with minicpm-v4.6 model

FROM node:20-alpine

RUN apk add --no-cache ffmpeg python3 py3-pip && \
    pip3 install --break-system-packages faster-whisper

WORKDIR /app
COPY vision_mcp_server.mjs transcribe_audio.py package.json ./

RUN npm install

EXPOSE 11434
CMD ["node", "vision_mcp_server.mjs"]
