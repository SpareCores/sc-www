#!/usr/bin/env node
/**
 * Pixel-diff comparison screenshots against baseline images.
 * Uses the same library and options as cypress-image-diff-js
 * (pixelmatch with threshold 0.1, canvas padding via PNG.bitblt).
 *
 * Usage: node .github/scripts/visual-diff-vs-baseline.js <baselineDir> <comparisonDir> <outputDir>
 *
 * Writes red-highlighted diff PNGs for mismatches, copies new snapshots
 * as *.new.png, appends the result to the GitHub job summary when
 * available, and always exits 0 (informational only).
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const COMPARISON_OPTIONS = { threshold: 0.1 };

function usage() {
  console.error(
    "Usage: node .github/scripts/visual-diff-vs-baseline.js <baselineDir> <comparisonDir> <outputDir>",
  );
  process.exit(1);
}

function listPngs(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".png"))
    .sort();
}

function adjustCanvas(image, width, height) {
  if (image.width === width && image.height === height) {
    return image;
  }
  const canvas = new PNG({
    width,
    height,
    bitDepth: image.bitDepth,
    inputHasAlpha: true,
  });
  PNG.bitblt(image, canvas, 0, 0, image.width, image.height, 0, 0);
  return canvas;
}

function writeJobSummary(rows, summary) {
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryFile) {
    return;
  }
  const lines = ["### Visual regression against main baselines", "", summary];
  if (rows.length > 0) {
    lines.push(
      "",
      "Diff images are in the `visual-regression-vs-main` artifact.",
      "",
      "| Status | Snapshot | Details |",
      "| --- | --- | --- |",
      ...rows.map(
        ({ status, file, details }) =>
          `| ${status} | \`${file}\` | ${details} |`,
      ),
    );
  }
  fs.appendFileSync(summaryFile, `${lines.join("\n")}\n`);
}

function main() {
  const [baselineDir, comparisonDir, outputDir] = process.argv.slice(2);
  if (!baselineDir || !comparisonDir || !outputDir) {
    usage();
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const comparisonFiles = listPngs(comparisonDir);
  const baselineFiles = new Set(listPngs(baselineDir));
  const rows = [];
  let diffs = 0;
  let news = 0;
  let matches = 0;

  for (const file of comparisonFiles) {
    const comparisonPath = path.join(comparisonDir, file);
    const baselinePath = path.join(baselineDir, file);

    if (!baselineFiles.has(file)) {
      const dest = path.join(outputDir, file.replace(/\.png$/, ".new.png"));
      fs.copyFileSync(comparisonPath, dest);
      console.log(`NEW: ${file} (no baseline)`);
      rows.push({ status: "NEW", file, details: "no baseline" });
      news += 1;
      continue;
    }

    baselineFiles.delete(file);

    const baselineImg = PNG.sync.read(fs.readFileSync(baselinePath));
    const comparisonImg = PNG.sync.read(fs.readFileSync(comparisonPath));
    const width = Math.max(baselineImg.width, comparisonImg.width);
    const height = Math.max(baselineImg.height, comparisonImg.height);
    const baselineFull = adjustCanvas(baselineImg, width, height);
    const comparisonFull = adjustCanvas(comparisonImg, width, height);
    const diff = new PNG({ width, height });

    const mismatch = pixelmatch(
      baselineFull.data,
      comparisonFull.data,
      diff.data,
      width,
      height,
      COMPARISON_OPTIONS,
    );
    const percentage = Math.sqrt(mismatch / width / height);

    if (mismatch > 0) {
      fs.writeFileSync(path.join(outputDir, file), PNG.sync.write(diff));
      const details = `${(percentage * 100).toFixed(4)}% mismatch, ${mismatch} pixels`;
      console.log(`DIFF: ${file} (${details})`);
      rows.push({ status: "DIFF", file, details });
      diffs += 1;
    } else {
      matches += 1;
    }
  }

  for (const file of [...baselineFiles].sort()) {
    console.log(`MISSING: ${file} (baseline present, no comparison image)`);
    rows.push({ status: "MISSING", file, details: "no comparison image" });
  }

  const summary = `${matches} match, ${diffs} differ, ${news} new, ${baselineFiles.size} missing`;
  console.log(`\nSummary: ${summary}`);
  writeJobSummary(rows, summary);
  process.exit(0);
}

main();
