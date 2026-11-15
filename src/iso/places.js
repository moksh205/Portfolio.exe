import { STATIONS } from "./stations";

// Island layout (world units, y is up, island top is y = 0).
// The camera looks from +x +y +z, so the faces we can see are the +x and +z sides.
// Buildings line the two back edges (an "L") and face into the island,
// so every front door is visible and nothing tall stands in front of mini-Moksh.
const LAYOUT = {
  projects: { pos: [-8, -8], radius: 2.2, angle: Math.PI / 4 }, // back corner
  about: { pos: [-8.8, -0.8], radius: 2.3, angle: Math.PI / 2 }, // left edge, faces +x
  experience: { pos: [-8.6, 6.6], radius: 2.2, angle: Math.PI / 2 },
  skills: { pos: [-1.2, -8.8], radius: 2.4, angle: 0 }, // back edge, faces +z
  contact: { pos: [5.6, -8.7], radius: 1.6, angle: 0 },
};

export const ISLAND = 12; // half-size of the walkable square
export const START = [3, 3.5];
export const FOUNTAIN = { pos: [0, 0], radius: 2.1 };

// Each door sits a little in front of its building
export const PLACES = STATIONS.map((st) => {
  const { pos, radius, angle } = LAYOUT[st.id];
  const door = [pos[0] + Math.sin(angle) * (radius + 1.1), pos[1] + Math.cos(angle) * (radius + 1.1)];
  return { ...st, pos, radius, angle, door };
});

export const placeById = (id) => PLACES.find((p) => p.id === id);
