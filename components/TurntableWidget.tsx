"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

function buildLoFiEngine(ctx: AudioContext) {
  const master = ctx.createGain();
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(0.36, ctx.currentTime + 2);
  master.connect(ctx.destination);

  const warmth = ctx.createBiquadFilter();
  warmth.type = "lowpass";
  warmth.frequency.value = 3600;
  warmth.Q.value = 0.55;
  warmth.connect(master);

  // Tape-delay reverb
  const delayL = ctx.createDelay(0.7);
  const delayR = ctx.createDelay(0.5);
  delayL.delayTime.value = 0.27;
  delayR.delayTime.value = 0.34;
  const fbL = ctx.createGain(); fbL.gain.value = 0.27; delayL.connect(fbL); fbL.connect(delayL);
  const fbR = ctx.createGain(); fbR.gain.value = 0.27; delayR.connect(fbR); fbR.connect(delayR);
  const revOut = ctx.createGain(); revOut.gain.value = 0.2;
  delayL.connect(revOut); delayR.connect(revOut);
  revOut.connect(warmth);

  // Cmaj9 chord pad across 3 octaves
  const padFreqs = [65.4, 98, 130.8, 164.8, 196, 246.9, 261.6, 293.7];
  const padAmps  = [0.13, 0.08, 0.07, 0.05, 0.04, 0.03, 0.025, 0.02];
  const padOscs: OscillatorNode[] = [];

  padFreqs.forEach((fq, i) => {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = fq;
    osc.detune.value = (Math.random() - 0.5) * 7;

    const lfo  = ctx.createOscillator();
    const lfoG = ctx.createGain();
    lfo.frequency.value = 0.048 + i * 0.021;
    lfoG.gain.value = 2.6;
    lfo.connect(lfoG);
    lfoG.connect(osc.detune);
    lfo.start();

    g.gain.value = padAmps[i];
    osc.connect(g);
    g.connect(warmth);
    g.connect(delayL);
    g.connect(delayR);
    osc.start();
    padOscs.push(osc);
  });

  // Vinyl crackle
  const crackBuf = ctx.createBuffer(1, ctx.sampleRate * 4, ctx.sampleRate);
  const crackD   = crackBuf.getChannelData(0);
  for (let i = 0; i < crackD.length; i++) {
    crackD[i] = Math.random() < 0.0025 ? (Math.random() * 2 - 1) * 0.55 : 0;
  }
  const crackSrc = ctx.createBufferSource();
  crackSrc.buffer = crackBuf;
  crackSrc.loop   = true;
  const crackGain = ctx.createGain();
  crackGain.gain.value = 0.016;
  crackSrc.connect(crackGain);
  crackGain.connect(master);
  crackSrc.start();

  // Beat engine — 75 BPM, starts after 1 bar
  const bpm  = 75;
  const beat = 60 / bpm;
  let next   = ctx.currentTime + beat * 4;

  const noise = (len: number) => {
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
    const d   = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    return src;
  };

  const kick = (when: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.setValueAtTime(108, when);
    o.frequency.exponentialRampToValueAtTime(28, when + 0.3);
    g.gain.setValueAtTime(0.85, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.3);
    o.connect(g); g.connect(master);
    o.start(when); o.stop(when + 0.31);
  };

  const snare = (when: number) => {
    const src = noise(0.18);
    const bp  = ctx.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 850; bp.Q.value = 0.9;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.19, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.18);
    src.connect(bp); bp.connect(g); g.connect(master);
    src.start(when);
  };

  const hat = (when: number, vol = 0.1) => {
    const src = noise(0.06);
    const hp  = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 7500;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, when);
    g.gain.exponentialRampToValueAtTime(0.001, when + 0.055);
    src.connect(hp); hp.connect(g); g.connect(master);
    src.start(when);
  };

  const schedule = () => {
    while (next < ctx.currentTime + 0.5) {
      const b = Math.round(next / beat) % 4;
      if (b === 0) { kick(next); hat(next, 0.09); }
      if (b === 1) { hat(next, 0.07); hat(next + beat * 0.5, 0.055); }
      if (b === 2) { kick(next + beat * 0.25); snare(next); hat(next, 0.09); }
      if (b === 3) { hat(next, 0.07); hat(next + beat * 0.5, 0.05); }
      next += beat;
    }
  };
  schedule();
  const timer = setInterval(schedule, 100);

  return {
    stop: () => {
      clearInterval(timer);
      master.gain.setValueAtTime(master.gain.value, ctx.currentTime);
      master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.2);
      setTimeout(() => {
        padOscs.forEach(o => { try { o.stop(); } catch {} });
        ctx.close();
      }, 1500);
    },
  };
}

