/**
 * =========================================================
 *  Earn Wallet — React Frontend  (Modern UI)
 * ============================================================
 *  Security:
 *   1. Telegram initData HMAC verification on every API call
 *   2. Server-side reward calculation (no client amounts)
 *   3. Balance only updated from server response
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  CONFIG
// ============================================================
const API_URL = "https://www.gajarbotol.site/nirob/api.php"; // Replace with your api.php URL

// ============================================================
//  3D Twemoji icon URLs — high quality, no emojis in nav
// ============================================================
const ICONS = {
  home:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e0.png",
  earn:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b0.png",
  withdraw: "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4e4.png",
  bolt:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/26a1.png",
  gift:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png",
  star:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2b50.png",
  fire:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f525.png",
  chart:    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4c8.png",
  coin:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1fa99.png",
  check:    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2705.png",
  tv:       "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4fa.png",
  bell:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f514.png",
  share:    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f91d.png",
  rocket:   "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f680.png",
  clock:    "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/23f0.png",
  lock:     "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f512.png",
};

// ============================================================
//  GLOBAL CSS
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  :root {
    --bg: #06060f;
    --surface: #0e0e1c;
    --surface2: #15152a;
    --surface3: #1c1c34;
    --text: #f0f0fa;
    --text-dim: #6e6e98;
    --text-mid: #9898c0;
    --border: #1e1e38;
    --border2: #28284a;
    --primary: #6c5ce7;
    --primary2: #a78bfa;
    --primary3: #c4b5fd;
    --blue: #4f8ef7;
    --cyan: #06b6d4;
    --green: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --grad-a: #4f8ef7;
    --grad-b: #7c3aed;
    --grad-c: #a78bfa;
    --radius-lg: 22px;
    --radius-md: 16px;
    --radius-sm: 12px;
  }

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html { background: var(--bg); }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; overflow-x:hidden; }
  #root { max-width:480px; margin:0 auto; min-height:100vh; padding-bottom:100px; position:relative; }

  /* ===================== LOADER ===================== */
  .loader-overlay {
    position:fixed; inset:0; background:var(--bg); z-index:9999;
    display:flex; justify-content:center; align-items:center; flex-direction:column;
    overflow:hidden; transition:opacity 0.55s ease, transform 0.55s ease;
  }
  /* Animated mesh gradient background */
  .loader-mesh {
    position:absolute; inset:0; z-index:0;
    background: radial-gradient(ellipse at 20% 30%, rgba(108,92,231,0.12) 0%, transparent 60%),
                radial-gradient(ellipse at 80% 70%, rgba(79,142,247,0.1) 0%, transparent 60%),
                radial-gradient(ellipse at 50% 90%, rgba(6,182,212,0.08) 0%, transparent 50%);
    animation: meshShift 8s ease-in-out infinite alternate;
  }
  @keyframes meshShift {
    from { filter: hue-rotate(0deg); }
    to { filter: hue-rotate(30deg); }
  }
  /* Floating particles */
  .loader-particle {
    position:absolute; border-radius:50%; pointer-events:none;
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    opacity:0.08; filter:blur(40px);
    animation: particleFloat 8s ease-in-out infinite;
  }
  .lp1 { width:300px;height:300px; top:-80px; left:-80px; animation-duration:7s; }
  .lp2 { width:250px;height:250px; bottom:-60px; right:-60px; animation-delay:2s; animation-duration:9s; }
  .lp3 { width:180px;height:180px; top:40%; right:5%; opacity:0.06; animation-delay:4s; animation-duration:6s; }
  @keyframes particleFloat {
    0%,100% { transform:translate(0,0) scale(1); }
    33% { transform:translate(20px,-15px) scale(1.08); }
    66% { transform:translate(-12px,18px) scale(0.96); }
  }
  .loader-inner {
    position:relative; z-index:2; display:flex; flex-direction:column;
    align-items:center; gap:32px;
  }
  /* Spinner rings */
  .loader-rings { position:relative; width:96px; height:96px; }
  .lr-ring {
    position:absolute; inset:0; border-radius:50%;
    border:2.5px solid transparent;
    animation:ringSpinA 1.4s linear infinite;
  }
  .lr-ring-1 { border-top-color:var(--blue); border-right-color:rgba(79,142,247,0.2); }
  .lr-ring-2 {
    inset:10px; border:2px solid transparent;
    border-bottom-color:var(--primary2); border-left-color:rgba(167,139,250,0.2);
    animation:ringSpinB 2s linear infinite;
  }
  .lr-ring-3 {
    inset:22px; border:2px solid transparent;
    border-top-color:var(--cyan); border-right-color:rgba(6,182,212,0.2);
    animation:ringSpinA 1s linear infinite reverse;
  }
  @keyframes ringSpinA { to { transform: rotate(360deg); } }
  @keyframes ringSpinB { to { transform: rotate(-360deg); } }
  .lr-center {
    position:absolute; inset:32px; border-radius:50%;
    background: linear-gradient(135deg, var(--primary), var(--blue));
    display:flex; align-items:center; justify-content:center;
    box-shadow: 0 0 20px rgba(108,92,231,0.4);
    animation: centerPulse 2s ease-in-out infinite;
  }
  .lr-center img { width:22px; height:22px; filter: brightness(10); }
  @keyframes centerPulse {
    0%,100% { box-shadow: 0 0 20px rgba(108,92,231,0.4); transform:scale(1); }
    50% { box-shadow: 0 0 32px rgba(108,92,231,0.7); transform:scale(1.08); }
  }
  /* Brand name */
  .loader-brand {
    font-size:1.8rem; font-weight:800; letter-spacing:-1px;
    background: linear-gradient(135deg, var(--blue), var(--primary2), var(--cyan));
    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
    background-size:200%; animation:brandShimmer 3s linear infinite;
  }
  @keyframes brandShimmer {
    0% { background-position:0% 50%; }
    100% { background-position:200% 50%; }
  }
  /* Progress bar */
  .loader-progress-wrap { width:220px; display:flex; flex-direction:column; gap:10px; align-items:center; }
  .loader-bar-track {
    width:100%; height:3px; background:var(--surface2); border-radius:10px; overflow:hidden;
  }
  .loader-bar-fill {
    height:100%; width:0%;
    background: linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c));
    border-radius:10px; transition:width 0.5s cubic-bezier(0.4,0,0.2,1);
    background-size:200%; animation:barShimmer 1.5s linear infinite;
  }
  @keyframes barShimmer { 0%{background-position:100%} 100%{background-position:-100%} }
  .loader-pct { font-size:11px; font-weight:700; color:var(--primary2); letter-spacing:0.5px; }
  /* Dots */
  .loader-dots { display:flex; gap:7px; }
  .ld-dot { width:5px; height:5px; border-radius:50%; background:var(--border2); }
  .ld-dot:nth-child(1){animation:dotAnim 1.4s ease-in-out infinite 0s}
  .ld-dot:nth-child(2){animation:dotAnim 1.4s ease-in-out infinite 0.2s}
  .ld-dot:nth-child(3){animation:dotAnim 1.4s ease-in-out infinite 0.4s}
  @keyframes dotAnim { 0%,80%,100%{transform:scale(0.6);opacity:0.3} 40%{transform:scale(1);opacity:1;background:var(--primary2)} }

  /* ===================== TOAST ===================== */
  .toast {
    position:fixed; top:-100px; left:50%; transform:translateX(-50%);
    background:var(--surface2); color:var(--text);
    box-shadow:0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px var(--border2);
    border-radius:100px; padding:12px 22px;
    font-size:0.88rem; font-weight:600;
    display:flex; align-items:center; gap:9px;
    z-index:10000; transition:top 0.4s cubic-bezier(0.175,0.885,0.32,1.275);
    max-width:88%; white-space:nowrap; pointer-events:none;
  }
  .toast.show { top:20px; }
  .toast-icon { width:18px; height:18px; flex-shrink:0; }

  /* ===================== TOP NAV ===================== */
  .top-nav {
    display:flex; justify-content:space-between; align-items:center;
    padding:16px 18px 14px; position:sticky; top:0; z-index:50;
    background: linear-gradient(to bottom, var(--bg) 60%, transparent);
  }
  .user-pill { display:flex; align-items:center; gap:12px; }
  .user-avatar { position:relative; }
  .user-avatar img {
    width:44px; height:44px; border-radius:50%;
    border:2px solid var(--primary); object-fit:cover;
    box-shadow:0 0 0 3px rgba(108,92,231,0.15);
  }
  .avatar-status {
    position:absolute; bottom:1px; right:1px; width:12px; height:12px;
    background:var(--green); border-radius:50%; border:2px solid var(--bg);
    animation:statusPulse 2s ease-in-out infinite;
  }
  @keyframes statusPulse {
    0%,100%{box-shadow:0 0 0 0 rgba(16,185,129,0.4)}
    50%{box-shadow:0 0 0 4px rgba(16,185,129,0)}
  }
  .user-info h3 { font-size:0.95rem; font-weight:700; color:var(--text); }
  .user-info p { font-size:0.7rem; color:var(--text-dim); margin-top:1px; }
  .notif-btn {
    width:40px; height:40px; background:var(--surface2); border:1px solid var(--border2);
    border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:0.2s; position:relative;
  }
  .notif-btn img { width:18px; height:18px; }
  .notif-dot {
    position:absolute; top:7px; right:7px; width:7px; height:7px;
    background:var(--danger); border-radius:50%; border:2px solid var(--bg);
  }
  .notif-btn:active { transform:scale(0.92); }

  /* ===================== PAGES ===================== */
  .page { display:none; padding:0 16px; }
  .page.active {
    display:block;
    animation:pageSlideIn 0.45s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pageSlideIn {
    from { opacity:0; transform:translateY(20px) scale(0.97); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ===================== BALANCE CARD ===================== */
  .balance-card {
    margin: 0 16px 20px;
    background: linear-gradient(135deg, #1a1040 0%, #0d1a40 50%, #0a2040 100%);
    border:1px solid rgba(108,92,231,0.25);
    border-radius:var(--radius-lg); padding:28px 24px 24px;
    position:relative; overflow:hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04) inset;
    animation: cardIn 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes cardIn {
    from { transform:scale(0.9) translateY(16px); opacity:0; }
    to   { transform:scale(1) translateY(0); opacity:1; }
  }
  .bc-glow {
    position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse at 0% 0%, rgba(79,142,247,0.15) 0%, transparent 60%),
                radial-gradient(ellipse at 100% 100%, rgba(108,92,231,0.12) 0%, transparent 60%);
  }
  .bc-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(rgba(255,255,255,.02) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(255,255,255,.02) 1px, transparent 1px);
    background-size: 32px 32px;
  }
  .bc-label {
    font-size:0.68rem; text-transform:uppercase; letter-spacing:2px;
    color:rgba(255,255,255,0.45); font-weight:600; margin-bottom:10px;
    position:relative; z-index:1;
  }
  .bc-amount {
    font-size:3rem; font-weight:800; color:#fff; letter-spacing:-2px; line-height:1;
    position:relative; z-index:1;
  }
  .bc-sym { font-size:1.3rem; font-weight:600; opacity:0.7; letter-spacing:0; }
  .bc-footer {
    display:flex; gap:20px; margin-top:22px; position:relative; z-index:1;
    padding-top:16px; border-top:1px solid rgba(255,255,255,0.08);
  }
  .bc-mini span:first-child { font-size:0.65rem; color:rgba(255,255,255,0.45); font-weight:500; display:block; }
  .bc-mini span:last-child { font-size:0.95rem; color:#fff; font-weight:700; }

  /* ===================== SECTION HEADING ===================== */
  .sec-head {
    font-size:0.85rem; font-weight:700; margin:24px 0 14px;
    display:flex; align-items:center; gap:8px; color:var(--text);
    text-transform:uppercase; letter-spacing:0.8px;
  }
  .sec-head img { width:18px; height:18px; }

  /* ===================== STATS GRID ===================== */
  .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
  .stat-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:16px 14px;
    transition:transform 0.2s, border-color 0.2s;
    animation:fadeUp 0.5s ease both;
  }
  .stat-card:nth-child(1){animation-delay:0.04s}
  .stat-card:nth-child(2){animation-delay:0.08s}
  .stat-card:nth-child(3){animation-delay:0.12s}
  .stat-card:nth-child(4){animation-delay:0.16s}
  @keyframes fadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
  .stat-card:active { transform:scale(0.97); }
  .stat-icon-wrap {
    width:36px; height:36px; border-radius:11px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:12px;
  }
  .stat-icon-wrap img { width:22px; height:22px; }
  .stat-icon-wrap.blue { background:rgba(79,142,247,0.12); }
  .stat-icon-wrap.purple { background:rgba(108,92,231,0.12); }
  .stat-icon-wrap.green { background:rgba(16,185,129,0.12); }
  .stat-icon-wrap.orange { background:rgba(245,158,11,0.12); }
  .stat-card p { font-size:0.7rem; color:var(--text-dim); font-weight:500; margin-bottom:5px; }
  .stat-card h4 { font-size:1.4rem; font-weight:800; letter-spacing:-0.5px; color:var(--text); }

  /* ===================== REFERRAL CARD ===================== */
  .ref-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-lg); padding:20px 18px;
    margin-bottom:18px; position:relative; overflow:hidden;
  }
  .ref-card::before {
    content:''; position:absolute; top:0; left:0; right:0; height:2px;
    background: linear-gradient(90deg, var(--grad-a), var(--grad-b));
  }
  .ref-top { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .ref-icon {
    width:44px; height:44px; border-radius:14px;
    background:rgba(108,92,231,0.14); border:1px solid rgba(108,92,231,0.2);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .ref-icon img { width:24px; height:24px; }
  .ref-title h4 { font-size:0.95rem; font-weight:700; }
  .ref-badge {
    display:inline-flex; align-items:center; gap:4px;
    background:rgba(16,185,129,0.12); border:1px solid rgba(16,185,129,0.25);
    color:var(--green); padding:3px 10px; border-radius:20px;
    font-size:0.7rem; font-weight:700; margin-top:4px;
    animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both 0.3s;
  }
  @keyframes badgePop { from{transform:scale(0)} to{transform:scale(1)} }
  .ref-badge img { width:12px; height:12px; }
  .ref-label { font-size:0.68rem; color:var(--text-dim); font-weight:600; text-transform:uppercase; letter-spacing:1px; margin-bottom:8px; }
  .ref-input-row {
    display:flex; background:var(--surface2); border:1px solid var(--border2);
    border-radius:var(--radius-sm); padding:5px 5px 5px 14px; margin-bottom:12px; align-items:center;
  }
  .ref-inp { flex:1; background:transparent; border:none; color:var(--text-mid); font-size:0.8rem; font-weight:500; outline:none; min-width:0; }
  .btn-copy {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; border:none; padding:9px 15px; border-radius:9px;
    font-size:0.8rem; font-weight:600; cursor:pointer;
    display:flex; align-items:center; gap:6px; transition:0.2s; flex-shrink:0;
    box-shadow:0 3px 12px rgba(79,142,247,0.25);
  }
  .btn-copy img { width:14px; height:14px; filter:brightness(10); }
  .btn-copy:active { transform:scale(0.93); opacity:0.85; }
  .btn-share {
    width:100%; padding:14px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.92rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(108,92,231,0.35); font-family:inherit;
  }
  .btn-share img { width:18px; height:18px; filter:brightness(10); }
  .btn-share:active { transform:scale(0.97); opacity:0.9; }

  /* ===================== ADS ===================== */
  .ad-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; }
  .ad-box {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:18px 14px; text-align:center;
    transition:transform 0.2s, border-color 0.2s;
    animation:fadeUp 0.5s ease both;
  }
  .ad-box:active { transform:scale(0.97); }
  .ad-icon {
    width:48px; height:48px; border-radius:14px;
    background:rgba(79,142,247,0.1); border:1px solid rgba(79,142,247,0.15);
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 12px;
  }
  .ad-icon img { width:26px; height:26px; }
  .ad-box h4 { font-size:0.88rem; font-weight:600; margin-bottom:6px; }
  .ad-counter {
    font-size:0.7rem; background:var(--surface2); border:1px solid var(--border);
    color:var(--text-dim); padding:3px 10px; border-radius:20px;
    display:inline-block; margin-bottom:14px; font-weight:500;
  }
  .ad-btn {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; border:none; padding:10px 0; width:100%;
    border-radius:10px; font-size:0.83rem; font-weight:600; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:6px;
    transition:0.2s; box-shadow:0 3px 12px rgba(79,142,247,0.2); font-family:inherit;
  }
  .ad-btn img { width:14px; height:14px; filter:brightness(10); }
  .ad-btn:active { transform:scale(0.96); opacity:0.85; }
  .ad-btn:disabled {
    background:var(--surface2); color:var(--text-dim); cursor:not-allowed;
    border:1px solid var(--border); box-shadow:none;
  }

  /* ===================== TASKS ===================== */
  .task-list { display:flex; flex-direction:column; gap:10px; }
  .task-item {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:14px 16px;
    display:flex; align-items:center; justify-content:space-between;
    transition:transform 0.2s, border-color 0.2s;
    animation:fadeUp 0.5s ease both;
  }
  .task-item:active { transform:scale(0.99); }
  .task-left { display:flex; align-items:center; gap:14px; }
  .task-thumb {
    width:46px; height:46px; border-radius:var(--radius-sm);
    object-fit:cover; background:var(--surface2); flex-shrink:0;
  }
  .task-info h4 { font-size:0.9rem; font-weight:600; color:var(--text); margin-bottom:4px; }
  .task-reward { font-size:0.76rem; font-weight:700; color:var(--green); }
  .btn-task {
    padding:9px 15px; border-radius:10px; font-size:0.8rem;
    font-weight:600; cursor:pointer; border:none; transition:0.2s;
    white-space:nowrap; font-family:inherit;
  }
  .btn-task-start {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; box-shadow:0 3px 12px rgba(79,142,247,0.22);
  }
  .btn-task-wait { background:var(--surface2); color:var(--text-dim); cursor:not-allowed; border:1px solid var(--border); }
  .btn-task-claim {
    background: linear-gradient(135deg, var(--green), #059669);
    color:#fff; animation:claimPulse 1.2s ease-in-out infinite;
    box-shadow:0 3px 14px rgba(16,185,129,0.3);
  }
  @keyframes claimPulse {
    0%,100%{box-shadow:0 3px 14px rgba(16,185,129,0.3)}
    50%{box-shadow:0 4px 22px rgba(16,185,129,0.6)}
  }

  /* ===================== WITHDRAW ===================== */
  .info-banner {
    background:rgba(79,142,247,0.06); border:1px solid rgba(79,142,247,0.18);
    border-radius:var(--radius-sm); padding:14px 16px;
    display:flex; align-items:flex-start; gap:12px; margin-bottom:16px;
  }
  .info-banner img { width:18px; height:18px; flex-shrink:0; margin-top:1px; }
  .info-banner p { font-size:0.8rem; color:var(--text-mid); line-height:1.65; }
  .info-banner p strong { color:var(--text); }
  .input-wrap { position:relative; margin-bottom:12px; }
  .input-icon { position:absolute; top:50%; transform:translateY(-50%); left:15px; width:16px; height:16px; pointer-events:none; }
  .form-inp {
    width:100%; padding:15px 15px 15px 44px;
    background:var(--surface); border:1px solid var(--border2);
    border-radius:var(--radius-sm); color:var(--text); font-size:0.93rem;
    font-weight:500; outline:none; transition:0.2s; font-family:'Inter',sans-serif;
  }
  .form-inp:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(108,92,231,0.1); }
  .form-inp::placeholder { color:var(--text-dim); opacity:0.8; }
  select.form-inp { appearance:none; cursor:pointer; }
  .btn-submit {
    width:100%; padding:16px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.97rem; font-weight:700; cursor:pointer;
    margin-top:6px; display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(108,92,231,0.3); font-family:'Inter',sans-serif;
  }
  .btn-submit:active { transform:scale(0.98); opacity:0.9; }
  .btn-submit:disabled { background:var(--surface2); box-shadow:none; cursor:not-allowed; color:var(--text-dim); }
  .btn-submit img { width:18px; height:18px; filter:brightness(10); }

  /* ===================== HISTORY ===================== */
  .hist-wrap {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); overflow:hidden;
  }
  .hist-item {
    display:flex; justify-content:space-between; align-items:center;
    padding:14px 16px; border-bottom:1px solid var(--border);
    animation:fadeUp 0.4s ease both;
  }
  .hist-item:last-child { border-bottom:none; }
  .hist-left { display:flex; align-items:center; gap:13px; }
  .hist-icon {
    width:40px; height:40px; border-radius:12px;
    background:var(--surface2); display:flex; align-items:center; justify-content:center;
  }
  .hist-icon img { width:20px; height:20px; }
  .hist-info h4 { font-size:0.88rem; font-weight:600; }
  .hist-info small { font-size:0.7rem; color:var(--text-dim); }
  .hist-right { text-align:right; }
  .hist-amt { font-size:0.92rem; font-weight:700; display:block; margin-bottom:4px; }
  .hist-badge { font-size:0.62rem; padding:2px 8px; border-radius:6px; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; }
  .status-pending  { background:rgba(245,158,11,0.12); color:var(--warning); }
  .status-completed{ background:rgba(16,185,129,0.12); color:var(--green); }
  .status-rejected { background:rgba(239,68,68,0.12); color:var(--danger); }

  /* ===================== BOTTOM NAV ===================== */
  .bottom-nav {
    position:fixed; bottom:16px; left:50%; transform:translateX(-50%);
    width:calc(100% - 30px); max-width:420px;
    background:rgba(14,14,28,0.88); border:1px solid var(--border2);
    padding:6px 8px; border-radius:100px; display:flex; justify-content:space-around;
    z-index:100; box-shadow:0 12px 48px rgba(0,0,0,0.6);
    backdrop-filter:blur(20px); -webkit-backdrop-filter:blur(20px);
  }
  .nav-item {
    display:flex; flex-direction:column; align-items:center; justify-content:center;
    width:72px; height:56px; cursor:pointer; transition:0.25s; gap:3px;
    border-radius:50px; position:relative;
  }
  .nav-item .nav-img {
    width:28px; height:28px; object-fit:contain;
    filter:grayscale(1) brightness(0.35); transition:0.25s;
  }
  .nav-item span { font-size:0.59rem; font-weight:600; color:var(--text-dim); opacity:0; transition:0.2s; }
  .nav-item.active { background:rgba(108,92,231,0.1); }
  .nav-item.active .nav-img { filter:none; transform:scale(1.1); }
  .nav-item.active span { opacity:1; color:var(--primary2); }
  .nav-dot {
    width:4px; height:4px; background:var(--primary2); border-radius:50%;
    position:absolute; bottom:5px; display:none;
    animation:dotPop 0.3s cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes dotPop { from{transform:scale(0)} to{transform:scale(1)} }
  .nav-item.active .nav-dot { display:block; }

  /* ===================== EMPTY STATE ===================== */
  .empty-state { text-align:center; padding:32px 10px; color:var(--text-dim); font-size:0.86rem; }
  .empty-state img { width:40px; height:40px; opacity:0.25; display:block; margin:0 auto 12px; }

  /* ===================== SCROLLBAR ===================== */
  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:transparent; }
  ::-webkit-scrollbar-thumb { background:var(--border2); border-radius:4px; }

  /* ===================== DIVIDER ===================== */
  .divider { height:1px; background:var(--border); margin:4px 0 18px; }
