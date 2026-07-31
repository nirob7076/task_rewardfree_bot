/**
 * ==========================================================
 *  আর্ন ওয়ালেট — React Frontend  (নিরাপদ সংস্করণ)
 * ============================================================
 *
 *  নিরাপত্তা পরিবর্তনসমূহ:
 *   1. প্রতিটি API call-এ Telegram initData পাঠানো হয়
 *   2. ad/task reward client-side গণনা করা হয় না —
 *      server response থেকে reward নেওয়া হয়
 *   3. ব্যালেন্স শুধুমাত্র server response-এ আপডেট হয়
 *   4. সমস্ত UI ও লজিক আগের মতোই আছে
 * ============================================================
 */

import { useState, useEffect, useRef, useCallback } from "react";

// ============================================================
//  ⚙️  কনফিগারেশন — এই লাইনটি পরিবর্তন করুন
// ============================================================
const API_URL = "https://www.gajarbotol/nirob/api.php"; // আপনার api.php URL

// ============================================================
//  CSS (একই ডিজাইন)
// ============================================================
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');

  :root {
    --bg: #0a0c18; --surface: #131525; --surface2: #1a1d30;
    --text-main: #eef0ff; --text-dim: #7b85b0; --border: #222640;
    --primary: #6c5ce7; --primary2: #a855f7;
    --accent-blue: #3b82f6; --grad-start: #3b82f6; --grad-end: #9333ea;
    --danger: #ef4444; --success: #10b981; --warning: #f59e0b;
  }
  * { margin:0; padding:0; box-sizing:border-box; font-family:'Hind Siliguri',sans-serif; }
  body { background:var(--bg); color:var(--text-main); -webkit-tap-highlight-color:transparent; overflow-x:hidden; }
  #root { max-width:480px; margin:0 auto; min-height:100vh; padding-bottom:110px; position:relative; }

  /* LOADER */
  .loader-overlay { position:fixed; inset:0; background:var(--bg); z-index:9999; display:flex; justify-content:center; align-items:center; flex-direction:column; overflow:hidden; transition:opacity 0.5s ease,transform 0.5s ease; }
  .loader-orb { position:absolute; border-radius:50%; filter:blur(60px); opacity:0.18; pointer-events:none; }
  .loader-orb-1 { width:280px;height:280px;background:var(--grad-start);top:-60px;left:-60px;animation:orbFloat1 6s ease-in-out infinite; }
  .loader-orb-2 { width:220px;height:220px;background:var(--grad-end);bottom:-50px;right:-50px;animation:orbFloat2 7s ease-in-out infinite; }
  .loader-orb-3 { width:150px;height:150px;background:#10b981;top:50%;right:10%;animation:orbFloat1 5s ease-in-out infinite reverse; }
  @keyframes orbFloat1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(30px,20px) scale(1.1)} }
  @keyframes orbFloat2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-25px,-15px) scale(1.08)} }
  .loader-inner { position:relative;z-index:2;display:flex;flex-direction:column;align-items:center;gap:28px; }
  .loader-ring-wrap { position:relative;width:100px;height:100px; }
  .loader-ring { position:absolute;inset:0;border-radius:50%;border:3px solid transparent;border-top-color:var(--grad-start);border-right-color:var(--grad-end);animation:spin 1.2s linear infinite; }
  .loader-ring-2 { position:absolute;inset:8px;border-radius:50%;border:2px solid transparent;border-bottom-color:rgba(168,85,247,0.5);animation:spin 1.8s linear infinite reverse; }
  .loader-icon-center { position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:2.2rem;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));-webkit-background-clip:text;-webkit-text-fill-color:transparent; }
  @keyframes spin { to{transform:rotate(360deg)} }
  .loader-brand { font-size:2rem;font-weight:700;letter-spacing:-0.5px;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:pulseBrand 2s ease-in-out infinite; }
  @keyframes pulseBrand { 0%,100%{opacity:1} 50%{opacity:0.7} }
  .loader-step-text { font-size:0.82rem;color:var(--text-dim);font-weight:500;min-height:20px; }
  .loader-progress-wrap { width:240px;display:flex;flex-direction:column;gap:8px;align-items:center; }
  .loader-segs { display:flex;gap:5px;width:100%; }
  .loader-seg { flex:1;height:4px;background:var(--surface2);border-radius:10px;overflow:hidden; }
  .loader-seg-fill { height:100%;width:0%;background:linear-gradient(90deg,var(--grad-start),var(--grad-end));border-radius:10px;transition:width 0.5s cubic-bezier(0.4,0,0.2,1); }
  .loader-seg.done .loader-seg-fill { width:100%; }
  .loader-seg.active .loader-seg-fill { animation:segPulse 0.8s ease-in-out infinite alternate; }
  @keyframes segPulse { from{width:40%} to{width:80%} }
  .loader-pct { font-size:0.75rem;font-weight:700;color:var(--primary2); }
  .loader-dots { display:flex;gap:6px; }
  .loader-dot { width:6px;height:6px;border-radius:50%;background:var(--text-dim);opacity:0.3; }
  .loader-dot:nth-child(1){animation:dotBounce 1.2s ease-in-out infinite 0s}
  .loader-dot:nth-child(2){animation:dotBounce 1.2s ease-in-out infinite 0.2s}
  .loader-dot:nth-child(3){animation:dotBounce 1.2s ease-in-out infinite 0.4s}
  @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:0.3} 50%{transform:translateY(-6px);opacity:1;background:var(--primary2)} }

  /* TOAST */
  .toast { position:fixed;top:-100px;left:50%;transform:translateX(-50%);background:var(--surface2);color:var(--text-main);box-shadow:0 8px 32px rgba(0,0,0,0.5),0 0 0 1px var(--border);border-radius:100px;padding:12px 22px;font-size:0.9rem;font-weight:600;display:flex;align-items:center;gap:10px;z-index:10000;transition:top 0.45s cubic-bezier(0.175,0.885,0.32,1.275);max-width:88%;white-space:nowrap; }
  .toast.show { top:22px; }
  .toast.success i { color:var(--success); }
  .toast.error i { color:var(--danger); }
  .toast.warning i { color:var(--warning); }

  /* TOP NAV */
  .top-nav { display:flex;justify-content:space-between;align-items:center;padding:16px 18px 12px; }
  .user-pill { display:flex;align-items:center;gap:12px; }
  .user-avatar-wrap { position:relative; }
  .user-avatar-wrap img { width:46px;height:46px;border-radius:50%;border:2px solid var(--primary);object-fit:cover; }
  .avatar-badge { position:absolute;bottom:0;right:0;width:14px;height:14px;background:var(--success);border-radius:50%;border:2px solid var(--bg); }
  .user-info h3 { font-size:1rem;font-weight:700;color:var(--text-main); }
  .user-info p { font-size:0.72rem;color:var(--text-dim); }
  .notif-btn { width:42px;height:42px;background:var(--surface2);border:1px solid var(--border);border-radius:50%;color:var(--text-dim);font-size:1.1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:0.2s;position:relative; }
  .notif-btn::after { content:'';position:absolute;top:8px;right:8px;width:8px;height:8px;background:var(--danger);border-radius:50%;border:2px solid var(--bg); }
  .notif-btn:active { transform:scale(0.93);background:var(--border); }

  /* PAGES */
  .page { display:none;padding:0 16px;animation:pageIn 0.4s cubic-bezier(0.34,1.56,0.64,1); }
  .page.active { display:block; }
  @keyframes pageIn { from{opacity:0;transform:translateY(18px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
  .sec-head { font-size:1rem;font-weight:700;margin:26px 0 14px;display:flex;align-items:center;gap:8px;color:var(--text-main); }
  .sec-head i { color:var(--primary2); }

  /* BALANCE CARD */
  .master-card { background:linear-gradient(135deg,var(--grad-start) 0%,var(--grad-end) 100%);padding:28px 22px 26px;border-radius:24px;margin:0 16px 20px;position:relative;overflow:hidden;box-shadow:0 8px 40px rgba(59,130,246,0.3),0 2px 8px rgba(0,0,0,0.4);animation:cardBounceIn 0.8s cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes cardBounceIn { 0%{transform:scale(0.88) translateY(20px);opacity:0} 60%{transform:scale(1.03);opacity:1} 100%{transform:scale(1) translateY(0);opacity:1} }
  .master-card::before { content:'';position:absolute;top:-50px;right:-50px;width:160px;height:160px;background:rgba(255,255,255,0.08);border-radius:50%; }
  .master-card::after { content:'';position:absolute;bottom:-40px;left:-30px;width:120px;height:120px;background:rgba(255,255,255,0.05);border-radius:50%; }
  .bal-label { font-size:0.75rem;text-transform:uppercase;letter-spacing:1.5px;color:rgba(255,255,255,0.75);font-weight:600;margin-bottom:10px; }
  .bal-amt { font-size:3.2rem;font-weight:700;color:#fff;letter-spacing:-1px;line-height:1; }
  .bal-sym { font-size:1.4rem;font-weight:600;opacity:0.85; }
  .bal-footer { display:flex;gap:18px;margin-top:20px; }
  .bal-mini { display:flex;flex-direction:column;gap:2px; }
  .bal-mini span:first-child { font-size:0.7rem;color:rgba(255,255,255,0.65);font-weight:500; }
  .bal-mini span:last-child { font-size:1rem;color:#fff;font-weight:700; }

  /* STATS GRID */
  .stats-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:20px; }
  .stat-card { background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:18px 16px;transition:transform 0.2s,box-shadow 0.2s;animation:statFadeIn 0.5s ease both; }
  .stat-card:nth-child(1){animation-delay:0.05s}.stat-card:nth-child(2){animation-delay:0.1s}.stat-card:nth-child(3){animation-delay:0.15s}.stat-card:nth-child(4){animation-delay:0.2s}
  @keyframes statFadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
  .stat-card:active { transform:scale(0.97); }
  .stat-icon { width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:1.1rem;margin-bottom:12px; }
  .stat-icon.blue{background:rgba(59,130,246,0.15);color:var(--accent-blue)}.stat-icon.purple{background:rgba(168,85,247,0.15);color:var(--primary2)}.stat-icon.green{background:rgba(16,185,129,0.15);color:var(--success)}.stat-icon.orange{background:rgba(245,158,11,0.15);color:var(--warning)}
  .stat-card p { font-size:0.75rem;color:var(--text-dim);font-weight:500;margin-bottom:6px; }
  .stat-card h4 { font-size:1.5rem;font-weight:700;color:var(--text-main); }

  /* REFERRAL CARD */
  .ref-card { background:var(--surface);border:1px solid var(--border);border-radius:22px;padding:22px 18px;margin-bottom:20px;position:relative;overflow:hidden; }
  .ref-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,var(--grad-start),var(--grad-end)); }
  .ref-card-top { display:flex;align-items:center;gap:14px;margin-bottom:16px; }
  .ref-card-icon { width:44px;height:44px;border-radius:14px;background:rgba(168,85,247,0.15);color:var(--primary2);font-size:1.2rem;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .ref-card-title h4 { font-size:0.95rem;font-weight:700;color:var(--text-main); }
  .ref-promo-bounce { font-size:0.82rem;color:var(--primary2);font-weight:700;margin-top:3px;display:inline-block;animation:textBounce 2s ease-in-out infinite; }
  @keyframes textBounce { 0%,100%{transform:translateY(0)} 20%{transform:translateY(-4px)} 40%{transform:translateY(0)} 60%{transform:translateY(-2px)} 80%{transform:translateY(0)} }
  .ref-label { font-size:0.72rem;color:var(--text-dim);font-weight:600;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px; }
  .ref-input-wrap { display:flex;background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:5px 5px 5px 14px;margin-bottom:12px;align-items:center; }
  .ref-inp { flex:1;background:transparent;border:none;color:var(--text-dim);font-size:0.82rem;font-weight:500;outline:none;min-width:0; }
  .btn-copy { background:linear-gradient(135deg,var(--grad-start),var(--grad-end));color:#fff;border:none;padding:9px 16px;border-radius:10px;font-size:0.82rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:6px;transition:0.2s;white-space:nowrap;flex-shrink:0;box-shadow:0 3px 10px rgba(59,130,246,0.25); }
  .btn-copy:active { transform:scale(0.93);opacity:0.85; }
  .btn-share { width:100%;padding:14px;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));color:#fff;border:none;border-radius:14px;font-size:0.95rem;font-weight:700;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px;transition:0.2s;box-shadow:0 4px 18px rgba(109,78,218,0.35); }
  .btn-share:active { transform:scale(0.97);opacity:0.9; }

  /* BONUS BADGE */
  .bonus-badge { display:inline-flex;align-items:center;gap:5px;background:rgba(16,185,129,0.12);border:1px solid rgba(16,185,129,0.3);color:var(--success);padding:4px 10px;border-radius:20px;font-size:0.75rem;font-weight:700;margin-bottom:14px;animation:badgePop 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
  @keyframes badgePop { from{transform:scale(0);opacity:0} to{transform:scale(1);opacity:1} }

  /* ADS */
  .ad-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px; }
  .ad-box { background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:20px 14px;text-align:center;transition:transform 0.2s,box-shadow 0.2s;animation:statFadeIn 0.5s ease both; }
  .ad-box:active { transform:scale(0.97); }
  .ad-box-icon { width:46px;height:46px;background:rgba(59,130,246,0.12);color:var(--accent-blue);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:1.3rem;margin:0 auto 12px; }
  .ad-box h4 { font-size:0.9rem;font-weight:600;margin-bottom:6px;color:var(--text-main); }
  .ad-counter { font-size:0.72rem;background:var(--surface2);border:1px solid var(--border);color:var(--text-dim);padding:3px 10px;border-radius:20px;display:inline-block;margin-bottom:14px;font-weight:500; }
  .ad-action-btn { background:linear-gradient(135deg,var(--grad-start),var(--grad-end));color:#fff;border:none;padding:10px 0;width:100%;border-radius:12px;font-size:0.85rem;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;transition:0.2s;box-shadow:0 3px 10px rgba(59,130,246,0.2); }
  .ad-action-btn:active { transform:scale(0.96);opacity:0.85; }
  .ad-action-btn:disabled { background:var(--surface2);color:var(--text-dim);cursor:not-allowed;border:1px solid var(--border);box-shadow:none; }

  /* TASK LIST */
  .task-list { display:flex;flex-direction:column;gap:12px; }
  .task-item { background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:14px 16px;display:flex;align-items:center;justify-content:space-between;transition:transform 0.2s,border-color 0.2s;animation:statFadeIn 0.5s ease both; }
  .task-item:active { transform:scale(0.99); }
  .task-left { display:flex;align-items:center;gap:14px; }
  .task-icon { width:46px;height:46px;border-radius:14px;object-fit:cover;background:var(--surface2); }
  .task-info h4 { font-size:0.9rem;font-weight:600;color:var(--text-main);margin-bottom:4px; }
  .task-reward { font-size:0.78rem;font-weight:700;color:var(--success); }
  .btn-act { padding:9px 16px;border-radius:12px;font-size:0.82rem;font-weight:600;cursor:pointer;border:none;transition:0.2s;white-space:nowrap; }
  .btn-start { background:linear-gradient(135deg,var(--grad-start),var(--grad-end));color:#fff;box-shadow:0 3px 10px rgba(59,130,246,0.2); }
  .btn-wait { background:var(--surface2);color:var(--text-dim);cursor:not-allowed;border:1px solid var(--border); }
  .btn-claim { background:linear-gradient(135deg,var(--success),#059669);color:#fff;animation:claimPulse 1s ease-in-out infinite;box-shadow:0 3px 12px rgba(16,185,129,0.3); }
  @keyframes claimPulse { 0%,100%{box-shadow:0 3px 12px rgba(16,185,129,0.3)} 50%{box-shadow:0 3px 20px rgba(16,185,129,0.6)} }

  /* BOUNCE */
  .bounce-item { animation:importantBounce 2.5s ease-in-out infinite; }
  .bounce-item-2 { animation:importantBounce 2.5s ease-in-out infinite 0.4s; }
  .bounce-item-3 { animation:importantBounce 2.5s ease-in-out infinite 0.8s; }
  @keyframes importantBounce { 0%,100%{transform:translateY(0)} 15%{transform:translateY(-5px)} 30%{transform:translateY(0)} 45%{transform:translateY(-3px)} 60%{transform:translateY(0)} }

  /* WITHDRAW */
  .info-card { background:rgba(59,130,246,0.07);border:1px solid rgba(59,130,246,0.2);padding:16px;border-radius:16px;display:flex;align-items:flex-start;gap:12px;margin-bottom:18px; }
  .info-card i { color:var(--accent-blue);font-size:1.1rem;margin-top:2px;flex-shrink:0; }
  .info-card p { font-size:0.82rem;color:var(--text-dim);line-height:1.6; }
  .info-card p strong { color:var(--text-main); }
  .input-group { position:relative;margin-bottom:14px; }
  .input-icon { position:absolute;top:50%;transform:translateY(-50%);left:16px;color:var(--text-dim);font-size:1rem;pointer-events:none; }
  .inp { width:100%;padding:16px 16px 16px 48px;background:var(--surface);border:1px solid var(--border);border-radius:14px;color:var(--text-main);font-size:0.95rem;font-weight:500;outline:none;transition:0.2s;font-family:'Hind Siliguri',sans-serif; }
  .inp:focus { border-color:var(--primary);box-shadow:0 0 0 3px rgba(108,92,231,0.12); }
  .inp::placeholder { color:var(--text-dim);opacity:0.7; }
  select.inp { appearance:none;cursor:pointer; }
  select.inp option { background:var(--surface2);color:var(--text-main); }
  .btn-submit { width:100%;padding:16px;background:linear-gradient(135deg,var(--grad-start),var(--grad-end));color:#fff;border:none;border-radius:14px;font-size:1rem;font-weight:700;cursor:pointer;margin-top:8px;display:flex;align-items:center;justify-content:center;gap:8px;transition:0.2s;box-shadow:0 4px 18px rgba(109,78,218,0.3);font-family:'Hind Siliguri',sans-serif; }
  .btn-submit:active { transform:scale(0.98);opacity:0.9; }
  .btn-submit:disabled { background:var(--surface2);box-shadow:none;cursor:not-allowed;color:var(--text-dim); }

  /* HISTORY */
  .hist-container { background:var(--surface);border:1px solid var(--border);border-radius:18px;padding:0 16px; }
  .hist-item { display:flex;justify-content:space-between;align-items:center;padding:14px 0;border-bottom:1px solid var(--border);animation:statFadeIn 0.4s ease both; }
  .hist-item:last-child { border-bottom:none; }
  .hist-left { display:flex;align-items:center;gap:14px; }
  .hist-icon { width:40px;height:40px;border-radius:12px;background:var(--surface2);display:flex;align-items:center;justify-content:center;font-size:1rem; }
  .hist-info h4 { font-size:0.9rem;font-weight:600;color:var(--text-main); }
  .hist-info small { font-size:0.72rem;color:var(--text-dim); }
  .hist-right { text-align:right; }
  .hist-amt { font-size:0.95rem;font-weight:700;color:var(--text-main);display:block;margin-bottom:4px; }
  .badge { font-size:0.65rem;padding:3px 8px;border-radius:6px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px; }
  .status-pending{background:rgba(245,158,11,0.15);color:var(--warning)}.status-completed{background:rgba(16,185,129,0.15);color:var(--success)}.status-rejected{background:rgba(239,68,68,0.15);color:var(--danger)}

  /* BOTTOM NAV */
  .bottom-nav { position:fixed;bottom:18px;left:50%;transform:translateX(-50%);width:calc(100% - 32px);max-width:420px;background:rgba(26,29,48,0.92);border:1px solid var(--border);padding:6px 10px;border-radius:100px;display:flex;justify-content:space-around;z-index:100;box-shadow:0 10px 40px rgba(0,0,0,0.5);backdrop-filter:blur(16px); }
  .nav-item { display:flex;flex-direction:column;align-items:center;justify-content:center;width:70px;height:56px;color:var(--text-dim);cursor:pointer;transition:0.25s;gap:4px;border-radius:50px; }
  .nav-item img { width:26px;height:26px;object-fit:contain;filter:grayscale(1) brightness(0.45);transition:0.25s; }
  .nav-item span { font-size:0.62rem;font-weight:600;opacity:0;transition:0.2s;transform:translateY(3px); }
  .nav-item.active { color:var(--primary2);background:rgba(168,85,247,0.08); }
  .nav-item.active img { filter:none; }
  .nav-item.active span { opacity:1;transform:translateY(0); }
  .nav-dot { width:5px;height:5px;background:var(--primary2);border-radius:50%;margin-top:-2px;display:none; }
  .nav-item.active .nav-dot { display:block;animation:dotPop 0.3s cubic-bezier(0.34,1.56,0.64,1); }
  @keyframes dotPop { from{transform:scale(0)} to{transform:scale(1)} }

  /* MISC */
  ::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--border);border-radius:4px}
  .empty-state { text-align:center;padding:30px 10px;color:var(--text-dim);font-size:0.88rem; }
  .empty-state i { font-size:2rem;margin-bottom:10px;display:block;opacity:0.35; }
  .divider { height:1px;background:var(--border);margin:5px 0 20px; }
`;

// ============================================================
//  ইউটিলিটি: বাংলা সংখ্যা
// ============================================================
const BN = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
const tobn = (n) => String(n).replace(/[0-9]/g, d => BN[d]);

// ============================================================
//  Telegram WebApp অবজেক্ট
// ============================================================
const tg = window.Telegram?.WebApp || {
    ready: () => {},
    expand: () => {},
    setHeaderColor: () => {},
    setBackgroundColor: () => {},
    initData: '',
    initDataUnsafe: { user: { id: 'Dev', first_name: 'ব্যবহারকারী', photo_url: '' }, start_param: null },
    HapticFeedback: { impactOccurred: () => {}, notificationOccurred: () => {} },
    openLink: (u) => window.open(u, '_blank'),
    openTelegramLink: (u) => window.open(u, '_blank'),
};

tg.ready();
tg.expand();
tg.setHeaderColor?.('#0a0c18');
tg.setBackgroundColor?.('#0a0c18');

// ============================================================
//  ⚙️  initData — প্রতিটি API call-এ এটি পাঠানো হবে
//      এটিই সার্ভারকে প্রমাণ করে যে request আসল Telegram user-এর
// ============================================================
const INIT_DATA = tg.initData || '';

// ============================================================
//  API কল হেল্পার
//  — GET এর জন্য query param, POST এর জন্য body-তে initData যোগ
// ============================================================
async function apiCall(action, method = 'GET', body = null) {
    try {
        let url = `${API_URL}?action=${action}`;

        if (method === 'GET') {
            // GET এ initData query string-এ (encode করে)
            if (INIT_DATA) url += `&initData=${encodeURIComponent(INIT_DATA)}`;
            if (body) Object.keys(body).forEach(k => (url += `&${k}=${encodeURIComponent(body[k])}`));
        }

        const opts = { method };
        if (method !== 'GET') {
            opts.headers = { 'Content-Type': 'application/json' };
            // POST body-তে initData সহ সব ডেটা পাঠানো হচ্ছে
            opts.body = JSON.stringify({ initData: INIT_DATA, ...(body || {}) });
        }

        const res = await fetch(url, opts);
        const data = await res.json();

        // সার্ভার 401 পাঠালে ইউজারকে জানানো
        if (res.status === 401) {
            showToastGlobal('error', 'সেশন মেয়াদোত্তীর্ণ। অ্যাপ রিস্টার্ট করুন।');
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

// ============================================================
//  লোডার স্টেপস
// ============================================================
const LOAD_STEPS = [
    'সংযোগ স্থাপন হচ্ছে...',
    'ব্যবহারকারী যাচাই হচ্ছে...',
    'তথ্য লোড হচ্ছে...',
    'কনফিগ আনা হচ্ছে...',
    'সব প্রস্তুত!',
];

// ============================================================
//  কম্পোনেন্ট: Loader
// ============================================================
function Loader({ step, hiding }) {
    const pct = Math.round((step / 5) * 100);
    return (
        <div className="loader-overlay" style={hiding ? { opacity: 0, transform: 'scale(1.04)' } : {}}>
            <div className="loader-orb loader-orb-1" />
            <div className="loader-orb loader-orb-2" />
            <div className="loader-orb loader-orb-3" />
            <div className="loader-inner">
                <div className="loader-ring-wrap">
                    <div className="loader-ring" />
                    <div className="loader-ring-2" />
                    <div className="loader-icon-center">
                        <i className="fa-solid fa-wallet" />
                    </div>
                </div>
                <div className="loader-brand">আর্ন ওয়ালেট</div>
                <div className="loader-progress-wrap">
                    <div className="loader-segs">
                        {[0,1,2,3,4].map(i => (
                            <div key={i} className={`loader-seg ${i < step ? 'done' : i === step ? 'active' : ''}`}>
                                <div className="loader-seg-fill" />
                            </div>
                        ))}
                    </div>
                    <span className="loader-pct">{tobn(pct)}%</span>
                </div>
                <p className="loader-step-text">{step < LOAD_STEPS.length ? LOAD_STEPS[step] : 'সব প্রস্তুত!'}</p>
                <div className="loader-dots">
                    <div className="loader-dot" /><div className="loader-dot" /><div className="loader-dot" />
                </div>
            </div>
        </div>
    );
}

// ============================================================
//  কম্পোনেন্ট: Toast
// ============================================================
function Toast({ type, msg, show }) {
    let icon = 'fas fa-info-circle';
    if (type === 'success') icon = 'fas fa-check-circle';
    else if (type === 'error') icon = 'fas fa-exclamation-circle';
    else if (type === 'warning') icon = 'fas fa-exclamation-triangle';
    return (
        <div className={`toast ${type} ${show ? 'show' : ''}`}>
            <i className={icon} />
            <span>{msg}</span>
        </div>
    );
}

// ============================================================
//  কম্পোনেন্ট: Home Page
// ============================================================
function HomePage({ appState, onCopy, onShare }) {
    const u = appState.user;
    const cfg = appState.config;
    const sym = cfg.currencySymbol || 'টাকা';
    const botUsername = cfg.botUsername || 'YourBotUsername';
    const userId = u.id || tg.initDataUnsafe?.user?.id || '';
    const refLink = `https://t.me/${botUsername}/app?startapp=${userId}`;
    const refBonus = cfg.referralBonus || 0;
    const totalAdViews = Object.values(u.dailyAds || {}).reduce((s, c) => s + c, 0);

    return (
        <div id="p-home" className="page active">
            <div style={{ padding: '0 2px 4px' }}>
                <span className="bonus-badge bounce-item">
                    <i className="fas fa-bolt" /> প্রতিদিন আয় করুন!
                </span>
            </div>
            <div className="stats-grid">
                <div className="stat-card bounce-item">
                    <div className="stat-icon blue"><i className="fas fa-video" /></div>
                    <p>বিজ্ঞাপন দেখা</p>
                    <h4>{tobn(totalAdViews)}</h4>
                </div>
                <div className="stat-card bounce-item-2">
                    <div className="stat-icon purple"><i className="fas fa-users" /></div>
                    <p>মোট রেফারেল</p>
                    <h4>{tobn(u.referrals || 0)}</h4>
                </div>
                <div className="stat-card bounce-item-3">
                    <div className="stat-icon green"><i className="fas fa-tasks" /></div>
                    <p>সম্পন্ন কাজ</p>
                    <h4>{tobn(u.completedTaskCount || 0)}</h4>
                </div>
                <div className="stat-card bounce-item">
                    <div className="stat-icon orange"><i className="fas fa-coins" /></div>
                    <p>মোট আয়</p>
                    <h4>{tobn((u.totalEarned || 0).toFixed(2))}</h4>
                </div>
            </div>
            <div className="ref-card">
                <div className="ref-card-top">
                    <div className="ref-card-icon"><i className="fas fa-share-alt" /></div>
                    <div className="ref-card-title">
                        <h4>বন্ধুদের আমন্ত্রণ করুন</h4>
                        <span className="ref-promo-bounce">
                            বন্ধুকে আমন্ত্রণ করুন ও {refBonus} {sym} বোনাস পান!
                        </span>
                    </div>
                </div>
                <div className="ref-label">আপনার রেফারেল লিংক</div>
                <div className="ref-input-wrap">
                    <input className="ref-inp" readOnly value={refLink} onChange={() => {}} />
                    <button className="btn-copy" onClick={() => onCopy(refLink)}>
                        <i className="far fa-copy" /> কপি
                    </button>
                </div>
                <button onClick={() => onShare(refLink)} className="btn-share">
                    <i className="fab fa-telegram-plane" /> টেলিগ্রামে শেয়ার করুন
                </button>
            </div>
        </div>
    );
}

// ============================================================
//  কম্পোনেন্ট: Earn Page
// ============================================================
function EarnPage({ appState, onAdDone, onTaskBegin }) {
    const cfg = appState.config;
    const u   = appState.user;
    const sym = cfg.currencySymbol || 'টাকা';
    const now = Date.now();
    const slots   = cfg.adSlots || [];
    const adLimit = cfg.dailyAdLimit || 10;
    const today   = new Date().toISOString().slice(0, 10);
    const tasks   = cfg.webTasks || {};
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
        <div id="p-earn" className="page active">
            <div className="sec-head"><i className="fas fa-tv" /> বিজ্ঞাপন দেখুন ও আয় করুন</div>
            {slots.length === 0 ? (
                <div className="empty-state" style={{ gridColumn: '1/-1' }}>
                    <i className="fas fa-tv" />বর্তমানে কোনো বিজ্ঞাপন নেই।
                </div>
            ) : (
                <div className="ad-grid">
                    {slots.map((s, i) => (
                        <AdBox
                            key={s.id}
                            slot={s}
                            index={i}
                            done={u.lastActive === today ? (u.dailyAds?.[s.id] || 0) : 0}
                            limit={adLimit}
                            onAdDone={onAdDone}
                        />
                    ))}
                </div>
            )}
            <div className="sec-head" style={{ marginTop: 30 }}>
                <i className="fas fa-check-square" /> বিশেষ কাজসমূহ
            </div>
            {pendingTasks.length === 0 && completedTasks.length === 0 ? (
                <div className="empty-state">
                    <i className="fas fa-clipboard-check" />এখন কোনো কাজ নেই।
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
//  কম্পোনেন্ট: Ad Box
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
                alert('বিজ্ঞাপন নেটওয়ার্ক প্রস্তুত হচ্ছে। আবার চেষ্টা করুন।');
                setLoading(false);
                return;
            }
            await providerFunc;
            // বিজ্ঞাপন সফলভাবে দেখা হয়েছে — সার্ভারকে জানানো হচ্ছে
            await onAdDone(slot.id);
            tg.HapticFeedback.notificationOccurred('success');
        } catch {
            // ইউজার বিজ্ঞাপন বাতিল করেছে
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="ad-box" style={{ animationDelay: `${index * 0.08}s` }}>
            <div className="ad-box-icon"><i className="fas fa-tv" /></div>
            <h4>বিজ্ঞাপন {tobn(index + 1)}</h4>
            <div className="ad-counter">সম্পন্ন: {tobn(done)}/{tobn(limit)}</div>
            <button className="ad-action-btn" onClick={triggerAd} disabled={maxed || loading}>
                {loading ? (
                    <><i className="fas fa-spinner fa-spin" /> লোড হচ্ছে...</>
                ) : maxed ? (
                    <><i className="fas fa-lock" /> সম্পন্ন</>
                ) : (
                    <><i className="fas fa-play" /> দেখুন</>
                )}
            </button>
        </div>
    );
}

// ============================================================
//  কম্পোনেন্ট: Task Item
// ============================================================
function TaskItem({ id, task, history, sym, now, onBegin }) {
    const [state, setState] = useState('idle');
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

    return (
        <div className="task-item" style={{ opacity: isDailyDone ? 0.5 : 1 }}>
            <div className="task-left">
                <img
                    src={task.icon || 'https://via.placeholder.com/46'}
                    className="task-icon"
                    alt={task.name}
                />
                <div className="task-info">
                    <h4>{task.name}</h4>
                    <div className="task-reward">+{task.reward} {sym}</div>
                </div>
            </div>
            {isDailyDone ? (
                <button className="btn-act btn-wait" disabled>
                    {tobn(hrs)}ঘ {tobn(mins)}মি বাকি
                </button>
            ) : state === 'idle' ? (
                <button className="btn-act btn-start" onClick={handleStart}>শুরু করুন</button>
            ) : state === 'waiting' ? (
                <button className="btn-act btn-wait" disabled>
                    {tobn(countdown)} সেকেন্ড বাকি
                </button>
            ) : (
                <button className="btn-act btn-claim" onClick={handleClaim}>পুরস্কার নিন</button>
            )}
        </div>
    );
}

// ============================================================
//  কম্পোনেন্ট: Withdraw Page
// ============================================================
function WithdrawPage({ appState, onWithdraw }) {
    const cfg = appState.config;
    const u   = appState.user;
    const sym = cfg.currencySymbol || 'টাকা';
    const methods = cfg.withdrawMethods || [];
    const minRef  = cfg.minWithdrawReferrals || 0;

    const [method, setMethod]         = useState('');
    const [account, setAccount]       = useState('');
    const [amount, setAmount]         = useState('');
    const [processing, setProcessing] = useState(false);

    const selectedMethod = methods.find(m => m.name === method) || methods[0];
    const sysMin = parseFloat(selectedMethod?.min || 10);

    const statusMap = { pending: 'অপেক্ষায়', completed: 'সম্পন্ন', rejected: 'বাতিল' };
    const iconMap   = { completed: 'fas fa-check-circle', rejected: 'fas fa-times-circle', pending: 'fas fa-clock' };
    const colorMap  = { completed: 'var(--success)', rejected: 'var(--danger)', pending: 'var(--warning)' };

    async function handleSubmit() {
        if (processing) return;
        if (u.referrals < minRef) {
            showToastGlobal('warning', `উত্তোলনের জন্য ন্যূনতম ${tobn(minRef)} টি রেফারেল প্রয়োজন।`);
            tg.HapticFeedback.notificationOccurred('warning');
            return;
        }
        const reqAmt = parseFloat(amount);
        if (!account || account.trim().length < 3) {
            showToastGlobal('error', 'সঠিক একাউন্ট নম্বর দিন।'); return;
        }
        if (!reqAmt || isNaN(reqAmt) || reqAmt < sysMin) {
            showToastGlobal('error', `সর্বনিম্ন উত্তোলন পরিমাণ ${tobn(sysMin)} টাকা।`);
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        if (reqAmt > u.balance) {
            showToastGlobal('error', 'ব্যালেন্স পর্যাপ্ত নেই।');
            tg.HapticFeedback.notificationOccurred('error'); return;
        }
        setProcessing(true);
        const ok = await onWithdraw({ userId: u.id, userName: u.firstName, amount: reqAmt, method, account: account.trim() });
        setProcessing(false);
        if (ok) { setAmount(''); setAccount(''); }
    }

    return (
        <div id="p-profile" className="page active">
            <div className="sec-head"><i className="fas fa-wallet" /> উত্তোলন করুন</div>
            <div className="info-card">
                <i className="fas fa-info-circle" />
                <div>
                    <p>
                        <strong>সর্বনিম্ন ব্যালেন্স:</strong> উত্তোলনের জন্য ন্যূনতম{' '}
                        <strong>{tobn(sysMin)}</strong> টাকা থাকতে হবে।
                    </p>
                    <p style={{ marginTop: 6 }}>
                        <strong>রেফারেল শর্ত:</strong> ন্যূনতম{' '}
                        <strong>{tobn(minRef)}</strong> টি সফল রেফারেল প্রয়োজন।
                    </p>
                </div>
            </div>
            <div className="input-group">
                <i className="fas fa-building input-icon" />
                <select className="inp" value={method} onChange={e => setMethod(e.target.value)}>
                    {methods.map(m => (
                        <option key={m.name} value={m.name}>{m.name} (সর্বনিম্ন {tobn(m.min)})</option>
                    ))}
                </select>
            </div>
            <div className="input-group">
                <i className="fas fa-mobile-alt input-icon" />
                <input className="inp" placeholder="একাউন্ট নম্বর বা ট্যাগ লিখুন" value={account} onChange={e => setAccount(e.target.value)} />
            </div>
            <div className="input-group">
                <i className="fas fa-coins input-icon" />
                <input className="inp" type="number" placeholder="উত্তোলনের পরিমাণ" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <button className="btn-submit" onClick={handleSubmit} disabled={processing}>
                {processing
                    ? <><i className="fas fa-spinner fa-spin" /> প্রক্রিয়া চলছে...</>
                    : <><i className="fas fa-paper-plane" /> পেআউট অনুরোধ করুন</>
                }
            </button>
            <div className="sec-head" style={{ marginTop: 36 }}>
                <i className="fas fa-history" /> সাম্প্রতিক লেনদেন
            </div>
            <div className="hist-container">
                {(!appState.history || appState.history.length === 0) ? (
                    <div className="empty-state">
                        <i className="fas fa-receipt" />এখন পর্যন্ত কোনো লেনদেন নেই।
                    </div>
                ) : appState.history.map((d, idx) => {
                    const sl = d.status?.toLowerCase() || 'pending';
                    const dt = new Date(d.timestamp);
                    return (
                        <div className="hist-item" key={idx}>
                            <div className="hist-left">
                                <div className="hist-icon">
                                    <i className={iconMap[sl] || 'fas fa-arrow-right'} style={{ color: colorMap[sl] }} />
                                </div>
                                <div className="hist-info">
                                    <h4>{d.method}</h4>
                                    <small>
                                        {dt.toLocaleDateString('bn-BD')} &middot;{' '}
                                        {dt.toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                                    </small>
                                </div>
                            </div>
                            <div className="hist-right">
                                <span className="hist-amt">{tobn(d.amount)} {sym}</span>
                                <span className={`badge status-${sl}`}>{statusMap[sl] || sl}</span>
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
//  গ্লোবাল Toast রেফারেন্স
// ============================================================
let showToastGlobal = () => {};

// ============================================================
//  মূল App কম্পোনেন্ট
// ============================================================
export default function App() {
    const tgUser = tg.initDataUnsafe?.user || { id: 'Dev', first_name: 'ব্যবহারকারী', photo_url: '' };

    const [loaderStep,  setLoaderStep]  = useState(0);
    const [loaderHide,  setLoaderHide]  = useState(false);
    const [appReady,    setAppReady]    = useState(false);
    const [activePage,  setActivePage]  = useState('home');
    const [toast,       setToast]       = useState({ show: false, type: 'success', msg: '' });
    const [appState,    setAppState]    = useState({
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

    // ===== অ্যাপ লোড =====
    useEffect(() => {
        const cached = localStorage.getItem(`app_${tgUser.id}`);
        if (cached) {
            try { setAppState(JSON.parse(cached)); } catch {}
        }

        let step = 0;
        const timer = setInterval(() => {
            step++;
            if (step >= 4) { clearInterval(timer); return; }
            setLoaderStep(step);
        }, 600);

        (async () => {
            try {
                // initData সহ login — সার্ভার এটি HMAC দিয়ে যাচাই করবে
                const [config, user] = await Promise.all([
                    apiCall('getConfig'),
                    apiCall('login', 'POST', {
                        id:        tgUser.id,
                        firstName: tgUser.first_name,
                        photoUrl:  tgUser.photo_url || '',
                        refId:     tg.initDataUnsafe?.start_param || '',
                    }),
                ]);

                // getHistory-তেও initData পাঠানো হচ্ছে
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

                clearInterval(timer);
                setLoaderStep(5);
                setTimeout(() => {
                    setLoaderHide(true);
                    setTimeout(() => setAppReady(true), 480);
                }, 500);

            } catch {
                clearInterval(timer);
                setAppReady(true);
                showToast('error', 'সার্ভারের সাথে সংযোগ ব্যর্থ। অফলাইন মোডে চলছে।');
            }
        })();

        return () => clearInterval(timer);
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    function loadAdScripts(adSlots) {
        adSlots.forEach(s => {
            if (s.network === 'monetag' && !document.querySelector(`script[data-zone="${s.id}"]`)) {
                const sc = document.createElement('script');
                sc.src = '//libtl.com/sdk.js';
                sc.dataset.zone = s.id;
                sc.dataset.sdk  = `show_${s.id}`;
                document.body.appendChild(sc);
            } else if (s.network === 'gigapub' && !document.querySelector(`script[src*="${s.id}"]`)) {
                const sc = document.createElement('script');
                sc.src = `https://ad.gigapub.tech/script?id=${s.id}`;
                document.body.appendChild(sc);
            }
        });
    }

    // ===== বিজ্ঞাপন পুরস্কার (সার্ভার amount নির্ধারণ করে) =====
    async function handleAdDone(slotId) {
        const today = new Date().toISOString().slice(0, 10);

        // সার্ভারে claimAdReward পাঠানো — সার্ভার reward গণনা করে ফেরত দেয়
        const res = await apiCall('claimAdReward', 'POST', { slotId });

        if (!res || res.error) {
            showToast('error', res?.error || 'পুরস্কার গ্রহণ ব্যর্থ হয়েছে।');
            return;
        }

        // সার্ভার থেকে প্রাপ্ত reward ব্যবহার করা হচ্ছে (client-generated নয়)
        const rwrd = res.reward;

        setAppState(prev => {
            const dailyAds = { ...(prev.user.dailyAds || {}) };
            if (prev.user.lastActive !== today) {
                Object.keys(dailyAds).forEach(k => delete dailyAds[k]);
            }
            dailyAds[slotId] = (dailyAds[slotId] || 0) + 1;
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance:     res.newBalance,      // সার্ভার-যাচাইকৃত balance
                    totalEarned: (prev.user.totalEarned || 0) + rwrd,
                    dailyAds,
                    lastActive: today,
                },
            };
            saveLocal(next);
            return next;
        });

        showToast('success', `পুরস্কার পেয়েছেন! +${rwrd} টাকা`);
    }

    // ===== টাস্ক পুরস্কার (সার্ভার duplicate-claim প্রতিরোধ করে) =====
    async function handleTaskBegin(id, task) {
        const res = await apiCall('claimTaskReward', 'POST', { taskId: id });

        if (!res || res.error) {
            showToast('error', res?.error || 'পুরস্কার গ্রহণ ব্যর্থ হয়েছে।');
            return;
        }

        const rwrd = res.reward;

        setAppState(prev => {
            const next = {
                ...prev,
                user: {
                    ...prev.user,
                    balance:            res.newBalance,   // সার্ভার-যাচাইকৃত balance
                    totalEarned:        (prev.user.totalEarned || 0) + rwrd,
                    taskHistory:        { ...(prev.user.taskHistory || {}), [id]: { ts: Date.now() } },
                    completedTaskCount: (prev.user.completedTaskCount || 0) + 1,
                },
            };
            saveLocal(next);
            return next;
        });

        showToast('success', 'কাজ সম্পন্ন! পুরস্কার যোগ হয়েছে।');
        tg.HapticFeedback.notificationOccurred('success');
    }

    // ===== উইথড্র (সার্ভার server-side balance যাচাই করে) =====
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
            showToast('success', 'উত্তোলনের অনুরোধ সফলভাবে জমা হয়েছে!');
            tg.HapticFeedback.notificationOccurred('success');
            return true;
        } else {
            showToast('error', rData?.message || 'সার্ভার সমস্যা। পরে আবার চেষ্টা করুন।');
            return false;
        }
    }

    function handleCopy(link) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(link).then(() => showToast('success', 'লিংক কপি হয়েছে!'));
        } else {
            const tmp = document.createElement('input');
            tmp.value = link;
            document.body.appendChild(tmp);
            tmp.select();
            document.execCommand('copy');
            document.body.removeChild(tmp);
            showToast('success', 'লিংক কপি হয়েছে!');
        }
        tg.HapticFeedback.notificationOccurred('success');
    }

    function handleShare(link) {
        const shareText = 'এখনই যোগ দিন এবং সাথে সাথে আয় শুরু করুন!';
        tg.openTelegramLink(`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(shareText)}`);
    }

    function openSupport() {
        if (appState.config.supportLink) tg.openLink(appState.config.supportLink);
        else showToast('warning', 'সাপোর্ট লিংক এখনো সেট করা হয়নি।');
    }

    async function handleNav(page) {
        setActivePage(page);
        try { tg.HapticFeedback.impactOccurred('light'); } catch {}
        if (page === 'withdraw') {
            const data = await apiCall('getHistory', 'POST', { id: appState.user.id });
            if (data) {
                setAppState(prev => {
                    const n = { ...prev, history: data };
                    saveLocal(n);
                    return n;
                });
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

            {!appReady && <Loader step={loaderStep} hiding={loaderHide} />}
            <Toast type={toast.type} msg={toast.msg} show={toast.show} />

            {appReady && (
                <>
                    <div className="top-nav">
                        <div className="user-pill">
                            <div className="user-avatar-wrap">
                                <img
                                    src={u.photoUrl || 'https://i.ibb.co/3cY1qyd/placeholder.png'}
                                    alt="ব্যবহারকারী"
                                />
                                <div className="avatar-badge" />
                            </div>
                            <div className="user-info">
                                <h3>{u.firstName || tgUser.first_name}</h3>
                                <p>আইডি: {u.id || tgUser.id}</p>
                            </div>
                        </div>
                        <button className="notif-btn" onClick={openSupport} title="সহায়তা" aria-label="সহায়তা">
                            <i className="far fa-bell" />
                        </button>
                    </div>

                    {activePage === 'home' && (
                        <div className="master-card">
                            <div className="bal-label">মোট ব্যালেন্স</div>
                            <div className="bal-amt">
                                {tobn((u.balance || 0).toFixed(2))}
                                <span className="bal-sym"> {sym}</span>
                            </div>
                            <div className="bal-footer">
                                <div className="bal-mini">
                                    <span>মোট আয়</span>
                                    <span>{tobn((u.totalEarned || 0).toFixed(2))}</span>
                                </div>
                                <div className="bal-mini">
                                    <span>রেফারেল</span>
                                    <span>{tobn(u.referrals || 0)}</span>
                                </div>
                                <div className="bal-mini">
                                    <span>বিজ্ঞাপন দেখা</span>
                                    <span>{tobn(totalAdViews)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activePage === 'home' && (
                        <HomePage appState={appState} onCopy={handleCopy} onShare={handleShare} />
                    )}
                    {activePage === 'earn' && (
                        <EarnPage appState={appState} onAdDone={handleAdDone} onTaskBegin={handleTaskBegin} />
                    )}
                    {activePage === 'withdraw' && (
                        <WithdrawPage appState={appState} onWithdraw={handleWithdraw} />
                    )}

                    <nav className="bottom-nav" role="navigation">
                        <div
                            className={`nav-item ${activePage === 'home' ? 'active' : ''}`}
                            onClick={() => handleNav('home')}
                            role="button"
                            aria-label="হোম"
                        >
                            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f3e0.png" alt="হোম" />
                            <span>হোম</span>
                            <div className="nav-dot" />
                        </div>
                        <div
                            className={`nav-item ${activePage === 'earn' ? 'active' : ''}`}
                            onClick={() => handleNav('earn')}
                            role="button"
                            aria-label="কাজ"
                        >
                            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f4b0.png" alt="কাজ" />
                            <span>কাজ</span>
                            <div className="nav-dot" />
                        </div>
                        <div
                            className={`nav-item ${activePage === 'withdraw' ? 'active' : ''}`}
                            onClick={() => handleNav('withdraw')}
                            role="button"
                            aria-label="উত্তোলন"
                        >
                            <img src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/1f381.png" alt="উত্তোলন" />
                            <span>উত্তোলন</span>
                            <div className="nav-dot" />
                        </div>
                    </nav>
                </>
            )}
        </>
    );
}
