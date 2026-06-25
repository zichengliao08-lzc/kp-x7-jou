"use client";

import { useState, useEffect } from "react";

const TIPS = [
  "今天只需要做好一件事。把它写下来，然后先做它。",
  "会议占满日程不等于工作有产出。今天结束前，问问自己：我推进了什么？",
  "INFP 的超能力是共情和深度思考。今天找一个机会用上它。",
  "不聚焦不是懒，是还没找到锚点。今天的锚点是什么？",
  "你不需要变成 J 人，你只需要今天比昨天多完成一件重要的事。",
  "把最难的事放在上午精力最好的时候。下午留给会议和回复。",
  "完成比完美更重要。先把草稿写出来。",
  "每天结束时记录一件做得好的事，不管多小。",
  "感到分散时，关掉所有通知，给自己 25 分钟专注时间。",
  "你的直觉是数据，不是干扰。相信它，然后验证它。",
];

type Priority = { text: string; done: boolean };

type DayEntry = {
  date: string;
  priorities: Priority[];
  mood: number;
  energy: number;
  tip: string;
  note: string;
};

function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  return {
    full: `${d.getFullYear()} 年 ${d.getMonth() + 1} 月 ${d.getDate()} 日`,
    weekday: weekdays[d.getDay()],
  };
}

function loadEntry(date: string): DayEntry {
  if (typeof window === "undefined") return makeEmpty(date);
  const raw = localStorage.getItem(`dc_${date}`);
  if (raw) return JSON.parse(raw);
  return makeEmpty(date);
}

function makeEmpty(date: string): DayEntry {
  return {
    date,
    priorities: [],
    mood: 7,
    energy: 7,
    tip: TIPS[Math.floor(Math.random() * TIPS.length)],
    note: "",
  };
}

function saveEntry(entry: DayEntry) {
  localStorage.setItem(`dc_${entry.date}`, JSON.stringify(entry));
}

function getMoodEmoji(v: number) {
  if (v <= 2) return "😞";
  if (v <= 4) return "😕";
  if (v <= 6) return "😐";
  if (v <= 8) return "🙂";
  return "😊";
}

function getEnergyEmoji(v: number) {
  if (v <= 2) return "🪫";
  if (v <= 4) return "😮‍💨";
  if (v <= 6) return "😑";
  if (v <= 8) return "✨";
  return "⚡️";
}

