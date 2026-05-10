// src/components/AI/DoubtSolver.jsx
import React, { useState, useCallback, useMemo } from 'react';
import { aiService } from '../../services/aiService';

const LANGUAGES = ['javascript','typescript','python','java','c++','c','html/css','sql','php','go','rust','other'];

// ── Markdown-lite renderer (mirrors ChatbotTutor) ───────────────────
const renderContent = (text) => {
  const lines = text.split('\n');
  const elements = [];
  let codeBuffer = [];
  let inCode = false;
  let codeLang = '';
  let key = 0;

  const flush = () => {
    if (!codeBuffer.length) return;
    elements.push(
      <pre key={key++} className="my-3 bg-[#0d1117] border border-[#30363d] rounded-xl overflow-x-auto text-[12.5px] leading-relaxed">
        {codeLang && (
          <div className="px-4 py-1.5 border-b border-[#30363d] text-[11px] font-mono text-[#7ee787] tracking-widest uppercase">{codeLang}</div>
        )}
        <code className="block px-4 py-3 text-[#e6edf3] font-mono whitespace-pre">{codeBuffer.join('\n')}</code>
      </pre>
    );
    codeBuffer = [];
    codeLang = '';
  };

  const inline = (str, k) => {
    const parts = str.split(/(`[^`]+`)/g);
    return (
      <span key={k}>
        {parts.map((p, i) =>
          p.startsWith('`') && p.endsWith('`') && p.length > 2
            ? <code key={i} className="px-1.5 py-0.5 rounded-md bg-[#1e2433] text-[#79c0ff] font-mono text-[12px]">{p.slice(1,-1)}</code>
            : <span key={i} dangerouslySetInnerHTML={{ __html: p
                .replace(/\*\*(.+?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
                .replace(/\*(.+?)\*/g, '<em class="text-[#d2a8ff]">$1</em>')
              }} />
        )}
      </span>
    );
  };

  lines.forEach((line) => {
    if (line.startsWith('```')) {
      if (inCode) { flush(); inCode = false; }
      else { inCode = true; codeLang = line.slice(3).trim(); }
      return;
    }
    if (inCode) { codeBuffer.push(line); return; }

    if (!line.trim()) {
      elements.push(<div key={key++} className="h-2" />);
    } else if (/^#{1,3} /.test(line)) {
      const lvl = line.match(/^#+/)[0].length;
      const txt = line.replace(/^#+\s/, '');
      const cls = lvl === 1
        ? 'text-[15px] font-bold text-white mt-3 mb-1'
        : lvl === 2
          ? 'text-[14px] font-semibold text-[#c9d1d9] mt-2 mb-0.5'
          : 'text-[13px] font-semibold text-[#8b949e] mt-1';
      elements.push(<p key={key++} className={cls}>{txt}</p>);
    } else if (/^[-*•] /.test(line)) {
      elements.push(
        <div key={key++} className="flex gap-2 items-start">
          <span className="text-[#7c5cfc] mt-[4px] text-[10px] flex-shrink-0">▸</span>
          <span className="text-[13.5px] text-[#c9d1d9] leading-relaxed">{inline(line.replace(/^[-*•] /,''), key)}</span>
        </div>
      );
    } else {
      elements.push(
        <p key={key++} className="text-[13.5px] text-[#c9d1d9] leading-relaxed">{inline(line, key)}</p>
      );
    }
  });
  flush();
  return elements;
};

// ── Copy button ─────────────────────────────────────────────────────
const CopyButton = ({ text }) => {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [text]);
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium border transition-all duration-200
        border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#484f58] bg-[#161b26]"
    >
      {copied ? (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#3fb950" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span className="text-[#3fb950]">Copied</span></>
      ) : (
        <><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copy</span></>
      )}
    </button>
  );
};

