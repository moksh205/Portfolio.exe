import * as THREE from "three";

// The winding path across the ground (x, z) that mini-Moksh walks as you scroll
const CONTROL = [
  [0, 0], [6, -8], [0, -16], [-7, -24], [0, -32], [7, -40], [2, -48],
];
export const PATH = new THREE.CatmullRomCurve3(CONTROL.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, "centripetal");

// Path frame at u: point, forward tangent, and the "right" side (where the camera stands)
export function frameAt(u, out = {}) {
  out.p = PATH.getPointAt(u, out.p || new THREE.Vector3());
  out.t = PATH.getTangentAt(Math.min(0.999, Math.max(0.001, u)), out.t || new THREE.Vector3());
  out.r = (out.r || new THREE.Vector3()).set(-out.t.z, 0, out.t.x).normalize();
  return out;
}