function getMoodBg(v: number) {
  if (v <= 3) return "#ecddd8";
  if (v <= 6) return "#faf8f4";
  return "#ddeade";
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(getTodayKey());
  const [entry, setEntry] = useState<DayEntry | null>(null);
  const [newPriority, setNewPriority] = useState("");
  const [saved, setSaved] = useState(false);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    setEntry(loadEntry(currentDate));
    setAnimKey((k) => k + 1);
  }, [currentDate]);

  useEffect(() => {
    if (!entry) return;
    saveEntry(entry);
    setSaved(true);
    const t = setTimeout(() => setSaved(false), 1200);
    return () => clearTimeout(t);
  }, [entry]);

  if (!entry) return null;

  const { full, weekday } = formatDate(currentDate);
  const today = getTodayKey();
  const isToday = currentDate === today;

  function goDay(delta: number) {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + delta);
    const next = d.toISOString().slice(0, 10);
    if (next <= today) setCurrentDate(next);
  }

  function addPriority() {
    if (!newPriority.trim()) return;
    setEntry((e) =>
      e ? { ...e, priorities: [...e.priorities, { text: newPriority.trim(), done: false }] } : e
    );
    setNewPriority("");
  }

  function togglePriority(i: number) {
    setEntry((e) => {
      if (!e) return e;
      const priorities = e.priorities.map((p, idx) =>
        idx === i ? { ...p, done: !p.done } : p
      );
      return { ...e, priorities };
    });
  }

  function removePriority(i: number) {
    setEntry((e) =>
      e ? { ...e, priorities: e.priorities.filter((_, idx) => idx !== i) } : e
    );
  }

  return (
    <main
      className="min-h-screen flex flex-col items-center py-12 px-4 transition-colors duration-1000"
      style={{ backgroundColor: getMoodBg(entry.mood) }}
    >
      {/* 顶部导航 */}
      <div className="flex items-center gap-6 mb-8 fade-in">
        <button
          onClick={() => goDay(-1)}
          className="text-xl opacity-30 hover:opacity-80 transition-opacity cursor-pointer"
          style={{ color: "var(--ink)" }}
        >
          ‹
        </button>
        <div className="text-center">
          <div
            className="text-xs tracking-widest uppercase mb-1 font-sans"
            style={{ color: "var(--ink-light)" }}
          >
            {weekday}{isToday ? " · 今天" : ""}
          </div>
          <div className="text-base" style={{ color: "var(--ink)" }}>
            {full}
          </div>
        </div>
        <button
          onClick={() => goDay(1)}
          className="text-xl transition-opacity cursor-pointer"
          style={{
            color: "var(--ink)",
            opacity: currentDate >= today ? 0.1 : 0.3,
            cursor: currentDate >= today ? "default" : "pointer",
          }}
          disabled={currentDate >= today}
        >
          ›
        </button>
      </div>

      {/* 日记纸 */}
      <div
        key={animKey}
        className="fade-in w-full max-w-lg rounded-2xl p-8 shadow-sm"
        style={{
          backgroundColor: "var(--paper)",
          border: "1px solid var(--border)",
        }}
      >
        {/* 今日提点 */}
        <div
          className="rounded-xl p-4 mb-8"
          style={{
            backgroundColor: "var(--accent-soft)",
            transform: "rotate(-0.4deg)",
          }}
        >
          <div
            className="text-xs tracking-widest uppercase mb-2 font-sans"
            style={{ color: "var(--accent)" }}
          >
            今日提点
          </div>
          <p className="text-sm leading-relaxed" style={{ color: "var(--ink)" }}>
            {entry.tip}
          </p>
        </div>

        {/* 今日重点 */}
        <section className="mb-8">
          <div
            className="text-xs tracking-widest uppercase mb-4 font-sans"
            style={{ color: "var(--ink-light)" }}
          >
            今日重点
          </div>

          {entry.priorities.length === 0 && (
            <p className="text-sm mb-4" style={{ color: "var(--ink-light)", opacity: 0.5 }}>
              还没有添加今日重点
            </p>
          )}

          <div className="space-y-3 mb-4">
            {entry.priorities.map((p, i) => (
              <div key={i} className="flex items-center gap-3 group slide-in">
                <button
                  onClick={() => togglePriority(i)}
                  className="w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: p.done ? "var(--sage)" : "var(--border)",
                    backgroundColor: p.done ? "var(--sage)" : "transparent",
                  }}
                >
                  {p.done && <span className="text-white text-xs leading-none">✓</span>}
                </button>
                <span
                  className="flex-1 text-sm transition-all duration-200"
                  style={{
                    color: p.done ? "var(--ink-light)" : "var(--ink)",
                    textDecoration: p.done ? "line-through" : "none",
                    opacity: p.done ? 0.5 : 1,
                  }}
                >
                  {p.text}
                </span>
                <button
                  onClick={() => removePriority(i)}
                  className="opacity-0 group-hover:opacity-25 hover:!opacity-60 text-base transition-opacity"
                  style={{ color: "var(--ink)" }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addPriority()}
              placeholder="添加一件重要的事..."
              className="flex-1 text-sm bg-transparent outline-none border-b py-1"
              style={{
                borderColor: "var(--border)",
                color: "var(--ink)",
              }}
            />
            <button
              onClick={addPriority}
              className="text-xs px-3 py-1 rounded-lg transition-colors"
              style={{
                backgroundColor: "var(--accent-soft)",
                color: "var(--accent)",
              }}
            >
              添加
            </button>
          </div>
        </section>

        {/* 今日心情 */}
        <section className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <div
              className="text-xs tracking-widest uppercase font-sans"
              style={{ color: "var(--ink-light)" }}
            >
              今日心情
            </div>
            <span className="text-xl">{getMoodEmoji(entry.mood)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={entry.mood}
            onChange={(e) => setEntry((en) => en && { ...en, mood: Number(e.target.value) })}
            className="w-full"
            style={{
              background: `linear-gradient(to right, var(--blush) ${(entry.mood - 1) * 11.1}%, var(--border) ${(entry.mood - 1) * 11.1}%)`,
            }}
          />
          <div className="flex justify-between text-xs mt-1 font-sans" style={{ color: "var(--ink-light)", opacity: 0.4 }}>
            <span>很低落</span>
            <span>{entry.mood} / 10</span>
            <span>很开心</span>
          </div>
        </section>

        {/* 能量值 */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div
              className="text-xs tracking-widest uppercase font-sans"
              style={{ color: "var(--ink-light)" }}
            >
              能量值
            </div>
            <span className="text-xl">{getEnergyEmoji(entry.energy)}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={entry.energy}
            onChange={(e) => setEntry((en) => en && { ...en, energy: Number(e.target.value) })}
            className="w-full"
            style={{
              background: `linear-gradient(to right, var(--accent) ${(entry.energy - 1) * 11.1}%, var(--border) ${(entry.energy - 1) * 11.1}%)`,
            }}
          />
          <div className="flex justify-between text-xs mt-1 font-sans" style={{ color: "var(--ink-light)", opacity: 0.4 }}>
            <span>电量耗尽</span>
            <span>{entry.energy} / 10</span>
            <span>满血状态</span>
          </div>
        </section>

        {/* 随手记 */}
        <section>
          <div
            className="text-xs tracking-widest uppercase mb-3 font-sans"
            style={{ color: "var(--ink-light)" }}
          >
            随手记
          </div>
          <textarea
            value={entry.note}
            onChange={(e) => setEntry((en) => en && { ...en, note: e.target.value })}
            placeholder="今天有什么想说的..."
            rows={3}
            className="w-full bg-transparent outline-none text-sm leading-relaxed resize-none"
            style={{
              color: "var(--ink)",
              borderBottom: "1px solid var(--border)",
              paddingBottom: "8px",
            }}
          />
        </section>
      </div>

      {/* 保存提示 */}
      <div
        className="mt-4 text-xs font-sans transition-opacity duration-500"
        style={{ color: "var(--ink-light)", opacity: saved ? 1 : 0 }}
      >
        已自动保存 ✓
      </div>
    </main>
  );
}
