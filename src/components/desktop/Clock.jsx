import { useEffect, useState } from "react";

export default function Clock({ withDate = false }) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000 * 15);
    return () => clearInterval(id);
  }, []);

  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (!withDate) return <span>{time}</span>;

  const date = now.toLocaleDateString([], { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  return <span>{time} — {date}</span>;
}
