type ContainerMap = { [key: string]: string };

const containerMap: ContainerMap = {
  webm: "webm",
  mp4: "mp4",
  ogg: "ogg",
  avi: "avi",
  mpeg: "mpeg",
  quicktime: "mov",
  flv: "flv",
  matroska: "mkv",
  msvideo: "avi",
  mp3: "mp3",
  mpegurl: "m3u8",
  dash: "mpd",
  wav: "wav",
  aac: "aac",
  flac: "flac",
  l16: "pcm",
  amr: "amr",
  wma: "wma",
  "shockwave-flash": "swf",
  quicktimeplayer: "mov",
  ts: "ts",
  "3gpp": "3gp",
  "3gpp2": "3g2",
  hevc: "hevc",
  asf: "asf",
  "application/vnd.apple.mpegurl": "m3u8", // Apple HLS
  "audio/ogg": "ogg",
  "audio/webm": "webm",
  "video/x-ms-wmv": "wmv",
  "audio/x-wav": "wav",
  "audio/mpeg": "mp3",
  "audio/mp4": "m4a",
  "video/x-flv": "flv",
  "video/mp2t": "ts",
  "application/x-mpegURL": "m3u8",
  "audio/x-flac": "flac",
  "video/x-matroska": "mkv",
  "audio/amr": "amr",
  "application/dash+xml": "mpd",
  "video/quicktime": "mov",
  opus: "opus",
  alac: "alac",
  pcm: "pcm",
};

function getContainer(mimeType: string): string {
  // MIME 타입에서 주요 컨테이너 키 추출
  const match = mimeType.match(/^[^/]+\/([^;]+)/);

  if (match) {
    const key = match[1].toLowerCase();
    return containerMap[key] || "unknown"; // 매핑되지 않는 경우 "unknown" 반환
  }

  return "unknown"; // 유효하지 않은 MIME 타입인 경우
}

export default getContainer;
