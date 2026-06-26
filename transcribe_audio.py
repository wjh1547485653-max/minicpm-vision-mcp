"""Transcribe audio using faster-whisper tiny model."""
import sys, json
from faster_whisper import WhisperModel

def transcribe(audio_path, model_size="tiny"):
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    segments, info = model.transcribe(audio_path, beam_size=5, language="zh")
    results = []
    for seg in segments:
        results.append(f"[{seg.start:.1f}s-{seg.end:.1f}s] {seg.text.strip()}")
    return {"language": info.language, "duration": info.duration, "segments": results}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python transcribe_audio.py <audio_path> [model_size]"}))
        sys.exit(1)
    audio_path = sys.argv[1]
    model_size = sys.argv[2] if len(sys.argv) > 2 else "tiny"
    result = transcribe(audio_path, model_size)
    print(json.dumps(result, ensure_ascii=False))
