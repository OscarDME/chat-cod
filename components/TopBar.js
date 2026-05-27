import Link from "next/link";

export default function TopBar({ active }) {
  return (
    <div className="topbar">
      <Link href="/" className="brand">
        Flujos<small>chat · venta</small>
      </Link>
      <div className="tabs">
        <Link href="/dashboard" className={"tab" + (active === "dashboard" ? " on" : "")}>Dashboard</Link>
        <Link href="/chat" className={"tab" + (active === "chat" ? " on" : "")}>Chat</Link>
      </div>
    </div>
  );
}
