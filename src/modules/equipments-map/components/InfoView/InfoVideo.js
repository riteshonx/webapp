export default function InfoVideo({ style, src }) {
  return (
    <iframe
      width={style?.width || 560}
      height={style?.height || 315}
      src={src || "https://www.youtube.com/embed/AdUw5RdyZxI?mute=1"}
      title="YouTube video player"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    ></iframe>
  );
}
