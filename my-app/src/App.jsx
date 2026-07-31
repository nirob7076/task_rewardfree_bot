/**
 * ============================================================
 *  Earn Wallet — React Frontend (Modern Premium UI)
 *  Language: Bengali (Bangla)
 *  API: https://www.gajarbotol.site/nirob/api.php
 * ============================================================
 *  Security:
 *   1. Telegram initData HMAC verification on every API call
 *   2. Server-side reward calculation (no client amounts)
 *   3. Balance only updated from server response
 *   4. Spam protection: buttons disabled until server response
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  CONFIG
// ============================================================
const API_URL = "https://www.gajarbotol.site/nirob/api.php";

// ============================================================
//  3D Twemoji icons (only for navigation and small icons)
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
//  GLOBAL CSS — Premium Modern Design (with loader progress)
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  :root {
    --bg: #05050e;
    --surface: #0b0b1a;
    --surface2: #13132a;
    --surface3: #1a1a3a;
    --text: #f0f0fa;
    --text-dim: #6a6a96;
    --text-mid: #9494c0;
    --border: #1a1a3a;
    --border2: #25254a;
    --primary: #7c3aed;
    --primary2: #a78bfa;
    --primary3: #c4b5fd;
    --blue: #4f8ef7;
    --cyan: #06b6d4;
    --green: #10b981;
    --warning: #f59e0b;
    --danger: #ef4444;
    --grad-a: #7c3aed;
    --grad-b: #4f8ef7;
    --grad-c: #a78bfa;
    --radius-lg: 24px;
    --radius-md: 16px;
    --radius-sm: 12px;
    --glow-purple: 0 0 60px rgba(124,58,237,0.5);
    --glow-purple-strong: 0 0 90px rgba(124,58,237,0.7);
  }

  * { margin:0; padding:0; box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
  html { background: var(--bg); }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; overflow-x:hidden; }
  #root { max-width:480px; margin:0 auto; min-height:100vh; padding-bottom:100px; position:relative; }

  /* ===================== LOADER — Premium Lightning + Progress Bar ===================== */
  .loader-overlay {
    position:fixed; inset:0; background:var(--bg); z-index:9999;
    display:flex; flex-direction:column;
    justify-content:center; align-items:center;
    transition:opacity 0.6s ease, transform 0.6s ease;
  }
  .loader-bg-glow {
    position:absolute; inset:0;
    background: radial-gradient(ellipse at center, rgba(124,58,237,0.15) 0%, transparent 60%);
    animation: pulseGlow 2.5s ease-in-out infinite alternate;
  }
  @keyframes pulseGlow {
    0% { opacity:0.5; transform:scale(1); }
    100% { opacity:1; transform:scale(1.2); }
  }
  .loader-lightning-container {
    position:relative; z-index:2;
    display:flex; align-items:center; justify-content:center;
  }
  .lightning-svg {
    width:120px; height:120px;
    filter: drop-shadow(0 0 40px rgba(124,58,237,0.8)) drop-shadow(0 0 80px rgba(79,142,247,0.4));
    animation: lightningRotate 4s ease-in-out infinite alternate;
  }
  @keyframes lightningRotate {
    0% { transform: rotate(-5deg) scale(1); }
    100% { transform: rotate(5deg) scale(1.08); }
  }
  /* Spark particles */
  .spark {
    position:absolute; border-radius:50%;
    background: radial-gradient(circle, rgba(167,139,250,0.9), transparent 70%);
    animation: sparkFloat 2s ease-in-out infinite alternate;
  }
  .spark1 { width:8px; height:8px; top:-30px; right:-20px; animation-delay:0s; }
  .spark2 { width:6px; height:6px; bottom:-25px; left:-15px; animation-delay:0.5s; }
  .spark3 { width:10px; height:10px; top:20px; right:-40px; animation-delay:1s; }
  .spark4 { width:5px; height:5px; bottom:10px; left:-35px; animation-delay:1.5s; }
  .spark5 { width:7px; height:7px; top:-10px; left:-30px; animation-delay:0.3s; }
  @keyframes sparkFloat {
    0% { transform:translate(0,0) scale(0.5); opacity:0.3; }
    100% { transform:translate(15px,-20px) scale(1.5); opacity:1; }
  }

  /* Loader Progress Bar – New */
  .loader-progress-wrap {
    position:relative; z-index:2;
    margin-top:40px;
    display:flex; flex-direction:column; align-items:center; gap:14px;
    width:80%; max-width:260px;
  }
  .loader-progress-bar {
    width:100%; height:6px;
    background:rgba(255,255,255,0.07);
    border-radius:10px;
    overflow:hidden;
    box-shadow:inset 0 1px 2px rgba(0,0,0,0.4);
  }
  .loader-progress-fill {
    height:100%;
    background:linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c));
    border-radius:10px;
    transition:width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow:0 0 20px rgba(124,58,237,0.4);
    width:0%;
  }
  .loader-progress-text {
    font-size:0.9rem; font-weight:600;
    color:var(--text-mid); letter-spacing:0.5px;
  }
  .loader-progress-text span {
    color:#fff; font-weight:800;
  }

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
    font-family:'Inter',sans-serif;
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
    box-shadow:0 0 0 3px rgba(124,58,237,0.25), 0 0 30px rgba(124,58,237,0.15);
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
  .user-info h3 { font-size:0.95rem; font-weight:700; }
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
    animation:pageSlideIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both;
  }
  @keyframes pageSlideIn {
    from { opacity:0; transform:translateY(24px) scale(0.96); }
    to   { opacity:1; transform:translateY(0) scale(1); }
  }

  /* ===================== BALANCE CARD — Ultra Bright Glow ===================== */
  .balance-card {
    margin: 0 16px 20px;
    background: linear-gradient(145deg, #0d0d2b 0%, #1a0a3a 40%, #0a1a4a 80%, #0d0d2b 100%);
    border:1px solid rgba(124,58,237,0.5);
    border-radius:var(--radius-lg); padding:28px 24px 24px;
    position:relative; overflow:hidden;
    box-shadow: var(--glow-purple), 0 0 0 1px rgba(124,58,237,0.2) inset;
    animation: cardGlowIn 0.9s cubic-bezier(0.34,1.56,0.64,1) both;
    transition:box-shadow 0.6s;
  }
  .balance-card:hover {
    box-shadow: var(--glow-purple-strong), 0 0 0 2px rgba(124,58,237,0.3) inset;
  }
  @keyframes cardGlowIn {
    from { transform:scale(0.85) translateY(30px); opacity:0; box-shadow:0 0 0 rgba(124,58,237,0); }
    to   { transform:scale(1) translateY(0); opacity:1; box-shadow:var(--glow-purple); }
  }
  .bc-glow {
    position:absolute; inset:0; pointer-events:none;
    background: radial-gradient(ellipse at 20% 10%, rgba(124,58,237,0.4) 0%, transparent 50%),
                radial-gradient(ellipse at 80% 90%, rgba(79,142,247,0.3) 0%, transparent 50%),
                radial-gradient(ellipse at 50% 50%, rgba(167,139,250,0.1) 0%, transparent 40%);
    animation: glowDrift 7s ease-in-out infinite alternate;
  }
  @keyframes glowDrift {
    0% { opacity:0.6; transform:scale(1) rotate(-2deg); }
    100% { opacity:1; transform:scale(1.08) rotate(2deg); }
  }
  .bc-grid {
    position:absolute; inset:0; pointer-events:none;
    background-image: linear-gradient(rgba(124,58,237,0.06) 1px, transparent 1px),
                      linear-gradient(90deg, rgba(124,58,237,0.06) 1px, transparent 1px);
    background-size: 28px 28px;
    opacity:0.6;
  }
  .bc-label {
    font-size:0.68rem; text-transform:uppercase; letter-spacing:3px;
    color:rgba(167,139,250,0.8); font-weight:700; margin-bottom:10px;
    position:relative; z-index:1;
  }
  .bc-amount {
    font-size:3.2rem; font-weight:900; color:#fff; letter-spacing:-2px; line-height:1;
    position:relative; z-index:1;
    text-shadow:0 0 60px rgba(124,58,237,0.3);
  }
  .bc-sym { font-size:1.3rem; font-weight:600; opacity:0.7; }
  .bc-footer {
    display:flex; gap:20px; margin-top:22px; position:relative; z-index:1;
    padding-top:16px; border-top:1px solid rgba(124,58,237,0.2);
  }
  .bc-mini span:first-child {
    font-size:0.65rem; color:rgba(167,139,250,0.6); font-weight:600; display:block;
  }
  .bc-mini span:last-child { font-size:0.95rem; color:#fff; font-weight:700; }

  /* ===================== SECTION HEADING ===================== */
  .sec-head {
    font-size:0.9rem; font-weight:700; margin:24px 0 14px;
    display:flex; align-items:center; gap:8px; color:var(--text);
    text-transform:uppercase; letter-spacing:0.5px;
  }
  .sec-head img { width:18px; height:18px; }

  /* ===================== STATS GRID ===================== */
  .stats-grid { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:18px; }
  .stat-card {
    background:var(--surface); border:1px solid var(--border);
    border-radius:var(--radius-md); padding:16px 14px;
    transition:transform 0.25s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s, box-shadow 0.3s;
    animation: cardJump 0.7s cubic-bezier(0.34,1.56,0.64,1) both;
    cursor:default;
  }
  .stat-card:nth-child(1){ animation-delay:0.04s; }
  .stat-card:nth-child(2){ animation-delay:0.10s; }
  .stat-card:nth-child(3){ animation-delay:0.16s; }
  .stat-card:nth-child(4){ animation-delay:0.22s; }
  @keyframes cardJump {
    0% { opacity:0; transform:translateY(30px) scale(0.92) rotate(-1deg); }
    30% { transform:translateY(-10px) scale(1.03) rotate(0.5deg); }
    60% { transform:translateY(4px) scale(0.99) rotate(-0.2deg); }
    100% { opacity:1; transform:translateY(0) scale(1) rotate(0deg); }
  }
  .stat-card:hover {
    transform:translateY(-6px) scale(1.02);
    border-color:rgba(124,58,237,0.4);
    box-shadow:0 10px 30px rgba(124,58,237,0.1);
  }
  .stat-card:active { transform:scale(0.96) translateY(0); }
  .stat-icon-wrap {
    width:36px; height:36px; border-radius:11px;
    display:flex; align-items:center; justify-content:center;
    margin-bottom:12px;
  }
  .stat-icon-wrap img { width:22px; height:22px; }
  .stat-icon-wrap.blue { background:rgba(79,142,247,0.12); }
  .stat-icon-wrap.purple { background:rgba(124,58,237,0.12); }
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
    content:''; position:absolute; top:0; left:0; right:0; height:2.5px;
    background: linear-gradient(90deg, var(--grad-a), var(--grad-b), var(--grad-c));
  }
  .ref-top { display:flex; align-items:center; gap:14px; margin-bottom:16px; }
  .ref-icon {
    width:44px; height:44px; border-radius:14px;
    background:rgba(124,58,237,0.14); border:1px solid rgba(124,58,237,0.2);
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
    box-shadow:0 3px 12px rgba(124,58,237,0.25);
  }
  .btn-copy img { width:14px; height:14px; filter:brightness(10); }
  .btn-copy:active { transform:scale(0.93); opacity:0.85; }
  .btn-copy:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-share {
    width:100%; padding:14px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.92rem; font-weight:700; cursor:pointer;
    display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(124,58,237,0.35);
  }
  .btn-share img { width:18px; height:18px; filter:brightness(10); }
  .btn-share:active { transform:scale(0.97); opacity:0.9; }
  .btn-share:disabled { opacity:0.6; cursor:not-allowed; }

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
    transition:0.2s; box-shadow:0 3px 12px rgba(124,58,237,0.2);
  }
  .ad-btn img { width:14px; height:14px; filter:brightness(10); }
  .ad-btn:active:not(:disabled) { transform:scale(0.96); opacity:0.85; }
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
    white-space:nowrap;
  }
  .btn-task-start {
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; box-shadow:0 3px 12px rgba(124,58,237,0.22);
  }
  .btn-task-start:disabled { opacity:0.6; cursor:not-allowed; }
  .btn-task-wait { background:var(--surface2); color:var(--text-dim); cursor:not-allowed; border:1px solid var(--border); }
  .btn-task-claim {
    background: linear-gradient(135deg, var(--green), #059669);
    color:#fff; animation:claimPulse 1.2s ease-in-out infinite;
    box-shadow:0 3px 14px rgba(16,185,129,0.3);
  }
  .btn-task-claim:disabled { opacity:0.6; cursor:not-allowed; animation:none; }
  @keyframes claimPulse {
    0%,100%{box-shadow:0 3px 14px rgba(16,185,129,0.3)}
    50%{box-shadow:0 4px 22px rgba(16,185,129,0.6)}
  }

  /* ===================== WITHDRAW ===================== */
  .info-banner {
    background:rgba(124,58,237,0.06); border:1px solid rgba(124,58,237,0.18);
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
    font-weight:500; outline:none; transition:0.2s;
  }
  .form-inp:focus { border-color:var(--primary); box-shadow:0 0 0 3px rgba(124,58,237,0.1); }
  .form-inp::placeholder { color:var(--text-dim); opacity:0.8; }
  select.form-inp { appearance:none; cursor:pointer; }
  .btn-submit {
    width:100%; padding:16px; border:none; border-radius:var(--radius-sm);
    background: linear-gradient(135deg, var(--grad-a), var(--grad-b));
    color:#fff; font-size:0.97rem; font-weight:700; cursor:pointer;
    margin-top:6px; display:flex; align-items:center; justify-content:center; gap:8px;
    transition:0.2s; box-shadow:0 4px 20px rgba(124,58,237,0.3);
  }
  .btn-submit:active:not(:disabled) { transform:scale(0.98); opacity:0.9; }
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
    background:rgba(12,12,26,0.92); border:1px solid var(--border2);
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
  .nav-item.active { background:rgba(124,58,237,0.08); }
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

  /* ===================== UTILITY — fadeUp ===================== */
  @keyframes fadeUp {
    from { opacity:0; transform:translateY(12px); }
    to   { opacity:1; transform:translateY(0); }
  }
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
tg.setHeaderColor?.('#05050e');
tg.setBackgroundColor?.('#05050e');

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
            showToastGlobal('error', 'সেশন শেষ হয়েছে। অ্যাপ পুনরায় চালু করুন।');
            return null;
        }
        return data;
    } catch {
        return null;
    }
}