// ── Main Component ──────────────────────────────────────────────────
const DoubtSolver = ({ userId }) => {
  const [code, setCode]             = useState('');
  const [language, setLanguage]     = useState('javascript');
  const [description, setDescription] = useState('');
  const [solution, setSolution]     = useState('');
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  const handleSubmit = useCallback(async () => {
    const trimmed = code.trim();
    if (!trimmed || isLoading) return;
    setIsLoading(true);
    setSolution('');
    setError('');
    try {
      const response = await aiService.doubtSolver({ code: trimmed, language, description, userId });
      if (response.success) setSolution(response.solution);
      else throw new Error(response.error || 'Unknown error');
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [code, language, description, userId, isLoading]);

  const canSubmit = useMemo(() => !isLoading && code.trim().length > 0, [isLoading, code]);

  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />

      <div
        className="px-4 sm:px-6 py-8 min-h-screen"
        style={{ fontFamily: "'DM Sans', sans-serif", background: '#0d1117' }}
      >
        <div className="max-w-2xl mx-auto space-y-5">

          {/* Page Title */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cfc] to-[#5b8dee] flex items-center justify-center text-white shadow-lg shadow-[#7c5cfc]/25">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
              </svg>
            </div>
            <div>
              <h1 className="text-[16px] font-bold text-white leading-tight">Doubt Solver</h1>
              <p className="text-[12px] text-[#8b949e]">Paste your code and get an instant explanation</p>
            </div>
          </div>

          {/* ── Form Card ─────────────────────────────────────────── */}
          <div className="bg-[#161b26] border border-[#30363d] rounded-2xl p-5 space-y-5">

            {/* Language Picker */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Language
              </label>
              <div className="flex flex-wrap gap-1.5">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all duration-150 ${
                      language === lang
                        ? 'bg-[#7c5cfc]/20 text-[#a78bfa] border border-[#7c5cfc]/40 shadow-sm shadow-[#7c5cfc]/10'
                        : 'bg-[#0d1117] text-[#484f58] border border-[#30363d] hover:text-[#8b949e] hover:border-[#484f58]'
                    }`}
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  Your Code
                </label>
                {code && (
                  <span className="text-[11px] text-[#484f58]" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {code.split('\n').length} lines
                  </span>
                )}
              </div>
              <div className={`relative rounded-xl border overflow-hidden transition-all duration-200 ${
                code ? 'border-[#7c5cfc]/40 shadow-[0_0_20px_rgba(124,92,252,0.08)]' : 'border-[#30363d]'
              }`}>
                {/* Fake gutter */}
                <div className="absolute top-0 left-0 bottom-0 w-10 bg-[#0d1117] border-r border-[#21262d] pointer-events-none z-10" />
                <textarea
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder={'// Paste your code here...\nfunction example() {\n  // ...\n}'}
                  rows={13}
                  spellCheck={false}
                  autoCorrect="off"
                  autoCapitalize="off"
                  className="w-full bg-[#0d1117] pl-14 pr-4 py-4 text-[13px] text-[#e6edf3] placeholder-[#30363d] focus:outline-none resize-none leading-relaxed"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                />
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest flex items-center gap-2" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                Describe the Issue
                <span className="normal-case tracking-normal text-[#484f58] font-normal" style={{ fontFamily: "'DM Sans', sans-serif" }}>— optional</span>
              </label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. Getting a TypeError on line 5, or explain why this doesn't work…"
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[13.5px] text-[#c9d1d9] placeholder-[#484f58] focus:outline-none focus:border-[#7c5cfc]/40 transition-all duration-200"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className={`w-full py-3 rounded-xl text-[14px] font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                canSubmit
                  ? 'bg-gradient-to-r from-[#7c5cfc] to-[#6d4fe0] text-white shadow-lg shadow-[#7c5cfc]/25 hover:shadow-[#7c5cfc]/40 hover:-translate-y-0.5 active:translate-y-0 active:shadow-none'
                  : 'bg-[#21262d] text-[#484f58] cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/25 border-t-white animate-spin" />
                  <span>Analyzing your code…</span>
                </>
              ) : (
                <>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                  Solve My Doubt
                </>
              )}
            </button>
          </div>

          {/* ── Error ─────────────────────────────────────────────── */}
          {error && (
            <div className="bg-[#1a0a0a] border border-red-500/30 rounded-xl px-4 py-3 flex items-start gap-3 animate-fadeUp">
              <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f85149" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <p className="text-[13px] text-[#fca5a5] leading-relaxed">{error}</p>
            </div>
          )}

          {/* ── Solution ──────────────────────────────────────────── */}
          {solution && (
            <div className="bg-[#161b26] border border-[#30363d] rounded-2xl overflow-hidden animate-fadeUp">
              <div className="px-5 py-3 border-b border-[#21262d] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-[#3fb950] shadow-sm shadow-[#3fb950]/50" />
                  <span className="text-[11px] font-semibold text-[#8b949e] uppercase tracking-widest" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    Solution
                  </span>
                </div>
                <CopyButton text={solution} />
              </div>
              <div className="px-5 py-5 space-y-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {renderContent(solution)}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeUp { animation: fadeUp 0.3s ease-out both; }

        .overflow-y-auto::-webkit-scrollbar { width: 4px; }
        .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
        .overflow-y-auto::-webkit-scrollbar-thumb { background: #30363d; border-radius: 99px; }
        .overflow-y-auto::-webkit-scrollbar-thumb:hover { background: #484f58; }
      `}</style>
    </>
  );
};

export default React.memo(DoubtSolver);