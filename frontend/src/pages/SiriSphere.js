import { useState } from "react";

/* ─────────────────────────────────────────────────────────────
   SiriSphere — animated AI voice globe
   Props:
     isSpeaking {boolean}  — true = full energy, false = gentle idle pulse
   ───────────────────────────────────────────────────────────── */

const styles = `
  /* ── Reset & base ─────────────────────────────────────────── */
  .ss-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: box-shadow 0.8s ease;
  }

  /* ── Outer glow ring (on wrapper) ──────────────────────────── */
  .ss-wrapper.speaking {
    animation: ss-glow-speak 2s infinite ease-in-out;
  }
  .ss-wrapper.idle {
    animation: ss-glow-idle 4s infinite ease-in-out;
  }

  @keyframes ss-glow-speak {
    0%, 100% {
      box-shadow:
        0 0 20px 4px rgba(0, 255, 220, 0.55),
        0 0 55px 10px rgba(180, 0, 255, 0.3),
        0 0 100px 20px rgba(0, 140, 255, 0.18);
    }
    33% {
      box-shadow:
        0 0 25px 6px rgba(255, 0, 200, 0.6),
        0 0 65px 14px rgba(0, 220, 255, 0.35),
        0 0 120px 25px rgba(80, 255, 160, 0.2);
    }
    66% {
      box-shadow:
        0 0 22px 5px rgba(60, 80, 255, 0.6),
        0 0 58px 12px rgba(255, 0, 140, 0.32),
        0 0 110px 22px rgba(0, 255, 200, 0.18);
    }
  }

  @keyframes ss-glow-idle {
    0%, 100% {
      box-shadow:
        0 0 8px 2px rgba(0, 200, 255, 0.2),
        0 0 22px 5px rgba(120, 0, 255, 0.1);
    }
    50% {
      box-shadow:
        0 0 14px 3px rgba(0, 200, 255, 0.35),
        0 0 35px 8px rgba(180, 0, 255, 0.18);
    }
  }

  /* ── Sphere shell ───────────────────────────────────────────── */
  .ss-sphere {
    position: relative;
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    background: radial-gradient(circle at 42% 38%, #10102a 0%, #000008 100%);
    box-shadow:
      0 0 0 1px rgba(255,255,255,0.07),
      inset 0 0 28px rgba(0,0,0,0.9);
    transition: filter 0.8s ease;
  }

  /* Glassy specular highlight */
  .ss-sphere::before {
    content: '';
    position: absolute;
    top: 7%;
    left: 13%;
    width: 36%;
    height: 26%;
    background: radial-gradient(ellipse, rgba(255,255,255,0.22) 0%, transparent 80%);
    border-radius: 50%;
    z-index: 30;
    pointer-events: none;
  }

  /* Bottom rim light */
  .ss-sphere::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: radial-gradient(ellipse at 68% 82%, rgba(0,180,255,0.14) 0%, transparent 58%);
    z-index: 29;
    pointer-events: none;
  }

  /* ── Shared layer base ──────────────────────────────────────── */
  .ss-layer {
    position: absolute;
    width: 165%;
    height: 165%;
    border-radius: 42%;
    mix-blend-mode: screen;
    will-change: transform, filter, opacity;
    transition: opacity 0.9s ease, animation-duration 0.9s ease;
  }

  /* ── SPEAKING layer colors & speeds ────────────────────────── */
  .speaking .ss-l1 {
    background: radial-gradient(ellipse 62% 55% at 40% 38%, #00ffe8 0%, #00aaff 35%, transparent 65%);
    opacity: 0.8;
    top: -32%; left: -32%;
    animation: ss-wave1 2.6s infinite ease-in-out;
  }
  .speaking .ss-l2 {
    background: radial-gradient(ellipse 68% 58% at 62% 55%, #ff00cc 0%, #cc00ff 32%, transparent 64%);
    opacity: 0.72;
    top: -28%; right: -32%;
    animation: ss-wave2 3.2s infinite ease-in-out;
    animation-delay: -1.1s;
  }
  .speaking .ss-l3 {
    background: radial-gradient(ellipse 58% 62% at 48% 65%, #1a44ff 0%, #5500ff 38%, transparent 68%);
    opacity: 0.68;
    bottom: -32%; left: -12%;
    animation: ss-wave3 2.9s infinite ease-in-out;
    animation-delay: -0.6s;
  }
  .speaking .ss-l4 {
    background: radial-gradient(ellipse 48% 46% at 56% 44%, #00ff88 0%, #bbff00 38%, transparent 70%);
    opacity: 0.5;
    top: -22%; right: -22%;
    animation: ss-wave4 4s infinite ease-in-out;
    animation-delay: -2.2s;
  }
  .speaking .ss-l5 {
    background: radial-gradient(ellipse 44% 40% at 44% 58%, #ff5500 0%, #ff0055 48%, transparent 72%);
    opacity: 0.42;
    bottom: -22%; right: -26%;
    animation: ss-wave5 4.8s infinite ease-in-out;
    animation-delay: -3.1s;
  }
  .speaking .ss-core {
    position: absolute;
    width: 52%;
    height: 52%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(255,255,255,0.5) 0%, transparent 72%);
    mix-blend-mode: screen;
    opacity: 0.95;
    z-index: 20;
    animation: ss-core-speak 2s infinite ease-in-out;
  }

  /* ── IDLE layer colors — cooler, slower, dimmer ─────────────── */
  .idle .ss-l1 {
    background: radial-gradient(ellipse 55% 50% at 42% 40%, #00ccff 0%, #1c8af7 40%, transparent 68%);
    opacity: 0.35;
    top: -32%; left: -32%;
    animation: ss-idle1 5s infinite ease-in-out;
  }
  .idle .ss-l2 {
    background: radial-gradient(ellipse 60% 52% at 58% 52%, #aa00ff 0%, #cc00aa 38%, transparent 66%);
    opacity: 0.3;
    top: -28%; right: -32%;
    animation: ss-idle2 6.5s infinite ease-in-out;
    animation-delay: -2s;
  }
  .idle .ss-l3 {
    background: radial-gradient(ellipse 50% 55% at 50% 60%, #0033ff 0%, #33aa00 42%, transparent 70%);
    opacity: 0.28;
    bottom: -32%; left: -12%;
    animation: ss-idle3 5.8s infinite ease-in-out;
    animation-delay: -1.4s;
  }
  .idle .ss-l4 {
    background: radial-gradient(ellipse 42% 40% at 55% 45%, #00cc66 0%, #005533 42%, transparent 72%);
    opacity: 0.2;
    top: -22%; right: -22%;
    animation: ss-idle4 7s infinite ease-in-out;
    animation-delay: -3.5s;
  }
  .idle .ss-l5 {
    background: radial-gradient(ellipse 38% 36% at 46% 55%, #cc3300 0%, #880022 50%, transparent 74%);
    opacity: 0.16;
    bottom: -22%; right: -26%;
    animation: ss-idle5 8s infinite ease-in-out;
    animation-delay: -5s;
  }
  .idle .ss-core {
    position: absolute;
    width: 44%;
    height: 44%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(200,220,255,0.35) 0%, transparent 72%);
    mix-blend-mode: screen;
    opacity: 0.6;
    z-index: 20;
    animation: ss-core-idle 4s infinite ease-in-out;
  }

  /* ── Speaking keyframes — high energy ──────────────────────── */
  @keyframes ss-wave1 {
    0%   { transform: rotate(0deg)    scale(1)    translate(0,0);      filter: hue-rotate(0deg)   brightness(1);   }
    28%  { transform: rotate(105deg)  scale(1.28) translate(9px,-11px); filter: hue-rotate(35deg)  brightness(1.4); }
    58%  { transform: rotate(205deg)  scale(0.9)  translate(-7px,9px);  filter: hue-rotate(65deg)  brightness(0.88);}
    100% { transform: rotate(360deg)  scale(1)    translate(0,0);      filter: hue-rotate(0deg)   brightness(1);   }
  }
  @keyframes ss-wave2 {
    0%   { transform: rotate(0deg)    scale(1.05) translate(0,0);      filter: hue-rotate(0deg)   brightness(1);   }
    32%  { transform: rotate(-125deg) scale(1.32) translate(-10px,8px); filter: hue-rotate(-42deg) brightness(1.45);}
    62%  { transform: rotate(-225deg) scale(0.87) translate(8px,-10px); filter: hue-rotate(-22deg) brightness(0.82);}
    100% { transform: rotate(-360deg) scale(1.05) translate(0,0);      filter: hue-rotate(0deg)   brightness(1);   }
  }
  @keyframes ss-wave3 {
    0%   { transform: rotate(40deg)   scale(1)    translate(0,0);      filter: hue-rotate(0deg)  brightness(1);   }
    38%  { transform: rotate(162deg)  scale(1.22) translate(11px,7px);  filter: hue-rotate(52deg) brightness(1.25);}
    68%  { transform: rotate(258deg)  scale(0.93) translate(-9px,-6px); filter: hue-rotate(22deg) brightness(1);   }
    100% { transform: rotate(400deg)  scale(1)    translate(0,0);      filter: hue-rotate(0deg)  brightness(1);   }
  }
  @keyframes ss-wave4 {
    0%   { transform: rotate(0deg)    scale(0.92) translate(0,0);  opacity: 0.5; }
    50%  { transform: rotate(180deg)  scale(1.18) translate(6px,-9px); opacity: 0.65; }
    100% { transform: rotate(360deg)  scale(0.92) translate(0,0);  opacity: 0.5; }
  }
  @keyframes ss-wave5 {
    0%   { transform: rotate(0deg)    scale(1)    translate(0,0);  opacity: 0.42; }
    50%  { transform: rotate(-180deg) scale(1.22) translate(-7px,5px); opacity: 0.58; }
    100% { transform: rotate(-360deg) scale(1)    translate(0,0);  opacity: 0.42; }
  }
  @keyframes ss-core-speak {
    0%, 100% { transform: scale(1);    opacity: 0.95; }
    50%       { transform: scale(1.22); opacity: 0.65; }
  }

  /* ── Idle keyframes — gentle drift with subtle vibration ────── */
  @keyframes ss-idle1 {
    0%   { transform: rotate(0deg)   scale(0.95) translate(0,0);      filter: hue-rotate(0deg)  brightness(0.9); }
    20%  { transform: rotate(1.5deg) scale(0.97) translate(1px,-1px);  filter: hue-rotate(5deg)  brightness(0.95);}
    40%  { transform: rotate(72deg)  scale(1.08) translate(4px,-5px);  filter: hue-rotate(15deg) brightness(1.1); }
    60%  { transform: rotate(-1deg)  scale(0.96) translate(-1px,1px);  filter: hue-rotate(8deg)  brightness(0.92);}
    80%  { transform: rotate(150deg) scale(1.04) translate(-3px,4px);  filter: hue-rotate(10deg) brightness(1.05);}
    100% { transform: rotate(360deg) scale(0.95) translate(0,0);      filter: hue-rotate(0deg)  brightness(0.9); }
  }
  @keyframes ss-idle2 {
    0%   { transform: rotate(0deg)    scale(1)    translate(0,0);      filter: hue-rotate(0deg) brightness(0.85);}
    25%  { transform: rotate(-0.8deg) scale(1.01) translate(-0.5px,0.5px); }
    45%  { transform: rotate(-90deg)  scale(1.1)  translate(-5px,4px); filter: hue-rotate(-18deg) brightness(1.08);}
    70%  { transform: rotate(0.6deg)  scale(0.98) translate(0.5px,-0.5px); }
    100% { transform: rotate(-360deg) scale(1)    translate(0,0);      filter: hue-rotate(0deg) brightness(0.85);}
  }
  @keyframes ss-idle3 {
    0%   { transform: rotate(30deg)  scale(0.94) translate(0,0);      }
    35%  { transform: rotate(30deg)  scale(0.95) translate(0.8px,-0.8px); }
    55%  { transform: rotate(148deg) scale(1.06) translate(5px,3px);   }
    75%  { transform: rotate(148deg) scale(1.05) translate(-0.6px,0.6px); }
    100% { transform: rotate(390deg) scale(0.94) translate(0,0);      }
  }
  @keyframes ss-idle4 {
    0%,100% { transform: rotate(0deg)   scale(0.9)  translate(0,0);  opacity: 0.2; }
    50%      { transform: rotate(180deg) scale(1.05) translate(3px,-4px); opacity: 0.28; }
  }
  @keyframes ss-idle5 {
    0%,100% { transform: rotate(0deg)    scale(0.92) translate(0,0);  opacity: 0.16; }
    50%      { transform: rotate(-180deg) scale(1.08) translate(-4px,3px); opacity: 0.24; }
  }
  @keyframes ss-core-idle {
    0%, 100% { transform: scale(0.95); opacity: 0.55; }
    50%       { transform: scale(1.12); opacity: 0.7;  }
  }
`;

export default function SiriSphere({ isSpeaking = false }) {
  const mode = isSpeaking ? "speaking" : "idle";

  return (
    <>
      <style>{styles}</style>
      <div className={`ss-wrapper ${mode}`}>
        <div className={`ss-sphere ${mode}`}>
          <div className="ss-layer ss-l1" />
          <div className="ss-layer ss-l2" />
          <div className="ss-layer ss-l3" />
          <div className="ss-layer ss-l4" />
          <div className="ss-layer ss-l5" />
          <div className="ss-core" />
        </div>
      </div>
    </>
  );
}


