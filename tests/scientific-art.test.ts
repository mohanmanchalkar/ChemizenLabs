import { test } from "node:test";
import assert from "node:assert/strict";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { ScientificArt } from "../src/components/ScientificArt";

test("SVG markup remains stable across tiny runtime trigonometry differences", () => {
  const render = () =>
    [0, 1, 2, 3].map((variant) =>
      renderToStaticMarkup(createElement(ScientificArt, { variant })),
    );
  const baseline = render();
  const sin = Math.sin;
  const cos = Math.cos;
  try {
    Math.sin = (value) => sin(value) + Number.EPSILON;
    Math.cos = (value) => cos(value) - Number.EPSILON;
    assert.deepEqual(render(), baseline);
  } finally {
    Math.sin = sin;
    Math.cos = cos;
  }
});
