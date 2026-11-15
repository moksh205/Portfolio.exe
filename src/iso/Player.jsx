import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { shirtTexture } from "./textures";
import { PLACES, FOUNTAIN, ISLAND } from "./places";

const WALK = 4.2; // units / s with keys
const AUTO = 5.5; // units / s when walking to a clicked point
const DOOR_RANGE = 1.7;

const SKIN = "#e8b48a";
const HAIR = "#2b1b14";
const JEANS = "#34466e";

// small helper: a box mesh
function Box({ s, p, c, map, r, emissive, shadow = true }) {
  return (
    <mesh position={p} rotation={r} castShadow={shadow}>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} map={map} roughness={0.85} emissive={emissive || "#000"} />
    </mesh>
  );
}

// curls on top / back of the head
const CURLS = [
  [-0.32, 2.02, 0.22], [-0.1, 2.08, 0.26], [0.14, 2.06, 0.24], [0.34, 2.0, 0.18],
  [-0.36, 2.06, -0.05], [-0.12, 2.14, 0.02], [0.12, 2.15, -0.02], [0.36, 2.07, -0.04],
  [-0.3, 2.02, -0.3], [-0.05, 2.08, -0.28], [0.2, 2.06, -0.3], [0.38, 1.9, -0.28],
  [-0.4, 1.86, -0.32], [-0.43, 1.8, 0.05], [0.43, 1.8, 0.08],
];

// obstacles = buildings + fountain (circles)
const OBSTACLES = [...PLACES.map((p) => ({ x: p.pos[0], z: p.pos[1], r: p.radius + 0.35 })), { x: FOUNTAIN.pos[0], z: FOUNTAIN.pos[1], r: FOUNTAIN.radius + 0.3 }];

// screen-relative directions for an isometric camera at (+x, +y, +z)
const SCREEN_UP = new THREE.Vector2(-1, -1).normalize();
const SCREEN_RIGHT = new THREE.Vector2(1, -1).normalize();