export function TurntableWidget() {
  const [playing, setPlaying] = useState(false);
  const engineRef = useRef<{ stop: () => void } | null>(null);

  const toggle = useCallback(() => {
    if (playing) {
      engineRef.current?.stop();
      engineRef.current = null;
      setPlaying(false);
    } else {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      engineRef.current = buildLoFiEngine(ctx);
      setPlaying(true);
    }
  }, [playing]);

  useEffect(() => () => { engineRef.current?.stop(); }, []);

  return (
    <button
      onClick={toggle}
      className="group relative block w-full cursor-pointer border-none bg-transparent p-0 text-left outline-none"
      aria-label={playing ? "Pause music" : "Play lo-fi music"}
    >
      {/* Ambient halo behind the card */}
      <div
        className={`pointer-events-none absolute -inset-6 rounded-3xl transition-all duration-1000 ${
          playing ? "opacity-100" : "opacity-0"
        }`}
        style={{
          background: "radial-gradient(ellipse at 42% 40%, rgba(80,160,255,0.32) 0%, transparent 68%)",
          filter: "blur(24px)",
        }}
      />

      <div
        className={`relative overflow-hidden rounded-2xl transition-all duration-700 ${
          playing
            ? "shadow-[0_0_52px_rgba(90,170,255,0.38)]"
            : "shadow-[0_2px_20px_rgba(0,0,0,0.18)] group-hover:shadow-[0_4px_28px_rgba(0,0,0,0.26)]"
        }`}
      >
        <Image
          src="/assets/Playground/vinyl.png"
          alt="Vinyl turntable"
          width={1280}
          height={860}
          className={`w-full select-none transition-all duration-700 ${
            playing
              ? "brightness-[1.1] saturate-[1.12]"
              : "brightness-100 group-hover:brightness-[1.04]"
          }`}
          priority
        />

        {/* Spinning conic overlay on the record platter */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: "9%",
            left: "21%",
            width: "36%",
            aspectRatio: "1",
            borderRadius: "50%",
            overflow: "hidden",
            opacity: playing ? 1 : 0,
            transition: "opacity 0.7s",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              animation: playing ? "vinyl-spin 2s linear infinite" : "none",
              background:
                "conic-gradient(from 0deg, transparent 0%, rgba(130,195,255,0.18) 22%, transparent 44%, rgba(140,200,255,0.12) 66%, transparent 88%)",
            }}
          />
          <div
            style={{
              position: "absolute",
              inset: "18%",
              borderRadius: "50%",
              animation: playing ? "vinyl-spin 3.2s linear infinite reverse" : "none",
              background:
                "conic-gradient(from 90deg, transparent 0%, rgba(100,175,255,0.1) 35%, transparent 70%)",
            }}
          />
        </div>

        {/* Hover hint */}
        <div
          className={`absolute inset-0 flex items-end justify-center pb-5 transition-opacity duration-300 ${
            playing ? "opacity-0" : "opacity-0 group-hover:opacity-100"
          }`}
        >
          <span className="rounded-full bg-black/55 px-4 py-1.5 text-[11px] tracking-[0.06em] text-white/80 backdrop-blur-sm">
            click to play
          </span>
        </div>

        {/* Sound-bar indicator */}
        <div
          className={`absolute bottom-4 right-4 flex items-end gap-[3px] transition-opacity duration-500 ${
            playing ? "opacity-100" : "opacity-0"
          }`}
        >
          {[0, 1, 2, 3].map(i => (
            <span
              key={i}
              className="block w-[3px] rounded-full bg-blue-200/75"
              style={{
                animation: playing
                  ? `soundbar 0.72s ease-in-out ${i * 0.13}s infinite alternate`
                  : "none",
                height: "6px",
              }}
            />
          ))}
        </div>
      </div>
    </button>
  );
}
