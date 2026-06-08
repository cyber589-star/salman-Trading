"use client";

import { useState, useEffect } from "react";

interface Props {
  lastEarningAt: string;
  onReady?: () => void;
}

export default function CountdownTimer({ lastEarningAt, onReady }: Props) {
  const target = new Date(lastEarningAt).getTime() + 24 * 60 * 60 * 1000;
  const [remaining, setRemaining] = useState(target - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      const r = target - Date.now();
      setRemaining(r);
      if (r <= 0) { clearInterval(id); onReady?.(); }
    }, 1000);
    return () => clearInterval(id);
  }, [target, onReady]);

  if (remaining <= 0) {
    return (
      <div className="text-center">
        <p className="text-emerald-400 font-semibold text-sm">Ready for next earning</p>
        <p className="text-[10px] text-slate-500 mt-0.5">Run daily earnings to claim</p>
      </div>
    );
  }

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 font-mono text-xs">
        {days > 0 && (
          <>
            <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded min-w-[22px] text-center">{pad(days)}</span>
            <span className="text-slate-500">d</span>
          </>
        )}
        <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded min-w-[22px] text-center">{pad(hours)}</span>
        <span className="text-slate-500">:</span>
        <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded min-w-[22px] text-center">{pad(minutes)}</span>
        <span className="text-slate-500">:</span>
        <span className="bg-slate-800 text-slate-200 px-1.5 py-0.5 rounded min-w-[22px] text-center">{pad(seconds)}</span>
      </div>
      <p className="text-[10px] text-slate-500 mt-0.5">until next earning</p>
    </div>
  );
}
