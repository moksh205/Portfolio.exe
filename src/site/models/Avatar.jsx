import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { shirtTexture } from "./textures";

const SKIN = "#e8b48a";
const HAIR = "#2b1b14";
const JEANS = "#34466e";

function Box({ s, p, c, map, r }) {
  return (
    <mesh position={p} rotation={r} castShadow>
      <boxGeometry args={s} />
      <meshStandardMaterial color={c} map={map} roughness={0.8} />
    </mesh>
  );
}

const CURLS = [
  [-0.32, 2.02, 0.22], [-0.1, 2.08, 0.26], [0.14, 2.06, 0.24], [0.34, 2.0, 0.18],
  [-0.36, 2.06, -0.05], [-0.12, 2.14, 0.02], [0.12, 2.15, -0.02], [0.36, 2.07, -0.04],
  [-0.3, 2.02, -0.3], [-0.05, 2.08, -0.28], [0.2, 2.06, -0.3], [0.38, 1.9, -0.28],
  [-0.4, 1.86, -0.32], [-0.43, 1.8, 0.05], [0.43, 1.8, 0.08],
];

// Chibi 3D mini-Moksh. `pose`: "wave" | "type" | "idle".
// `mouse` is a ref with { x, y } in -1..1 so the head can follow the cursor.
export default function Avatar({ pose = "idle", mouse, ...props }) {
  const body = useRef();
  const head = useRef();
  const armL = useRef();
  const armR = useRef();
  const eyes = useRef();
  const blinkAt = useRef(2);
  const shirt = useMemo(() => shirtTexture(), []);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    // little happy hop every ~4 s when waving
    const phase = t % 4;
    const hop = pose === "wave" && phase < 0.5 ? Math.sin((phase / 0.5) * Math.PI) * 0.35 : 0;
    body.current.position.y = Math.sin(t * 2) * 0.02 + hop;

    if (pose === "wave") {
      armR.current.rotation.z = 2.5 + Math.sin(t * 7) * 0.35; // raised, waving
      armR.current.rotation.x = 0;
      armL.current.rotation.z = -0.08;
      armL.current.rotation.x = 0;
    } else if (pose === "type") {
      armL.current.rotation.x = -1.15 + Math.sin(t * 14) * 0.08;
      armR.current.rotation.x = -1.15 + Math.sin(t * 14 + 1.6) * 0.08;
      armL.current.rotation.z = -0.15;
      armR.current.rotation.z = 0.15;
    } else {
      armL.current.rotation.z = -0.06 - Math.sin(t * 2) * 0.02;
      armR.current.rotation.z = 0.06 + Math.sin(t * 2) * 0.02;
    }

    // head follows the cursor a little
    const mx = mouse?.current.x ?? 0;
    const my = mouse?.current.y ?? 0;
    const k = Math.min(1, dt * 4);
    head.current.rotation.y += (mx * 0.45 - head.current.rotation.y) * k;
    head.current.rotation.x += (-my * 0.2 + (pose === "type" ? 0.25 : 0) - head.current.rotation.x) * k;

    // blink
    if (t > blinkAt.current) {
      eyes.current.scale.y = 0.1;
      if (t > blinkAt.current + 0.12) {
        eyes.current.scale.y = 1;
        blinkAt.current = t + 2.5 + Math.random() * 2.5;
      }
    }
  });

  return (
    <group {...props}>
      <group ref={body}>
        {/* legs */}
        {[-0.15, 0.15].map((x) => (
          <group key={x} position={[x, 0.64, 0]}>
            <Box s={[0.24, 0.52, 0.26]} p={[0, -0.26, 0]} c={JEANS} />
            <Box s={[0.27, 0.14, 0.38]} p={[0, -0.56, 0.05]} c="#1f2937" />
          </group>
        ))}

        {/* torso: checked shirt open over a white tee */}
        <Box s={[0.64, 0.64, 0.38]} p={[0, 0.95, 0]} c="#ffffff" map={shirt} />
        <Box s={[0.22, 0.6, 0.02]} p={[0, 0.96, 0.195]} c="#ffffff" />
        <Box s={[0.66, 0.06, 0.4]} p={[0, 0.66, 0]} c="#2a2a2a" />

        {/* arms (pivot at the shoulder) */}
        <group ref={armL} position={[-0.42, 1.2, 0]}>
          <Box s={[0.18, 0.5, 0.2]} p={[0, -0.22, 0]} c="#ffffff" map={shirt} />
          <Box s={[0.15, 0.14, 0.16]} p={[0, -0.53, 0]} c={SKIN} />
        </group>
        <group ref={armR} position={[0.42, 1.2, 0]}>
          <Box s={[0.18, 0.5, 0.2]} p={[0, -0.22, 0]} c="#ffffff" map={shirt} />
          <Box s={[0.15, 0.14, 0.16]} p={[0, -0.53, 0]} c={SKIN} />
        </group>

        <Box s={[0.2, 0.1, 0.2]} p={[0, 1.3, 0]} c={SKIN} />

        {/* head (pivot at the neck) */}
        <group ref={head} position={[0, 1.32, 0]}>
          <group position={[0, -1.32, 0]}>
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
            {/* glasses */}
            {[-0.19, 0.19].map((x) => (
              <group key={x}>
                <Box s={[0.3, 0.22, 0.03]} p={[x, 1.66, 0.38]} c="#111" />
                <Box s={[0.23, 0.15, 0.02]} p={[x, 1.66, 0.392]} c="#ffffff" />
              </group>
            ))}
            <group ref={eyes} position={[0, 1.66, 0.405]}>
              <Box s={[0.08, 0.1, 0.02]} p={[-0.16, 0, 0]} c="#1b1b1b" />
              <Box s={[0.08, 0.1, 0.02]} p={[0.16, 0, 0]} c="#1b1b1b" />
            </group>
            <Box s={[0.1, 0.04, 0.03]} p={[0, 1.68, 0.38]} c="#111" />
            <Box s={[0.03, 0.04, 0.38]} p={[-0.42, 1.68, 0.2]} c="#111" />
            <Box s={[0.03, 0.04, 0.38]} p={[0.42, 1.68, 0.2]} c="#111" />
            {/* smile */}
            <Box s={[0.16, 0.04, 0.02]} p={[0, 1.44, 0.375]} c="#a0563c" />
            <Box s={[0.04, 0.04, 0.02]} p={[-0.09, 1.46, 0.375]} c="#a0563c" />
            <Box s={[0.04, 0.04, 0.02]} p={[0.09, 1.46, 0.375]} c="#a0563c" />
          </group>
        </group>
      </group>
    </group>
  );
}