`;

// ============================================================
//  Telegram WebApp
// ============================================================
const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    setHeaderColor: () => {},
    setBackgroundColor: () => {},
    initData: '',
    initDataUnsafe: { user: { id: 'Dev', first_name: 'User', photo_url: '' }, start_param: null },
    HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {} },
    openLink: (u) => window.open(u, '_blank'),
    openTelegramLink: (u) => window.open(u, '_blank'),
};

tg.ready();
tg.expand();
tg.setHeaderColor?.('#06060f');
tg.setBackgroundColor?.('#06060f');

const INIT_DATA = tg.initData || '';

// ============================================================
//  API helper
// ============================================================
async function apiCall(action, method = 'GET', body = null) {
    try {
        let url = `${API_URL}?action=${action}`;
        if (method === 'GET') {
            if (INIT_DATA) url += `&initData=${encodeURIComponent(INIT_DATA)}`;
            if (body) Object.keys(body).forEach(k => (url += `&${k}=${encodeURIComponent(body[k])}`));
        }
        const opts = { method };
        if (method !== 'GET') {
            opts.headers = { 'Content-Type': 'application/json' };
            opts.body = JSON.stringify({ initData: INIT_DATA, ...(body || {}) });
        }
        const res = await fetch(url, opts);
        const data = await res.json();
        if (res.status === 401) {
            showToastGlobal('error', 'Session expired. Please restart the app.');
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

// ============================================================
//  Loader component — no Bengali text, no wallet image
// ============================================================
function Loader({ pct, hiding }) {
    return (
        <div className="loader-overlay" style={hiding ? { opacity: 0, transform: 'scale(1.04)' } : {}}>
            <div className="loader-mesh" />
            <div className="loader-particle lp1" />
            <div className="loader-particle lp2" />
            <div className="loader-particle lp3" />
            <div className="loader-inner">
                <div className="loader-rings">
                    <div className="lr-ring lr-ring-1" />
                    <div className="lr-ring lr-ring-2" />
                    <div className="lr-ring lr-ring-3" />
                    <div className="lr-center">
                        <img src={ICONS.coin} alt="" />
                    </div>
                </div>
                <div className="loader-brand">Earn Wallet</div>
                <div className="loader-progress-wrap">
                    <div className="loader-bar-track">
                        <div className="loader-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="loader-pct">{pct}%</span>
                </div>
                <div className="loader-dots">
                    <div className="ld-dot" /><div className="ld-dot" /><div className="ld-dot" />
                </div>
            </div>
        </div>
    );
}

// ============================================================
//  Toast
// ============================================================
const TOAST_ICONS = {
    success: ICONS.check,
    error:   ICONS.bell,
    warning: ICONS.bolt,
};

function Toast({ type, msg, show }) {
    return (
        <div className={`toast ${show ? 'show' : ''}`}>
            <img className="toast-icon" src={TOAST_ICONS[type] || ICONS.bell} alt="" />
            <span>{msg}</span>
        </div>
    );
}

// ============================================================
//  Home Page
// ============================================================
function HomePage({ appState, onCopy, onShare }) {
    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'টাকা';
    const botUsername = cfg.botUsername || 'YourBotUsername';
    const userId = u.id || '';
    const refLink = `https://t.me/${botUsername}/app?startapp=${userId}`;
    const refBonus = cfg.referralBonus || 0;
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);

    return (
        <div className="page active">
            <div className="stats-grid" style={{ marginTop: 4 }}>
                <div className="stat-card">
                    <div className="stat-icon-wrap blue">
                        <img src={ICONS.tv} alt="" />
                    </div>
                    <p>Ads Watched</p>
                    <h4>{totalAdViews}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap purple">
                        <img src={ICONS.share} alt="" />
                    </div>
                    <p>Total Referrals</p>
                    <h4>{u.referrals || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap green">
                        <img src={ICONS.check} alt="" />
                    </div>
                    <p>Tasks Completed</p>
                    <h4>{u.completedTaskCount || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap orange">
                        <img src={ICONS.coin} alt="" />
                    </div>
                    <p>Total Earned</p>
                    <h4>{(u.totalEarned || 0).toFixed(2)}</h4>
                </div>
            </div>

            <div className="ref-card">
                <div className="ref-top">
                    <div className="ref-icon">
                        <img src={ICONS.rocket} alt="" />
                    </div>
                    <div className="ref-title">
                        <h4>Invite Friends</h4>
                        <div className="ref-badge">
                            <img src={ICONS.gift} alt="" />
                            Earn {refBonus} {sym} per referral!
                        </div>
                    </div>
                </div>
                <div className="ref-label">Your Referral Link</div>
                <div className="ref-input-row">
                    <input className="ref-inp" readOnly value={refLink} onChange={() => {}} />
                    <button className="btn-copy" onClick={() => onCopy(refLink)}>
                        <img src={ICONS.share} alt="" /> Copy
                    </button>
                </div>
                <button className="btn-share" onClick={() => onShare(refLink)}>
                    <img src={ICONS.rocket} alt="" /> Share on Telegram
                </button>
            </div>
        </div>
    );
}

// ============================================================
//  Earn Page
// ============================================================
function EarnPage({ appState, onAdDone, onTaskBegin }) {
    const cfg   = appState.config;
    const u     = appState.user;
    const sym   = cfg.currencySymbol || 'টাকা';
    const now   = Date.now();
    const slots = cfg.adSlots || [];
    const limit = cfg.dailyAdLimit || 10;
    const today = new Date().toISOString().slice(0, 10);
    const tasks = cfg.webTasks || {};
    const pendingTasks = [], completedTasks = [];

    Object.keys(tasks).forEach(k => {
        const t = tasks[k];
        const h = (u.taskHistory && u.taskHistory[k]) || {};
        if (t.type === 'onetime' && h.ts) return;
        let isDone = false;
        if (t.type === 'daily' && h.ts && (now - h.ts) < 86400000) isDone = true;
        if (isDone) completedTasks.push({ k, t, h });
        else pendingTasks.push({ k, t, h });
    });

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.tv} alt="" /> Watch Ads & Earn
            </div>
            {slots.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.tv} alt="" />
                    No ads available right now.
                </div>
            ) : (
                <div className="ad-grid">
                    {slots.map((s, i) => (
                        <AdBox
                            key={s.id} slot={s} index={i}
                            done={u.lastActive === today ? (u.dailyAds?.[s.id] || 0) : 0}
                            limit={limit} onAdDone={onAdDone}
                        />
                    ))}
                </div>
            )}
            <div className="sec-head" style={{ marginTop: 28 }}>
                <img src={ICONS.check} alt="" /> Special Tasks
            </div>
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.chart} alt="" />
                    No tasks available.
                </div>
            ) : (
                <div className="task-list">
                    {[...pendingTasks, ...completedTasks].map(({ k, t, h }) => (
                        <TaskItem key={k} id={k} task={t} history={h} sym={sym} now={now} onBegin={onTaskBegin} />
                    ))}
                </div>
            )}
            <div style={{ height: 10 }} />
        </div>
    );
}