export default function Player({ ctrl, speech, accent, onNear }) {
  const root = useRef();
  const body = useRef();
  const legL = useRef();
  const legR = useRef();
  const armL = useRef();
  const armR = useRef();
  const eyes = useRef();
  const anim = useRef({ phase: 0, blinkAt: 2, facing: 0 });
  const shirt = useMemo(() => shirtTexture(), []);

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 0.05);
    const c = ctrl.current;
    const pos = c.pos;
    const a = anim.current;
    let vx = 0;
    let vz = 0;

    if (!c.paused) {
      const k = c.keys;
      const sx = (k.right ? 1 : 0) - (k.left ? 1 : 0);
      const sy = (k.up ? 1 : 0) - (k.down ? 1 : 0);
      if (sx || sy) {
        c.onManual?.();
        c.target = null;
        const dx = SCREEN_RIGHT.x * sx + SCREEN_UP.x * sy;
        const dz = SCREEN_RIGHT.y * sx + SCREEN_UP.y * sy;
        const len = Math.hypot(dx, dz);
        vx = (dx / len) * WALK;
        vz = (dz / len) * WALK;
        c.lastActive = performance.now();
      } else if (c.target) {
        const dx = c.target.x - pos.x;
        const dz = c.target.z - pos.z;
        const dist = Math.hypot(dx, dz);
        if (dist < 0.08 || (c.target.stuck ?? 0) > 1.2) {
          const then = c.target.then;
          if (c.target.face != null) a.facing = c.target.face;
          c.target = null;
          then?.();
        } else {
          const sp = Math.min(AUTO, dist / dt);
          vx = (dx / dist) * sp;
          vz = (dz / dist) * sp;
        }
      }
    }

    // move + collide (slide around buildings / fountain)
    const px = pos.x;
    const pz = pos.z;
    pos.x += vx * dt;
    pos.z += vz * dt;
    for (const o of OBSTACLES) {
      const dx = pos.x - o.x;
      const dz = pos.z - o.z;
      const d = Math.hypot(dx, dz);
      if (d < o.r) {
        pos.x = o.x + (dx / (d || 1)) * o.r;
        pos.z = o.z + (dz / (d || 1)) * o.r;
        if (c.target) {
          // nudge sideways so auto-walk slides around the obstacle
          pos.x += (-dz / (d || 1)) * 0.04;
          pos.z += (dx / (d || 1)) * 0.04;
        }
      }
    }
    pos.x = THREE.MathUtils.clamp(pos.x, -ISLAND + 0.6, ISLAND - 0.6);
    pos.z = THREE.MathUtils.clamp(pos.z, -ISLAND + 0.6, ISLAND - 0.6);

    const moved = Math.hypot(pos.x - px, pos.z - pz) / dt;
    if (c.target && moved < 0.3 && (vx || vz)) c.target.stuck = (c.target.stuck ?? 0) + dt;
    const moving = moved > 0.2;

    // facing (smooth turn, shortest way round)
    if (moving) a.facing = Math.atan2(pos.x - px, pos.z - pz);
    const cur = root.current.rotation.y;
    const diff = Math.atan2(Math.sin(a.facing - cur), Math.cos(a.facing - cur));
    root.current.rotation.y = cur + diff * Math.min(1, dt * 12);
    root.current.position.set(pos.x, 0, pos.z);

    // walk cycle / idle breathing
    const t = state.clock.elapsedTime;
    if (moving) {
      a.phase += dt * (moved > WALK + 0.2 ? 13 : 10);
      const s = Math.sin(a.phase);
      legL.current.rotation.x = s * 0.7;
      legR.current.rotation.x = -s * 0.7;
      armL.current.rotation.x = -s * 0.8;
      armR.current.rotation.x = s * 0.8;
      body.current.position.y = Math.abs(Math.cos(a.phase)) * 0.08;
    } else {
      const damp = Math.min(1, dt * 10);
      for (const limb of [legL, legR, armL, armR]) limb.current.rotation.x *= 1 - damp;
      body.current.position.y = Math.sin(t * 2) * 0.015;
      armL.current.rotation.z = -0.05 - Math.sin(t * 2) * 0.02;
      armR.current.rotation.z = 0.05 + Math.sin(t * 2) * 0.02;
    }
    // blink
    if (t > a.blinkAt) {
      eyes.current.scale.y = 0.1;
      if (t > a.blinkAt + 0.12) {
        eyes.current.scale.y = 1;
        a.blinkAt = t + 2.5 + Math.random() * 2.5;
      }
    }

    // which door is close?
    let near = null;
    for (const p of PLACES) if (Math.hypot(pos.x - p.door[0], pos.z - p.door[1]) < DOOR_RANGE) near = p.id;
    if (near !== c.near) {
      c.near = near;
      onNear(near);
    }
  });

  return (
    <group ref={root} scale={1.3}>
      {/* soft blob shadow so he reads well even in shade */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.25} />
      </mesh>

      <group ref={body}>
        {/* legs (pivot at hip) */}
        <group ref={legL} position={[-0.15, 0.64, 0]}>
          <Box s={[0.24, 0.52, 0.26]} p={[0, -0.26, 0]} c={JEANS} />
          <Box s={[0.27, 0.14, 0.38]} p={[0, -0.56, 0.05]} c="#1a1a1a" />
        </group>
        <group ref={legR} position={[0.15, 0.64, 0]}>
          <Box s={[0.24, 0.52, 0.26]} p={[0, -0.26, 0]} c={JEANS} />
          <Box s={[0.27, 0.14, 0.38]} p={[0, -0.56, 0.05]} c="#1a1a1a" />
        </group>

        {/* torso: checked shirt open over a white tee */}
        <Box s={[0.64, 0.64, 0.38]} p={[0, 0.95, 0]} c="#ffffff" map={shirt} />
        <Box s={[0.22, 0.6, 0.02]} p={[0, 0.96, 0.195]} c="#ffffff" />
        <Box s={[0.66, 0.06, 0.4]} p={[0, 0.66, 0]} c="#2a2a2a" />

        {/* arms (pivot at shoulder) */}
        <group ref={armL} position={[-0.42, 1.2, 0]}>
          <Box s={[0.18, 0.5, 0.2]} p={[0, -0.22, 0]} c="#ffffff" map={shirt} />
          <Box s={[0.15, 0.14, 0.16]} p={[0, -0.53, 0]} c={SKIN} />
        </group>
        <group ref={armR} position={[0.42, 1.2, 0]}>
          <Box s={[0.18, 0.5, 0.2]} p={[0, -0.22, 0]} c="#ffffff" map={shirt} />
          <Box s={[0.15, 0.14, 0.16]} p={[0, -0.53, 0]} c={SKIN} />
        </group>

        {/* neck + head */}
        <Box s={[0.2, 0.1, 0.2]} p={[0, 1.3, 0]} c={SKIN} />
        <Box s={[0.82, 0.74, 0.74]} p={[0, 1.66, 0]} c={SKIN} />
        <Box s={[0.08, 0.16, 0.14]} p={[-0.44, 1.62, 0]} c={SKIN} />
        <Box s={[0.08, 0.16, 0.14]} p={[0.44, 1.62, 0]} c={SKIN} />

        {/* hair */}
        <Box s={[0.86, 0.2, 0.8]} p={[0, 1.98, -0.02]} c={HAIR} />
        <Box s={[0.86, 0.5, 0.14]} p={[0, 1.76, -0.36]} c={HAIR} />
        <Box s={[0.1, 0.32, 0.5]} p={[-0.43, 1.84, -0.1]} c={HAIR} />
        <Box s={[0.1, 0.32, 0.5]} p={[0.43, 1.84, -0.1]} c={HAIR} />
        {CURLS.map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <icosahedronGeometry args={[0.15 + (i % 3) * 0.02, 0]} />
            <meshStandardMaterial color={i % 4 === 0 ? "#4a3022" : HAIR} flatShading roughness={0.9} />
          </mesh>
        ))}

        {/* glasses + eyes */}
        {[-0.19, 0.19].map((x) => (
          <group key={x}>
            <Box s={[0.3, 0.22, 0.03]} p={[x, 1.66, 0.38]} c="#111" shadow={false} />
            <Box s={[0.23, 0.15, 0.02]} p={[x, 1.66, 0.392]} c="#ffffff" shadow={false} />
          </group>
        ))}
        <group ref={eyes} position={[0, 1.66, 0.405]}>
          <Box s={[0.08, 0.1, 0.02]} p={[-0.16, 0, 0]} c="#1b1b1b" shadow={false} />
          <Box s={[0.08, 0.1, 0.02]} p={[0.16, 0, 0]} c="#1b1b1b" shadow={false} />
        </group>
        <Box s={[0.1, 0.04, 0.03]} p={[0, 1.68, 0.38]} c="#111" shadow={false} />
        <Box s={[0.03, 0.04, 0.38]} p={[-0.42, 1.68, 0.2]} c="#111" shadow={false} />
        <Box s={[0.03, 0.04, 0.38]} p={[0.42, 1.68, 0.2]} c="#111" shadow={false} />
        {/* smile */}
        <Box s={[0.16, 0.04, 0.02]} p={[0, 1.44, 0.375]} c="#a0563c" shadow={false} />
        <Box s={[0.04, 0.04, 0.02]} p={[-0.09, 1.46, 0.375]} c="#a0563c" shadow={false} />
        <Box s={[0.04, 0.04, 0.02]} p={[0.09, 1.46, 0.375]} c="#a0563c" shadow={false} />
      </group>

      {/* speech bubble (screen-space HTML) */}
      {speech && (
        <Html position={[0, 2.75, 0]} center zIndexRange={[40, 30]} style={{ pointerEvents: "none" }}>
          {/* lift so the bubble's bottom (not its middle) sits above the head */}
          <div className="-translate-y-1/2">
            <div
              key={speech}
              role="status"
              className="bubble-pop relative w-max max-w-[min(260px,70vw)] px-3 py-2 rounded-xl text-[13px] leading-snug font-mono text-slate-800 bg-white shadow-lg"
              style={{ border: `2px solid ${accent}` }}
            >
              {speech}
              <span
                className="absolute left-1/2 -bottom-[8px] -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white"
                style={{ borderRight: `2px solid ${accent}`, borderBottom: `2px solid ${accent}` }}
              />
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
