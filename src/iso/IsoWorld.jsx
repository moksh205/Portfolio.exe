import { useCallback, useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { FaGithub, FaLinkedin, FaEnvelope, FaPlay, FaStop } from "react-icons/fa";
import Island, { TargetMarker } from "./Island";
import Building from "./Buildings";
import Player from "./Player";
import SectionPanel from "./SectionPanel";
import { PLACES, START, ISLAND } from "./places";
import { profile } from "../data/projectsData";

const IDLE_HINTS = [
  "Psst… click any building and I'll walk you there.",
  "Want to say hi? The phone booth is on the right.",
  "All my GitHub projects live in the neon tower.",
  "Not sure where to go? Hit 'Take the tour'!",
];

// Isometric camera that gently follows mini-Moksh and fits the screen
function CameraRig({ ctrl }) {
  const { camera, size } = useThree();
  const look = useRef(new THREE.Vector3(...[START[0], 0, START[1]]));
  useFrame((_, dt) => {
    const small = size.width < 700;
    const zoom = small ? Math.max(26, size.width / 14) : Math.min(size.width / 31, size.height / 23);
    if (Math.abs(camera.zoom - zoom) > 0.01) {
      camera.zoom = zoom;
      camera.updateProjectionMatrix();
    }
    const follow = small ? 0.95 : 0.45;
    const p = ctrl.current.pos;
    const goal = new THREE.Vector3(p.x * follow, 0, p.z * follow);
    look.current.lerp(goal, Math.min(1, dt * 3));
    camera.position.set(look.current.x + 20, 20.8, look.current.z + 20);
    camera.lookAt(look.current.x, 1.8, look.current.z);
  });
  return null;
}

export default function IsoWorld() {
  const [nearId, setNearId] = useState(null);
  const [openId, setOpenId] = useState(null);
  const [speech, setSpeech] = useState("");
  const [tourText, setTourText] = useState("");
  const [touring, setTouring] = useState(false);
  const [isTouch] = useState(() => window.matchMedia("(pointer: coarse)").matches);

  // shared with the render loop (no re-renders per frame)
  const ctrl = useRef({
    pos: new THREE.Vector3(START[0], 0, START[1]),
    target: null,
    keys: { up: false, down: false, left: false, right: false },
    paused: false,
    near: null,
    lastActive: performance.now(),
    onManual: null,
  });
  const openRef = useRef(null);
  const touringRef = useRef(false);
  const tourTimer = useRef(null);
  const speechTimer = useRef(null);

  openRef.current = openId;
  touringRef.current = touring;
  ctrl.current.paused = !!openId;

  const say = useCallback((text, ms = 4500) => {
    clearTimeout(speechTimer.current);
    setSpeech(text);
    if (ms) speechTimer.current = setTimeout(() => setSpeech(""), ms);
  }, []);

  const stopTour = useCallback(() => {
    clearTimeout(tourTimer.current);
    ctrl.current.target = null;
    setTouring(false);
    setTourText("");
  }, []);

  // manual movement cancels the tour
  ctrl.current.onManual = () => touringRef.current && stopTour();

  const walkTo = useCallback(
    (place, open = true) => {
      if (touringRef.current) stopTour();
      setOpenId(null);
      ctrl.current.target = {
        x: place.door[0],
        z: place.door[1],
        face: place.angle + Math.PI, // turn to face the door
        hideMarker: true,
        then: open ? () => setOpenId(place.id) : null,
      };
      ctrl.current.lastActive = performance.now();
    },
    [stopTour]
  );

  const tourStep = useCallback(
    (i) => {
      if (i >= PLACES.length) {
        stopTour();
        say("That's the tour! Click anywhere to explore, or walk into a door.", 7000);
        return;
      }
      const p = PLACES[i];
      setTourText(`Follow me → ${p.title}`);
      ctrl.current.target = {
        x: p.door[0],
        z: p.door[1],
        face: p.angle + Math.PI,
        hideMarker: true,
        then: () => {
          setTourText(p.tour);
          tourTimer.current = setTimeout(() => tourStep(i + 1), 4200);
        },
      };
    },
    [say, stopTour]
  );

  const startTour = () => {
    setOpenId(null);
    setTouring(true);
    setSpeech("");
    tourStep(0);
  };

  // Panel prev/next: hop straight to that building's door and open it
  const jumpTo = (id) => {
    const p = PLACES.find((pl) => pl.id === id);
    if (!p) return;
    if (touringRef.current) stopTour();
    ctrl.current.pos.set(p.door[0], 0, p.door[1]);
    ctrl.current.target = { x: p.door[0], z: p.door[1], face: p.angle + Math.PI, hideMarker: true };
    setOpenId(id);
  };

  const onGround = (x, z) => {
    if (openRef.current) return;
    if (touringRef.current) stopTour();
    ctrl.current.target = {
      x: THREE.MathUtils.clamp(x, -ISLAND + 0.6, ISLAND - 0.6),
      z: THREE.MathUtils.clamp(z, -ISLAND + 0.6, ISLAND - 0.6),
    };
    ctrl.current.lastActive = performance.now();
  };

  const enterNear = useCallback(() => {
    const id = ctrl.current.near;
    if (id && !openRef.current) {
      if (touringRef.current) stopTour();
      setOpenId(id);
    }
  }, [stopTour]);

  // intro lines
  useEffect(() => {
    const lines = [
      [400, "Hi! I'm Moksh 👋 Welcome to my little island."],
      [4200, isTouch ? "Tap anywhere to walk. Tap a building to visit it." : "Click anywhere to walk (or use WASD / arrows)."],
      [9000, "Or press 'Take the tour' and I'll show you around!"],
    ];
    const timers = lines.map(([t, text]) => setTimeout(() => !touringRef.current && say(text, 4800), t));
    return () => timers.forEach(clearTimeout);
  }, [say, isTouch]);

  // idle hints
  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      const c = ctrl.current;
      const idle = performance.now() - c.lastActive > 15000;
      if (idle && !c.target && !touringRef.current && !openRef.current && !c.near) {
        say(IDLE_HINTS[i++ % IDLE_HINTS.length], 5000);
        c.lastActive = performance.now();
      }
    }, 2000);
    return () => clearInterval(id);
  }, [say]);

  // keyboard
  useEffect(() => {
    const KEYMAP = { arrowup: "up", w: "up", arrowdown: "down", s: "down", arrowleft: "left", a: "left", arrowright: "right", d: "right" };
    const isTyping = (e) => e.target.closest?.("input, textarea, [contenteditable]");
    const down = (e) => {
      if (e.key === "Escape") {
        if (openRef.current) setOpenId(null);
        else if (touringRef.current) stopTour();
        return;
      }
      if (openRef.current || isTyping(e) || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if (KEYMAP[k]) {
        ctrl.current.keys[KEYMAP[k]] = true;
        e.preventDefault();
      } else if ((k === "e" || k === "enter" || k === " ") && ctrl.current.near) {
        e.preventDefault();
        enterNear();
      }
    };
    const up = (e) => {
      const dir = KEYMAP[e.key.toLowerCase()];
      if (dir) ctrl.current.keys[dir] = false;
    };
    const reset = () => (ctrl.current.keys = { up: false, down: false, left: false, right: false });
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", reset);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", reset);
    };
  }, [enterNear, stopTour]);

  const nearPlace = PLACES.find((p) => p.id === nearId);
  const openPlace = PLACES.find((p) => p.id === openId);
  const rawBubble = touring ? tourText : nearPlace && !openId ? nearPlace.tip : speech;
  const bubble = isTouch ? rawBubble.replace("Press E", "Tap ENTER") : rawBubble;
  const accent = (touring ? null : nearPlace?.color) || "#7c5cff";

  return (
    <div className="fixed inset-0 overflow-clip select-none iso-sky">
      <div aria-hidden className="absolute inset-0 stars" />

      <Canvas
        shadows
        orthographic
        dpr={[1, 2]}
        camera={{ position: [20, 20, 20], zoom: 30, near: 0.1, far: 200 }}
        gl={{ antialias: true, alpha: true }}
        className="!absolute inset-0"
      >
        <hemisphereLight args={["#c9b8ff", "#4a3550", 0.9]} />
        <ambientLight intensity={0.25} />
        <directionalLight
          position={[-12, 22, 10]}
          intensity={1.7}
          color="#ffd9b0"
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-bias={-0.0006}
          shadow-camera-left={-18}
          shadow-camera-right={18}
          shadow-camera-top={18}
          shadow-camera-bottom={-18}
        />
        <CameraRig ctrl={ctrl} />
        <Island onGround={onGround} />
        <TargetMarker ctrl={ctrl} />
        {PLACES.map((p) => (
          <Building key={p.id} place={p} near={nearId === p.id} touch={isTouch} onSelect={walkTo} />
        ))}
        <Player ctrl={ctrl} speech={bubble} accent={accent} onNear={setNearId} />
      </Canvas>

      {/* ---------- HUD ---------- */}
      <header className="absolute top-0 inset-x-0 flex items-start justify-between gap-3 p-3 sm:p-5 pointer-events-none z-30">
        <div className="pointer-events-auto px-3 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg">
          <h1 className="font-mono font-bold text-lg sm:text-2xl leading-none text-white tracking-tight">
            {profile.name}
          </h1>
          <p className="font-mono text-[10px] sm:text-xs text-white/75 mt-1">{profile.role}</p>
        </div>
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={touring ? stopTour : startTour}
            className={`flex items-center gap-2 h-10 px-4 rounded-full font-mono font-bold text-sm shadow-lg transition active:scale-95
              ${touring ? "bg-white text-[#d6336c]" : "bg-[#7cf5b0] text-slate-900 hover:brightness-105"}`}
          >
            {touring ? <FaStop className="text-xs" /> : <FaPlay className="text-xs" />}
            {touring ? (
              <span>STOP<span className="hidden sm:inline">&nbsp;TOUR</span></span>
            ) : (
              <span><span className="hidden sm:inline">TAKE THE&nbsp;</span>TOUR</span>
            )}
          </button>
          {[
            { href: profile.github, label: "GitHub", Icon: FaGithub },
            { href: profile.linkedin, label: "LinkedIn", Icon: FaLinkedin },
            { href: `mailto:${profile.email}`, label: "Email", Icon: FaEnvelope },
          ].map(({ href, label, Icon }) => (
            <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label}
              className="hidden sm:grid w-10 h-10 place-items-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/25 transition">
              <Icon />
            </a>
          ))}
        </div>
      </header>

      {/* ENTER button for touch */}
      {isTouch && nearPlace && !openId && (
        <button
          onClick={enterNear}
          className="absolute left-1/2 -translate-x-1/2 bottom-24 z-30 h-12 px-6 rounded-full font-mono font-bold text-slate-900 shadow-xl prompt-bob"
          style={{ background: nearPlace.color, boxShadow: `0 0 24px ${nearPlace.color}` }}
        >
          ENTER {nearPlace.title.toUpperCase()}
        </button>
      )}

      {/* quick nav */}
      <nav aria-label="Sections" className="absolute bottom-3 sm:bottom-5 inset-x-0 z-30 flex justify-center px-3 pointer-events-none">
        <div className="pointer-events-auto flex gap-1 sm:gap-1.5 p-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/15 shadow-xl max-w-full overflow-x-auto hide-scrollbar">
          {PLACES.map((p) => (
            <button
              key={p.id}
              onClick={() => walkTo(p)}
              aria-label={p.title}
              title={p.title}
              className={`flex items-center gap-1.5 h-9 px-3 rounded-full font-mono text-xs whitespace-nowrap transition
                ${nearId === p.id ? "text-slate-900" : "text-white/85 hover:bg-white/15"}`}
              style={nearId === p.id ? { background: p.color } : undefined}
            >
              <p.icon style={{ color: nearId === p.id ? undefined : p.color }} />
              <span className="hidden md:inline">{p.title}</span>
            </button>
          ))}
        </div>
      </nav>
      {!isTouch && (
        <p className="hidden lg:block absolute bottom-6 right-5 z-20 font-mono text-[11px] text-white/60">
          click to walk · WASD / arrows · E to enter
        </p>
      )}

      {openPlace && (
        <SectionPanel place={openPlace} onClose={() => setOpenId(null)} onNavigate={jumpTo} />
      )}
    </div>
  );
}
