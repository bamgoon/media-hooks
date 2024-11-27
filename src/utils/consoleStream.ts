function consoleStream(title: string, stream: MediaStream | null) {
  console.group(title);
  console.log("%c스트림:", "color: blue; font-weight: bold;", stream?.id.split("-")[0]);
  const tracks = stream?.getTracks();
  if (tracks && tracks.length >= 0) {
    tracks?.forEach((track, index) => {
      console.log(
        `%c트랙 ${index + 1}:`,
        "color: green; font-style: italic; font-weight: bold;",
        track.id.split("-")[0]
      );
    });
  } else {
    console.log(`%c트랙:`, "color: green; font-style: italic; font-weight: bold;", undefined);
  }
  console.groupEnd();
}

export default consoleStream;
