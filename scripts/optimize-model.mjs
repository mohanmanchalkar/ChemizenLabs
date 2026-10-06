import fs from "node:fs/promises";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { Document, NodeIO } from "@gltf-transform/core";
import { weld, simplify, dedup, prune } from "@gltf-transform/functions";
import { MeshoptSimplifier } from "meshoptimizer";
const source = await fs.readFile("assets/protien.obj", "utf8");
const object = new OBJLoader().parse(source);
const doc = new Document(),
  buffer = doc.createBuffer(),
  scene = doc.createScene();
const material = doc
  .createMaterial("Warm ceramic")
  .setBaseColorFactor([0.79, 0.55, 0.4, 1])
  .setRoughnessFactor(0.42)
  .setMetallicFactor(0.08);
let meshes = 0;
object.traverse((child) => {
  if (!child.isMesh) return;
  const geo = child.geometry;
  const prim = doc.createPrimitive().setMaterial(material);
  for (const [key, semantic] of [
    ["position", "POSITION"],
    ["normal", "NORMAL"],
  ]) {
    const attr = geo.getAttribute(key);
    if (attr)
      prim.setAttribute(
        semantic,
        doc
          .createAccessor()
          .setType("VEC3")
          .setArray(new Float32Array(attr.array))
          .setBuffer(buffer),
      );
  }
  if (geo.index)
    prim.setIndices(
      doc
        .createAccessor()
        .setType("SCALAR")
        .setArray(new Uint32Array(geo.index.array))
        .setBuffer(buffer),
    );
  const mesh = doc.createMesh("Protein geometry").addPrimitive(prim);
  scene.addChild(doc.createNode().setMesh(mesh));
  meshes++;
});
await MeshoptSimplifier.ready;
await doc.transform(
  weld(),
  simplify({ simplifier: MeshoptSimplifier, ratio: 0.22, error: 0.005 }),
  dedup(),
  prune(),
);
await fs.mkdir("public/models", { recursive: true });
await new NodeIO().write("public/models/protein.glb", doc);
console.log(
  JSON.stringify({
    meshes,
    originalBytes: source.length,
    optimizedBytes: (await fs.stat("public/models/protein.glb")).size,
  }),
);