// ============================================================
//  Ad Box
// ============================================================
function AdBox({ slot, index, done, limit, onAdDone }) {
    const [loading, setLoading] = useState(false);
    const maxed = done >= limit;

    async function triggerAd() {
        if (loading || maxed) return;
        setLoading(true);
        tg.HapticFeedback.impactOccurred('light');
        try {
            let providerFunc;
            if (slot.network === 'monetag' && window[`show_${slot.id}`]) {
                providerFunc = window[`show_${slot.id}`]();
            } else if (slot.network === 'gigapub' && window.showGiga) {
                providerFunc = window.showGiga();
            } else {
                alert('Ad network is loading. Please try again.');
                setLoading(false);
                return;
            }
            await providerFunc;
            await onAdDone(slot.id);
            tg.HapticFeedback.notificationOccurred('success');
        } catch {
            // user cancelled
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ad-box" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="ad-icon">
                <img src={ICONS.tv} alt="" />
            </div>
            <h4>Ad {index + 1}</h4>
            <div className="ad-counter">{done}/{limit}</div>
            <button className="ad-btn" onClick={triggerAd} disabled={maxed || loading}>
                {loading ? (
                    <>Loading...</>
                ) : maxed ? (
                    <><img src={ICONS.lock} alt="" /> Done</>
                ) : (
                    <><img src={ICONS.bolt} alt="" /> Watch</>
                )}
            </button>
        </div>
    );
}

// ============================================================
//  Task Item
// ============================================================
function TaskItem({ id, task, history, sym, now, onBegin }) {
    const [state, setState]       = useState('idle');
    const [countdown, setCountdown] = useState(15);
    const timerRef = useRef(null);

    const isDailyDone = task.type === 'daily' && history.ts && (now - history.ts) < 86400000;
    const left = isDailyDone ? (86400000 - (now - history.ts)) : 0;
    const hrs  = Math.floor(left / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);

    function handleStart() {
        tg.openLink(task.url);
        tg.HapticFeedback.impactOccurred('medium');
        setState('waiting');
        let sec = 15;
        setCountdown(sec);
        timerRef.current = setInterval(() => {
            sec--;
            setCountdown(sec);
            if (sec <= 0) { clearInterval(timerRef.current); setState('claim'); }
        }, 1000);
    }

    function handleClaim() {
        onBegin(id, task);
        setState('idle');
    }

    useEffect(() => () => clearInterval(timerRef.current), []);

    const thumbSrc = task.imageUrl || task.iconUrl || (task.icon && !task.icon.startsWith('http') ? null : task.icon) || null;

    return (
        <div className="task-item" style={{ opacity: isDailyDone ? 0.5 : 1 }}>
            <div className="task-left">
                {thumbSrc ? (
                    <img src={thumbSrc} className="task-thumb" alt={task.name} />
                ) : (
                    <div className="task-thumb" style={{
                        display:'flex', alignItems:'center', justifyContent:'center',
                        fontSize:'1.4rem', background:'var(--surface2)'
                    }}>
                        {task.icon || '📋'}
                    </div>
                )}
                <div className="task-info">
                    <h4>{task.name}</h4>
                    <div className="task-reward">+{task.reward} {sym}</div>
                </div>
            </div>
            {isDailyDone ? (
                <button className="btn-task btn-task-wait" disabled>
                    <img src={ICONS.clock} alt="" style={{width:12,height:12}} /> {hrs}h {mins}m
                </button>
            ) : state === 'idle' ? (
                <button className="btn-task btn-task-start" onClick={handleStart}>Start</button>
            ) : state === 'waiting' ? (
                <button className="btn-task btn-task-wait" disabled>{countdown}s</button>
            ) : (
                <button className="btn-task btn-task-claim" onClick={handleClaim}>Claim!</button>
            )}
        </div>
    );
}

// ============================================================
//  Withdraw Page
// ============================================================
function WithdrawPage({ appState, onWithdraw }) {
    const cfg    = appState.config;
    const u      = appState.user;
    const sym    = cfg.currencySymbol || 'টাকা';
    const methods = cfg.withdrawMethods || [];
    const minRef  = cfg.minWithdrawReferrals || 0;

    const [method,     setMethod]     = useState('');
    const [account,    setAccount]    = useState('');
    const [amount,     setAmount]     = useState('');
    const [processing, setProcessing] = useState(false);

    const selectedMethod = methods.find(m => m.name === method) || methods[0];
    const sysMin = parseFloat(selectedMethod?.min || 10);

    const statusMap = { pending:'Pending', completed:'Completed', rejected:'Rejected' };
    const histIcons = {
        completed: ICONS.check,
        rejected:  ICONS.bell,
        pending:   ICONS.clock,
    };
    const histColors = {
        completed: 'var(--green)',
        rejected:  'var(--danger)',
        pending:   'var(--warning)',
    };

    async function handleSubmit() {
        if (processing) return;
        if (u.referrals < minRef) {
            showToastGlobal('warning', `Min ${minRef} referrals needed to withdraw.`);
            tg.HapticFeedback.notificationOccurred('warning');
            return;
        }
        const reqAmt = parseFloat(amount);
        if (!account || account.trim().length < 3) {
            showToastGlobal('error', 'Enter a valid account number.'); return;
        }
        if (!reqAmt || isNaN(reqAmt) || reqAmt < sysMin) {
            showToastGlobal('error', `Minimum withdrawal is ${sysMin} ${sym}.`);
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        if (reqAmt > u.balance) {
            showToastGlobal('error', 'Insufficient balance.');
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        setProcessing(true);
        const ok = await onWithdraw({ userId: u.id, userName: u.firstName, amount: reqAmt, method: method || selectedMethod?.name, account: account.trim() });
        setProcessing(false);
        if (ok) { setAmount(''); setAccount(''); }
    }

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.withdraw} alt="" /> Withdraw
            </div>
            <div className="info-banner">
                <img src={ICONS.bolt} alt="" />
                <div>
                    <p>
                        <strong>Minimum:</strong> {sysMin} {sym} &nbsp;|&nbsp;
                        <strong>Min Referrals:</strong> {minRef}
                    </p>
                </div>
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.coin} alt="" />
                <select className="form-inp" value={method} onChange={e => setMethod(e.target.value)}>
                    {methods.length === 0 && <option value="">No methods available</option>}
                    {methods.map(m => (
                        <option key={m.name} value={m.name}>{m.name} (min {m.min})</option>
                    ))}
                </select>
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.share} alt="" />
                <input className="form-inp" placeholder="Account number / tag" value={account} onChange={e => setAccount(e.target.value)} />
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.coin} alt="" />
                <input className="form-inp" type="number" placeholder="Amount to withdraw" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <button className="btn-submit" onClick={handleSubmit} disabled={processing}>
                {processing
                    ? <><img src={ICONS.clock} alt="" /> Processing...</>
                    : <><img src={ICONS.withdraw} alt="" /> Request Payout</>
                }
            </button>

            <div className="sec-head" style={{ marginTop: 34 }}>
                <img src={ICONS.chart} alt="" /> Recent Transactions
            </div>
            <div className="hist-wrap">
                {(!appState.history || appState.history.length === 0) ? (
                    <div className="empty-state">
                        <img src={ICONS.chart} alt="" />
                        No transactions yet.
                    </div>
                ) : appState.history.map((d, idx) => {
                    const sl = d.status?.toLowerCase() || 'pending';
                    const dt = new Date(d.timestamp);
                    return (
                        <div className="hist-item" key={idx}>
                            <div className="hist-left">
                                <div className="hist-icon">
                                    <img src={histIcons[sl] || ICONS.coin} alt="" style={{ filter: `drop-shadow(0 0 4px ${histColors[sl]||'transparent'})` }} />
                                </div>
                                <div className="hist-info">
                                    <h4>{d.method}</h4>
                                    <small>
                                        {dt.toLocaleDateString()} &middot; {dt.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' })}
                                    </small>
                                </div>
                            </div>
                            <div className="hist-right">
                                <span className="hist-amt">{d.amount} {sym}</span>
                                <span className={`hist-badge status-${sl}`}>{statusMap[sl] || sl}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
            <div style={{ height: 10 }} />
        </div>
    );
}

// ============================================================
//  Global toast ref
// ============================================================
let showToastGlobal = () => {};

// ============================================================
//  App
// ============================================================
export default function App() {
    const tgUser = tg.initDataUnsafe?.user || { id: 'Dev', first_name: 'User', photo_url: '' };

    const [loaderPct,  setLoaderPct]  = useState(0);
    const [loaderHide, setLoaderHide] = useState(false);
    const [appReady,   setAppReady]   = useState(false);
    const [activePage, setActivePage] = useState('home');
    const [toast,      setToast]      = useState({ show: false, type: 'success', msg: '' });
    const [appState,   setAppState]   = useState({
        user: {
            id: tgUser.id,
            firstName: tgUser.first_name,
            photoUrl: tgUser.photo_url || '',
            balance: 0, totalEarned: 0, referrals: 0,
            dailyAds: {}, taskHistory: {}, completedTaskCount: 0,
            lastActive: '',
        },
        config: {},
        history: [],
    });

    const toastTimer = useRef(null);

    const showToast = useCallback((type, msg) => {
        setToast({ show: true, type, msg });
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        clearTimeout(toastTimer.current);
        toastTimer.current = setTimeout(() => setToast(p => ({ ...p, show: false })), 3200);
    }, []);

    useEffect(() => { showToastGlobal = showToast; }, [showToast]);

    function saveLocal(state) {
        try { localStorage.setItem(`app_${state.user.id}`, JSON.stringify(state)); } catch {}
    }

    // ===== INIT =====
    useEffect(() => {
        const cached = localStorage.getItem(`app_${tgUser.id}`);
        if (cached) {
            try { setAppState(JSON.parse(cached)); } catch {}
        }

        // Smooth progress animation
        let pct = 0;
        const ticker = setInterval(() => {
            pct = Math.min(pct + 2, 88);
            setLoaderPct(pct);
        }, 60);

        (async () => {
            try {
                const [config, user] = await Promise.all([
                    apiCall('getConfig'),
                    apiCall('login', 'POST', {
                        id:        tgUser.id,
                        firstName: tgUser.first_name,
                        photoUrl:  tgUser.photo_url || '',
                        refId:     tg.initDataUnsafe?.start_param || '',
                    }),
                ]);
                const hist = await apiCall('getHistory', 'POST', { id: tgUser.id });

                setAppState(prev => {
                    const next = {
                        user: {
                            ...prev.user,
                            ...(user || {}),
                            dailyAds:    user?.dailyAds    || prev.user.dailyAds    || {},
                            taskHistory: user?.taskHistory || prev.user.taskHistory || {},
                        },
                        config:  config || prev.config,
                        history: hist   || prev.history,
                    };
                    saveLocal(next);
                    return next;
                });

                if (config?.adSlots) loadAdScripts(config.adSlots);

                clearInterval(ticker);
                setLoaderPct(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => setAppReady(true), 480);
                }, 420);

            } catch {
                clearInterval(ticker);
                setLoaderPct(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => {
                        setAppReady(true);
                        showToast('error', 'Connection failed. Running in offline mode.');
                    }, 480);
                }, 300);
            }
        })();

        return () => clearInterval(ticker);
    }, []); // eslint-disable-line

    function loadAdScripts(adSlots) {
        adSlots.forEach(s => {
            if (s.network === 'monetag' && !document.querySelector(`script[data-zone="${s.id}"]`)) {
                const sc = document.createElement('script');
                sc.src = '//libtl.com/sdk.js';
                sc.dataset.zone = s.id;
                sc.dataset.sdk  = `show_${s.id}`;
                document.body.appendChild(sc);
            }
        });
    }

    // ===== AD REWARD =====
    async function handleAdDone(slotId) {
        const today = new Date().toISOString().slice(0, 10);
        const res = await apiCall('claimAdReward', 'POST', { slotId });
        if (!res || res.error) {
            showToast('error', res?.error || 'Reward claim failed.');
            return;
        }
        const rwrd = res.reward;
        setAppState(prev => {
            const dailyAds = { ...(prev.user.dailyAds || {}) };
            if (prev.user.lastActive !== today) Object.keys(dailyAds).forEach(k => delete dailyAds[k]);
            dailyAds[slotId] = (dailyAds[slotId] || 0) + 1;
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    dailyAds,
                    lastActive: today,
                },
            };
            saveLocal(next);
            return next;
        });
        showToast('success', `+${rwrd} ${appState.config.currencySymbol || 'টাকা'} reward!`);
    }

    // ===== TASK REWARD =====
    async function handleTaskBegin(id) {
        const res = await apiCall('claimTaskReward', 'POST', { taskId: id });
        if (!res || res.error) {
            showToast('error', res?.error || 'Reward claim failed.');
            return;
        }
        const rwrd = res.reward;
        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance: res.newBalance,
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    taskHistory: { ...(prev.user.taskHistory || {}), [id]: { ts: Date.now() } },
                    completedTaskCount: (prev.user.completedTaskCount || 0) + 1,
                },
            };
            saveLocal(next);
            return next;
        });
        showToast('success', 'Task complete! Reward added.');
        tg.HapticFeedback.notificationOccurred('success');
    }

    // ===== WITHDRAW =====
    async function handleWithdraw(payload) {
        const rData = await apiCall('withdraw', 'POST', payload);
        if (rData?.success) {
            setAppState(prev => {
                const next = { ...prev, user: { ...prev.user, balance: prev.user.balance - payload.amount } };
                saveLocal(next);
                return next;
            });
            const updtHist = await apiCall('getHistory', 'POST', { id: appState.user.id });
            if (updtHist) {
                setAppState(prev => { const n = { ...prev, history: updtHist }; saveLocal(n); return n; });
            }
            showToast('success', 'Withdrawal request submitted!');
            tg.HapticFeedback.notificationOccurred('success');
            return true;
        } else {
            showToast('error', rData?.message || 'Server error. Please try again.');
            return false;
        }
    }

    function handleCopy(link) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => showToast('success', 'Link copied!'));
        } else {
            const tmp = document.createElement('input');
            tmp.value = link;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            showToast('success', 'Link copied!');
        }
        tg.HapticFeedback.notificationOccurred('success');
    }

    function handleShare(link) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('Join now and start earning!')}`);
    }

    function openSupport() {
        if (appState.config.supportLink) tg.openLink(appState.config.supportLink);
        else showToast('warning', 'Support link not configured.');
    }

    async function handleNav(page) {
        setActivePage(page);
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        if (page === 'withdraw') {
            const data = await apiCall('getHistory', 'POST', { id: appState.user.id });
            if (data) {
                setAppState(prev => { const n = { ...prev, history: data }; saveLocal(n); return n; });
            }
        }
    }

    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'টাকা';
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);

    return (
        <>
            <style>{css}</style>

            {!appReady && <Loader pct={loaderPct} hiding={loaderHide} />}
            <Toast type={toast.type} msg={toast.msg} show={toast.show} />

            {appReady && (
                <>
                    {/* Top Nav */}
                    <header className="top-nav">
                        <div className="user-pill">
                            <div className="user-avatar">
                                <img
                                    src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName||'U')}&background=6c5ce7&color=fff&size=88`}
                                    alt={u.firstName}
                                />
                                <div className="avatar-status" />
                            </div>
                            <div className="user-info">
                                <h3>{u.firstName || tgUser.first_name}</h3>
                                <p>ID: {u.id || tgUser.id}</p>
                            </div>
                        </div>
                        <button className="notif-btn" onClick={openSupport} aria-label="Support">
                            <img src={ICONS.bell} alt="Support" />
                            <div className="notif-dot" />
                        </button>
                    </header>

                    {/* Balance Card — only on home */}
                    {activePage === 'home' && (
                        <div className="balance-card">
                            <div className="bc-glow" />
                            <div className="bc-grid" />
                            <div className="bc-label">Total Balance</div>
                            <div className="bc-amount">
                                {(u.balance || 0).toFixed(2)}
                                <span className="bc-sym"> {sym}</span>
                            </div>
                            <div className="bc-footer">
                                <div className="bc-mini">
                                    <span>Total Earned</span>
                                    <span>{(u.totalEarned || 0).toFixed(2)}</span>
                                </div>
                                <div className="bc-mini">
                                    <span>Referrals</span>
                                    <span>{u.referrals || 0}</span>
                                </div>
                                <div className="bc-mini">
                                    <span>Ads Watched</span>
                                    <span>{totalAdViews}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pages */}
                    <main>
                        {activePage === 'home'     && <HomePage     appState={appState} onCopy={handleCopy} onShare={handleShare} />}
                        {activePage === 'earn'     && <EarnPage     appState={appState} onAdDone={handleAdDone} onTaskBegin={handleTaskBegin} />}
                        {activePage === 'withdraw' && <WithdrawPage appState={appState} onWithdraw={handleWithdraw} />}
                    </main>

                    {/* Bottom Nav — 3D Twemoji icons */}
                    <nav className="bottom-nav" aria-label="Main navigation">
                        {[
                            { page:'home',     icon:ICONS.home,     label:'Home' },
                            { page:'earn',     icon:ICONS.earn,     label:'Earn' },
                            { page:'withdraw', icon:ICONS.withdraw, label:'Withdraw' },
                        ].map(({ page, icon, label }) => (
                            <div
                                key={page}
                                className={`nav-item ${activePage === page ? 'active' : ''}`}
                                onClick={() => handleNav(page)}
                                role="button"
                                aria-label={label}
                                tabIndex={0}
                                onKeyDown={e => e.key === 'Enter' && handleNav(page)}
                            >
                                <img className="nav-img" src={icon} alt={label} />
                                <span>{label}</span>
                                <div className="nav-dot" />
                            </div>
                        ))}
                    </nav>
                </>
            )}
        </>
    );
}
