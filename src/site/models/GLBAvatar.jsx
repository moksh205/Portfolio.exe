import { Component, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import * as THREE from "three";
import { AVATAR_URL } from "../timeline";


const TARGET_HEIGHT = 2.1; // same size as the chibi mini-me

// Picks the clip whose name matches, e.g. "Idle", "Walking", "Waving"
function findClip(names, re) {
  return names.find((n) => re.test(n));
}

// A realistic, rigged avatar from a .glb file with animation clips (idle / walk / wave).
// Clips are matched by name, so animations exported from Mixamo etc. work as-is.
export default function GLBAvatar({ pose = "idle", motion, url = AVATAR_URL, ...props }) {
  const group = useRef();
  const { scene, animations } = useGLTF(url);
  const { actions, names } = useAnimations(animations, group);
  const current = useRef(null);

  // scale the model to our size and stand it on the ground
  const fit = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const h = box.max.y - box.min.y || 1;
    const s = TARGET_HEIGHT / h;
    return { s, y: -box.min.y * s };
  }, [scene]);

  useLayoutEffect(() => {
    scene.traverse((o) => {
      if (o.isMesh) o.castShadow = true;
    });
  }, [scene]);

  const clips = useMemo(
    () => ({
      idle: findClip(names, /idle|stand|breath/i) ?? names[0],
      walk: findClip(names, /walk|run/i) ?? names[0],
      wave: findClip(names, /wave|greet|hello|hi\b/i) ?? findClip(names, /idle/i) ?? names[0],
    }),
    [names]
  );

  const play = (key) => {
    const name = clips[key];
    if (!name || current.current === name) return;
    const next = actions[name];
    if (!next) return;
    next.reset().fadeIn(0.3).play();
    if (current.current) actions[current.current]?.fadeOut(0.3);
    current.current = name;
  };

  useEffect(() => {
    play(pose === "wave" ? "wave" : "idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pose, clips]);

  // switch to the walk clip while moving, and match its speed to the movement
  useFrame(() => {
    const speed = motion?.current.speed ?? 0;
    if (speed > 0.15) {
      play("walk");
      const a = actions[clips.walk];
      if (a) a.timeScale = THREE.MathUtils.clamp(speed / 2.2, 0.6, 2.2);
    } else if (current.current === clips.walk) {
      play(pose === "wave" ? "wave" : "idle");
    }
  });

  return (
    <group ref={group} {...props}>
      <primitive object={scene} scale={fit.s} position-y={fit.y} />
    </group>
  );
}

// If the .glb fails to load, show `fallback` instead of crashing the scene
export class AvatarBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