// ============================================================
//  Loader — Premium Lightning + Progress Bar (No Text except progress)
// ============================================================
function Loader({ hiding, progress }) {
    return (
        <div className="loader-overlay" style={hiding ? { opacity: 0, transform: 'scale(1.05)' } : {}}>
            <div className="loader-bg-glow" />
            <div className="loader-lightning-container">
                {/* Lightning bolt SVG */}
                <svg className="lightning-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="boltGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#a78bfa" />
                            <stop offset="50%" stopColor="#7c3aed" />
                            <stop offset="100%" stopColor="#4f8ef7" />
                        </linearGradient>
                        <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="6" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <path d="M50 5 L20 55 L45 55 L35 95 L75 40 L50 40 L60 5 Z"
                          fill="url(#boltGrad)"
                          filter="url(#glowFilter)"
                          stroke="rgba(167,139,250,0.3)"
                          strokeWidth="1"
                    />
                    <path d="M50 10 L25 50 L45 50 L38 85 L68 40 L48 40 L56 10 Z"
                          fill="rgba(255,255,255,0.15)"
                    />
                    <circle cx="50" cy="50" r="30" fill="rgba(124,58,237,0.1)" filter="blur(10px)" />
                </svg>
                <div className="spark spark1" />
                <div className="spark spark2" />
                <div className="spark spark3" />
                <div className="spark spark4" />
                <div className="spark spark5" />
            </div>

            {/* Progress Bar */}
            <div className="loader-progress-wrap">
                <div className="loader-progress-bar">
                    <div className="loader-progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
                </div>
                <div className="loader-progress-text">লোডিং... <span>{Math.min(progress, 100)}%</span></div>
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
                    <p>বিজ্ঞাপন দেখা</p>
                    <h4>{totalAdViews}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap purple">
                        <img src={ICONS.share} alt="" />
                    </div>
                    <p>মোট রেফারেল</p>
                    <h4>{u.referrals || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap green">
                        <img src={ICONS.check} alt="" />
                    </div>
                    <p>টাস্ক সম্পন্ন</p>
                    <h4>{u.completedTaskCount || 0}</h4>
                </div>
                <div className="stat-card">
                    <div className="stat-icon-wrap orange">
                        <img src={ICONS.coin} alt="" />
                    </div>
                    <p>মোট আয়</p>
                    <h4>{(u.totalEarned || 0).toFixed(2)}</h4>
                </div>
            </div>

            <div className="ref-card">
                <div className="ref-top">
                    <div className="ref-icon">
                        <img src={ICONS.rocket} alt="" />
                    </div>
                    <div className="ref-title">
                        <h4>বন্ধুদের আমন্ত্রণ জানান</h4>
                        <div className="ref-badge">
                            <img src={ICONS.gift} alt="" />
                            প্রতি রেফারেলে {refBonus} {sym} উপার্জন!
                        </div>
                    </div>
                </div>
                <div className="ref-label">আপনার রেফারেল লিংক</div>
                <div className="ref-input-row">
                    <input className="ref-inp" readOnly value={refLink} onChange={() => {}} />
                    <button className="btn-copy" onClick={() => onCopy(refLink)}>
                        <img src={ICONS.share} alt="" /> কপি
                    </button>
                </div>
                <button className="btn-share" onClick={() => onShare(refLink)}>
                    <img src={ICONS.rocket} alt="" /> টেলিগ্রামে শেয়ার করুন
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
                <img src={ICONS.tv} alt="" /> বিজ্ঞাপন দেখুন ও আয় করুন
            </div>
            {slots.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.tv} alt="" />
                    বর্তমানে কোনো বিজ্ঞাপন উপলব্ধ নেই।
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
                <img src={ICONS.check} alt="" /> বিশেষ টাস্ক
            </div>
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="empty-state">
                    <img src={ICONS.chart} alt="" />
                    কোনো টাস্ক উপলব্ধ নেই।
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
    const lockRef = useRef(false);

    async function triggerAd() {
        if (loading || lockRef.current || done >= limit) return;
        lockRef.current = true;
        setLoading(true);
        tg.HapticFeedback.impactOccurred('light');
        try {
            let providerFunc;
            if (slot.network === 'monetag' && window[`show_${slot.id}`]) {
                providerFunc = window[`show_${slot.id}`]();
            } else if (slot.network === 'gigapub' && window.showGiga) {
                providerFunc = window.showGiga();
            } else {
                alert('বিজ্ঞাপন নেটওয়ার্ক লোড হচ্ছে। আবার চেষ্টা করুন।');
                setLoading(false);
                lockRef.current = false;
                return;
            }
            await providerFunc;
            await onAdDone(slot.id);
            tg.HapticFeedback.notificationOccurred('success');
        } catch {
            // user cancelled
        } finally {
            setLoading(false);
            lockRef.current = false;
        }
    }

    return (
        <div className="ad-box" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="ad-icon">
                <img src={ICONS.tv} alt="" />
            </div>
            <h4>বিজ্ঞাপন {index + 1}</h4>
            <div className="ad-counter">{done}/{limit}</div>
            <button className="ad-btn" onClick={triggerAd} disabled={loading || lockRef.current || done >= limit}>
                {loading ? (
                    <>লোডিং...</>
                ) : done >= limit ? (
                    <><img src={ICONS.lock} alt="" /> সম্পন্ন</>
                ) : (
                    <><img src={ICONS.bolt} alt="" /> দেখুন</>
                )}
            </button>
        </div>
    );
}

// ============================================================
//  Task Item
// ============================================================
function TaskItem({ id, task, history, sym, now, onBegin }) {
    const [state, setState] = useState('idle');
    const [countdown, setCountdown] = useState(5);
    const timerRef = useRef(null);
    const lockRef = useRef(false);

    const isDailyDone = task.type === 'daily' && history.ts && (now - history.ts) < 86400000;
    const left = isDailyDone ? (86400000 - (now - history.ts)) : 0;
    const hrs  = Math.floor(left / 3600000);
    const mins = Math.floor((left % 3600000) / 60000);

    function handleStart() {
        if (lockRef.current) return;
        lockRef.current = true;
        tg.openLink(task.url);
        tg.HapticFeedback.impactOccurred('medium');
        setState('waiting');
        let sec = 5;
        setCountdown(sec);
        timerRef.current = setInterval(() => {
            sec--;
            setCountdown(sec);
            if (sec <= 0) {
                clearInterval(timerRef.current);
                setState('claim');
                lockRef.current = false;
            }
        }, 1000);
    }

    function handleClaim() {
        if (lockRef.current) return;
        lockRef.current = true;
        onBegin(id, task);
        setState('idle');
        setTimeout(() => { lockRef.current = false; }, 500);
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
                    <img src={ICONS.clock} alt="" style={{width:12,height:12}} /> {hrs}ঘ {mins}মি
                </button>
            ) : state === 'idle' ? (
                <button className="btn-task btn-task-start" onClick={handleStart} disabled={lockRef.current}>শুরু</button>
            ) : state === 'waiting' ? (
                <button className="btn-task btn-task-wait" disabled>{countdown}সে</button>
            ) : (
                <button className="btn-task btn-task-claim" onClick={handleClaim} disabled={lockRef.current}>দাবি!</button>
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
    const lockRef = useRef(false);

    const selectedMethod = methods.find(m => m.name === method) || methods[0];
    const sysMin = parseFloat(selectedMethod?.min || 10);

    const statusMap = { pending:'অপেক্ষমান', completed:'সম্পন্ন', rejected:'বাতিল' };
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
        if (processing || lockRef.current) return;
        if (u.referrals < minRef) {
            showToastGlobal('warning', `উত্তোলনের জন্য ন্যূনতম ${minRef} রেফারেল প্রয়োজন।`);
            tg.HapticFeedback.notificationOccurred('warning');
            return;
        }
        const reqAmt = parseFloat(amount);
        if (!account || account.trim().length < 3) {
            showToastGlobal('error', 'একটি বৈধ অ্যাকাউন্ট নম্বর দিন।'); return;
        }
        if (!reqAmt || isNaN(reqAmt) || reqAmt < sysMin) {
            showToastGlobal('error', `ন্যূনতম উত্তোলন ${sysMin} ${sym}।`);
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        if (reqAmt > u.balance) {
            showToastGlobal('error', 'পর্যাপ্ত ব্যালেন্স নেই।');
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        lockRef.current = true;
        setProcessing(true);
        const ok = await onWithdraw({ userId: u.id, userName: u.firstName, amount: reqAmt, method: method || selectedMethod?.name, account: account.trim() });
        setProcessing(false);
        lockRef.current = false;
        if (ok) { setAmount(''); setAccount(''); }
    }

    return (
        <div className="page active">
            <div className="sec-head">
                <img src={ICONS.withdraw} alt="" /> উত্তোলন
            </div>
            <div className="info-banner">
                <img src={ICONS.bolt} alt="" />
                <div>
                    <p>
                        <strong>ন্যূনতম:</strong> {sysMin} {sym} &nbsp;|&nbsp;
                        <strong>ন্যূনতম রেফারেল:</strong> {minRef}
                    </p>
                </div>
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.coin} alt="" />
                <select className="form-inp" value={method} onChange={e => setMethod(e.target.value)}>
                    {methods.length === 0 && <option value="">কোন পদ্ধতি নেই</option>}
                    {methods.map(m => (
                        <option key={m.name} value={m.name}>{m.name} (ন্যূনতম {m.min})</option>
                    ))}
                </select>
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.share} alt="" />
                <input className="form-inp" placeholder="অ্যাকাউন্ট নম্বর / ট্যাগ" value={account} onChange={e => setAccount(e.target.value)} />
            </div>
            <div className="input-wrap">
                <img className="input-icon" src={ICONS.coin} alt="" />
                <input className="form-inp" type="number" placeholder="উত্তোলনের পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <button className="btn-submit" onClick={handleSubmit} disabled={processing || lockRef.current}>
                {processing
                    ? <><img src={ICONS.clock} alt="" /> প্রক্রিয়াকরণ...</>
                    : <><img src={ICONS.withdraw} alt="" /> উত্তোলন অনুরোধ</>
                }
            </button>

            <div className="sec-head" style={{ marginTop: 34 }}>
                <img src={ICONS.chart} alt="" /> সাম্প্রতিক লেনদেন
            </div>
            <div className="hist-wrap">
                {(!appState.history || appState.history.length === 0) ? (
                    <div className="empty-state">
                        <img src={ICONS.chart} alt="" />
                        এখনো কোনো লেনদেন নেই।
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
                                        {dt.toLocaleDateString('bn-BD')} &middot; {dt.toLocaleTimeString('bn-BD', { hour:'2-digit', minute:'2-digit' })}
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

    const [loaderHide, setLoaderHide] = useState(false);
    const [appReady,   setAppReady]   = useState(false);
    const [activePage, setActivePage] = useState('home');
    const [toast,      setToast]      = useState({ show: false, type: 'success', msg: '' });
    const [loadingProgress, setLoadingProgress] = useState(0);
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
    const navLock = useRef(false);

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

    // ===== INIT with progress tracking =====
    useEffect(() => {
        const cached = localStorage.getItem(`app_${tgUser.id}`);
        if (cached) {
            try { setAppState(JSON.parse(cached)); } catch {}
        }

        (async () => {
            try {
                setLoadingProgress(5);

                const config = await apiCall('getConfig');
                setLoadingProgress(35);

                const user = await apiCall('login', 'POST', {
                    id:        tgUser.id,
                    firstName: tgUser.first_name,
                    photoUrl:  tgUser.photo_url || '',
                    refId:     tg.initDataUnsafe?.start_param || '',
                });
                setLoadingProgress(65);

                const hist = await apiCall('getHistory', 'POST', { id: tgUser.id });
                setLoadingProgress(95);

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

                // Show 100% and then hide loader
                setLoadingProgress(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => setAppReady(true), 500);
                }, 400);

            } catch {
                setLoadingProgress(100);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => {
                        setAppReady(true);
                        showToast('error', 'সংযোগ ব্যর্থ হয়েছে। অফলাইনে চলছে।');
                    }, 500);
                }, 400);
            }
        })();

        return () => {};
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
    const adLock = useRef(false);
    async function handleAdDone(slotId) {
        if (adLock.current) return;
        adLock.current = true;
        const today = new Date().toISOString().slice(0, 10);
        const res = await apiCall('claimAdReward', 'POST', { slotId });
        if (!res || res.error) {
            showToast('error', res?.error || 'পুরস্কার দাবি ব্যর্থ হয়েছে।');
            adLock.current = false;
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
        showToast('success', `+${rwrd} ${appState.config.currencySymbol || 'টাকা'} পুরস্কার!`);
        adLock.current = false;
    }

    // ===== TASK REWARD =====
    const taskLock = useRef(false);
    async function handleTaskBegin(id) {
        if (taskLock.current) return;
        taskLock.current = true;
        const res = await apiCall('claimTaskReward', 'POST', { taskId: id });
        if (!res || res.error) {
            showToast('error', res?.error || 'পুরস্কার দাবি ব্যর্থ হয়েছে।');
            taskLock.current = false;
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
        showToast('success', 'টাস্ক সম্পন্ন! পুরস্কার যোগ হয়েছে।');
        tg.HapticFeedback.notificationOccurred('success');
        taskLock.current = false;
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
            showToast('success', 'উত্তোলন অনুরোধ জমা দেওয়া হয়েছে!');
            tg.HapticFeedback.notificationOccurred('success');
            return true;
        } else {
            showToast('error', rData?.message || 'সার্ভার ত্রুটি। আবার চেষ্টা করুন।');
            return false;
        }
    }

    function handleCopy(link) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => showToast('success', 'লিংক কপি করা হয়েছে!'));
        } else {
            const tmp = document.createElement('input');
            tmp.value = link;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            showToast('success', 'লিংক কপি করা হয়েছে!');
        }
        tg.HapticFeedback.notificationOccurred('success');
    }

    function handleShare(link) {
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent('যোগ দিন এবং এখনই আয় শুরু করুন!')}`);
    }

    function openSupport() {
        if (appState.config.supportLink) tg.openLink(appState.config.supportLink);
        else showToast('warning', 'সাপোর্ট লিংক কনফিগার করা নেই।');
    }

    async function handleNav(page) {
        if (navLock.current) return;
        navLock.current = true;
        setActivePage(page);
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        if (page === 'withdraw') {
            const data = await apiCall('getHistory', 'POST', { id: appState.user.id });
            if (data) {
                setAppState(prev => { const n = { ...prev, history: data }; saveLocal(n); return n; });
            }
        }
        setTimeout(() => { navLock.current = false; }, 300);
    }

    const u   = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'টাকা';
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);

    return (
        <>
            <style>{css}</style>

            {!appReady && <Loader hiding={loaderHide} progress={loadingProgress} />}
            <Toast type={toast.type} msg={toast.msg} show={toast.show} />

            {appReady && (
                <>
                    {/* Top Nav */}
                    <header className="top-nav">
                        <div className="user-pill">
                            <div className="user-avatar">
                                <img
                                    src={u.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.firstName||'U')}&background=7c3aed&color=fff&size=88`}
                                    alt={u.firstName}
                                />
                                <div className="avatar-status" />
                            </div>
                            <div className="user-info">
                                <h3>{u.firstName || tgUser.first_name}</h3>
                                <p>আইডি: {u.id || tgUser.id}</p>
                            </div>
                        </div>
                        <button className="notif-btn" onClick={openSupport} aria-label="সাপোর্ট">
                            <img src={ICONS.bell} alt="সাপোর্ট" />
                            <div className="notif-dot" />
                        </button>
                    </header>

                    {/* Balance Card — only on home */}
                    {activePage === 'home' && (
                        <div className="balance-card">
                            <div className="bc-glow" />
                            <div className="bc-grid" />
                            <div className="bc-label">মোট ব্যালেন্স</div>
                            <div className="bc-amount">
                                {(u.balance || 0).toFixed(2)}
                                <span className="bc-sym"> {sym}</span>
                            </div>
                            <div className="bc-footer">
                                <div className="bc-mini">
                                    <span>মোট আয়</span>
                                    <span>{(u.totalEarned || 0).toFixed(2)}</span>
                                </div>
                                <div className="bc-mini">
                                    <span>রেফারেল</span>
                                    <span>{u.referrals || 0}</span>
                                </div>
                                <div className="bc-mini">
                                    <span>বিজ্ঞাপন দেখা</span>
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

                    {/* Bottom Nav */}
                    <nav className="bottom-nav" aria-label="প্রধান নেভিগেশন">
                        {[
                            { page:'home',     icon:ICONS.home,     label:'হোম' },
                            { page:'earn',     icon:ICONS.earn,     label:'আয়' },
                            { page:'withdraw', icon:ICONS.withdraw, label:'উত্তোলন' },
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
