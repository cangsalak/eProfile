'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MaintenancePage() {
  const router = useRouter();
  const [dots, setDots] = useState('');
  const [maintenanceInfo, setMaintenanceInfo] = useState({
    isMaintenance: true,
    message: 'ระบบกำลังอยู่ระหว่างการปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการทำงาน ขออภัยในความไม่สะดวก',
    endTime: '',
  });

  // Animated dots
  useEffect(() => {
    const t = setInterval(() => setDots(d => d.length >= 3 ? '' : d + '.'), 600);
    return () => clearInterval(t);
  }, []);

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/settings/maintenance');
      if (res.ok) {
        const data = await res.json();
        setMaintenanceInfo(data);
        if (!data.isMaintenance) router.push('/');
      }
    } catch { /* ignore */ }
  }, [router]);

  useEffect(() => {
    checkStatus();
    const iv = setInterval(checkStatus, 15000);
    return () => clearInterval(iv);
  }, [checkStatus]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Prompt:wght@300;400;600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .maint-root {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #030712;
          font-family: 'Prompt', sans-serif;
          overflow: hidden;
          position: relative;
          padding: 2rem 1rem;
        }

        /* === Animated Mesh Background === */
        .mesh-bg {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .mesh-bg::before {
          content: '';
          position: absolute;
          width: 900px; height: 900px;
          top: -200px; left: -200px;
          background: radial-gradient(circle, rgba(251,191,36,0.08) 0%, transparent 70%);
          animation: drift1 18s ease-in-out infinite alternate;
        }
        .mesh-bg::after {
          content: '';
          position: absolute;
          width: 700px; height: 700px;
          bottom: -150px; right: -150px;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          animation: drift2 22s ease-in-out infinite alternate;
        }
        @keyframes drift1 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(80px, 60px) scale(1.1); }
        }
        @keyframes drift2 {
          from { transform: translate(0,0) scale(1); }
          to   { transform: translate(-60px, -80px) scale(1.15); }
        }

        /* Grid pattern */
        .grid-overlay {
          position: fixed;
          inset: 0;
          z-index: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 48px 48px;
        }

        /* Floating orbs */
        .orb {
          position: fixed;
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
          z-index: 0;
          animation: floatOrb linear infinite;
        }
        .orb-1 { width:320px; height:320px; background:#f59e0b; top:10%; left:5%;  animation-duration:20s; }
        .orb-2 { width:200px; height:200px; background:#6366f1; top:60%; right:8%; animation-duration:25s; animation-delay:-8s; }
        .orb-3 { width:150px; height:150px; background:#0ea5e9; bottom:15%; left:20%; animation-duration:18s; animation-delay:-5s; }
        @keyframes floatOrb {
          0%,100% { transform: translateY(0) scale(1); }
          50%      { transform: translateY(-40px) scale(1.05); }
        }

        /* === Card === */
        .card {
          position: relative;
          z-index: 10;
          width: 100%;
          max-width: 520px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 28px;
          padding: 3rem 2.5rem;
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          box-shadow:
            0 0 0 1px rgba(255,255,255,0.04) inset,
            0 32px 80px rgba(0,0,0,0.6),
            0 0 120px rgba(251,191,36,0.04);
          animation: cardIn 0.8s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes cardIn {
          from { opacity:0; transform: translateY(32px) scale(0.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* Top accent line */
        .card::before {
          content: '';
          position: absolute;
          top: 0; left: 10%; right: 10%;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(251,191,36,0.6), transparent);
          border-radius: 999px;
        }

        /* === Icon === */
        .icon-wrap {
          width: 80px; height: 80px;
          margin: 0 auto 1.75rem;
          position: relative;
          display: flex; align-items: center; justify-content: center;
        }
        .icon-ring {
          position: absolute;
          inset: 0;
          border-radius: 24px;
          border: 1.5px solid rgba(251,191,36,0.25);
          animation: ringPulse 2.5s ease-in-out infinite;
        }
        .icon-ring-2 {
          position: absolute;
          inset: -8px;
          border-radius: 32px;
          border: 1px solid rgba(251,191,36,0.10);
          animation: ringPulse 2.5s ease-in-out 0.6s infinite;
        }
        @keyframes ringPulse {
          0%,100% { opacity:1; transform: scale(1); }
          50%     { opacity:0.4; transform: scale(1.08); }
        }
        .icon-bg {
          width: 80px; height: 80px;
          background: linear-gradient(135deg, rgba(251,191,36,0.18) 0%, rgba(245,158,11,0.08) 100%);
          border-radius: 24px;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid rgba(251,191,36,0.2);
          position: relative;
          z-index: 1;
        }
        .icon-glow {
          position: absolute;
          inset: -4px;
          border-radius: 28px;
          background: rgba(251,191,36,0.12);
          filter: blur(16px);
          z-index: 0;
        }

        /* === Gear spin === */
        .gear { animation: gearSpin 6s linear infinite; display: inline-block; }
        @keyframes gearSpin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        /* === Badge === */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 14px;
          border-radius: 999px;
          background: rgba(251,191,36,0.08);
          border: 1px solid rgba(251,191,36,0.20);
          color: #fbbf24;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.05em;
          margin-bottom: 1.25rem;
        }
        .badge-dot {
          width: 6px; height: 6px;
          background: #f59e0b;
          border-radius: 50%;
          animation: pingDot 1.2s ease-in-out infinite;
        }
        @keyframes pingDot {
          0%,100% { transform:scale(1); opacity:1; }
          50%      { transform:scale(1.6); opacity:0.5; }
        }

        /* === Title === */
        .title {
          font-size: clamp(1.6rem, 5vw, 2.2rem);
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.02em;
          line-height: 1.2;
          margin-bottom: 0.75rem;
        }
        .subtitle {
          font-size: 0.875rem;
          color: rgba(255,255,255,0.45);
          line-height: 1.7;
          max-width: 380px;
          margin: 0 auto 1.75rem;
        }

        /* === Progress bar === */
        .progress-wrap {
          margin-bottom: 1.75rem;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: rgba(255,255,255,0.3);
          margin-bottom: 8px;
        }
        .progress-track {
          height: 4px;
          background: rgba(255,255,255,0.06);
          border-radius: 999px;
          overflow: hidden;
        }
        .progress-bar {
          height: 100%;
          width: 60%;
          background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d);
          border-radius: 999px;
          position: relative;
          animation: progressShimmer 2s ease-in-out infinite;
          background-size: 200% 100%;
        }
        @keyframes progressShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* === Status Row === */
        .status-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          margin-bottom: 1rem;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .status-icon { font-size: 13px; }
        .status-spinning { animation: spin 2s linear infinite; display: inline-block; }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        .status-row span:last-child { color: rgba(255,255,255,0.7); font-weight: 500; }

        /* Time badge */
        .time-badge {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          background: rgba(99,102,241,0.06);
          border: 1px solid rgba(99,102,241,0.15);
          border-radius: 14px;
          margin-bottom: 1.75rem;
          font-size: 12px;
          color: rgba(255,255,255,0.5);
        }
        .time-badge-val { color: #a5b4fc; font-weight: 600; }

        /* === Divider === */
        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 1.5rem 0;
        }

        /* === Buttons === */
        .btn-row {
          display: flex;
          gap: 10px;
        }
        .btn {
          flex: 1;
          padding: 11px 16px;
          border-radius: 14px;
          font-size: 13px;
          font-weight: 600;
          font-family: 'Prompt', sans-serif;
          cursor: pointer;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.2s ease;
          text-decoration: none;
        }
        .btn-ghost {
          background: rgba(255,255,255,0.05);
          color: rgba(255,255,255,0.65);
          border: 1px solid rgba(255,255,255,0.08);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.09);
          color: #fff;
          border-color: rgba(255,255,255,0.14);
          transform: translateY(-1px);
        }
        .btn-primary {
          background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.3);
        }
        .btn-primary:hover {
          background: linear-gradient(135deg, #4338ca 0%, #4f46e5 100%);
          box-shadow: 0 6px 24px rgba(99,102,241,0.4);
          transform: translateY(-2px);
        }

        /* === Footer === */
        .footer {
          position: relative;
          z-index: 10;
          margin-top: 2rem;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
        }
        .footer-dot { width: 3px; height: 3px; background: rgba(255,255,255,0.2); border-radius: 50%; }
      `}</style>

      <div className="maint-root">
        {/* Background layers */}
        <div className="mesh-bg" />
        <div className="grid-overlay" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Main Card */}
        <div className="card">

          {/* Icon */}
          <div className="icon-wrap">
            <div className="icon-glow" />
            <div className="icon-ring" />
            <div className="icon-ring-2" />
            <div className="icon-bg">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="gear">
                <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" fill="#fbbf24"/>
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          {/* Badge */}
          <div style={{textAlign:'center'}}>
            <div className="badge" style={{margin:'0 auto 1.25rem'}}>
              <span className="badge-dot" />
              <span>โหมดปิดปรับปรุงระบบ (Maintenance Mode)</span>
            </div>
          </div>

          {/* Title */}
          <div style={{textAlign:'center'}}>
            <h1 className="title">กำลังปรับปรุงเว็บไซต์{dots}</h1>
            <p className="subtitle">{maintenanceInfo.message}</p>
          </div>

          {/* Progress */}
          <div className="progress-wrap">
            <div className="progress-label">
              <span>กำลังดำเนินการปรับปรุง</span>
              <span>กรุณารอสักครู่</span>
            </div>
            <div className="progress-track">
              <div className="progress-bar" />
            </div>
          </div>

          {/* Status row */}
          <div className="status-row">
            <span className="status-icon">
              <svg className="status-spinning" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round">
                <path d="M21 12a9 9 0 11-9-9" />
              </svg>
            </span>
            <span>ตรวจสอบสถานะทุก 15 วินาที —</span>
            <span>ระบบจะนำท่านกลับสู่เว็บไซต์อัตโนมัติ</span>
          </div>

          {/* Estimated time (conditional) */}
          {maintenanceInfo.endTime && (
            <div className="time-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>คาดว่าจะเปิดให้บริการ:</span>
              <span className="time-badge-val">{maintenanceInfo.endTime}</span>
            </div>
          )}

          {/* Divider */}
          <div className="divider" />

          {/* Buttons */}
          <div className="btn-row">
            <button
              type="button"
              onClick={checkStatus}
              className="btn btn-ghost"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/>
              </svg>
              ตรวจสอบสถานะ
            </button>
            <Link href="/login" className="btn btn-primary">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              เข้าสู่ระบบผู้ดูแล
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="footer">
          <span>eProfile System</span>
          <div className="footer-dot" />
          <span>ระบบทำเนียบบุคลากรและโปรไฟล์อิเล็กทรอนิกส์</span>
        </div>
      </div>
    </>
  );
}
