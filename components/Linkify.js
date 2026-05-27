export default function Linkify({ text }) {
  const parts = String(text || "").split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p)
          ? <a key={i} href={p} target="_blank" rel="noreferrer">{p}</a>
          : <span key={i}>{p}</span>
      )}
    </>
  );
}
