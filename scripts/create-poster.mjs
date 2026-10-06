import fs from "node:fs/promises";
import { NodeIO } from "@gltf-transform/core";
const doc = await new NodeIO().read("public/models/protein.glb");
const pos = doc
  .getRoot()
  .listMeshes()[0]
  .listPrimitives()[0]
  .getAttribute("POSITION")
  .getArray();
let min = [Infinity, Infinity, Infinity],
  max = [-Infinity, -Infinity, -Infinity];
for (let i = 0; i < pos.length; i += 3)
  for (let j = 0; j < 3; j++) {
    min[j] = Math.min(min[j], pos[i + j]);
    max[j] = Math.max(max[j], pos[i + j]);
  }
const scale = 310 / Math.max(...max.map((v, i) => v - min[i]));
const points = [];
for (let i = 0; i < pos.length; i += 42) {
  points.push({
    x: 230 + (pos[i] - (min[0] + max[0]) / 2) * scale,
    y: 215 - (pos[i + 1] - (min[1] + max[1]) / 2) * scale,
    z: pos[i + 2],
  });
}
points.sort((a, b) => a.z - b.z);
await fs.writeFile(
  "public/models/protein-poster.svg",
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 460 430"><title>Supplied protein geometry</title>${points.map((p) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="${p.z > (min[2] + max[2]) / 2 ? "#bd896b" : "#d5b59b"}"/>`).join("")}</svg>`,
);
