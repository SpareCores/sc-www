#!/usr/bin/env node
/**
 * Pixel-diff the branch baseline images against the main baseline images.
 * Uses the same library and options as cypress-image-diff-js
 * (pixelmatch with threshold 0.1, canvas padding via PNG.bitblt).
 *
 * Usage: node .github/scripts/visual-diff-vs-baseline.js <mainDir> <branchDir> <outputDir>
 *
 * For every changed, added or removed snapshot, copies the main image to
 * <outputDir>/main, the branch image to <outputDir>/branch and, for changed
 * snapshots, writes a red-highlighted diff PNG to <outputDir>/diff. Appends
 * the result to the GitHub job summary when available and always exits 0
 * (informational only).
 */
const fs = require("fs");
const path = require("path");
const { PNG } = require("pngjs");
const pixelmatch = require("pixelmatch");

const COMPARISON_OPTIONS = { threshold: 0.1 };

function usage() {
  console.error(
    "Usage: node .github/scripts/visual-diff-vs-baseline.js <mainDir> <branchDir> <outputDir>",
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

function copyTo(sourcePath, outputDir, subdir, file) {
  const dir = path.join(outputDir, subdir);
  fs.mkdirSync(dir, { recursive: true });
  fs.copyFileSync(sourcePath, path.join(dir, file));
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
  const lines = ["### Branch baselines against main baselines", "", summary];
  if (rows.length > 0) {
    lines.push(
      "",
      "Main, branch and diff images are in the `visual-regression-vs-main` artifact.",
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
  const [mainDir, branchDir, outputDir] = process.argv.slice(2);
  if (!mainDir || !branchDir || !outputDir) {
    usage();
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const branchFiles = listPngs(branchDir);
  const mainFiles = new Set(listPngs(mainDir));
  const rows = [];
  let diffs = 0;
  let added = 0;
  let matches = 0;

  for (const file of branchFiles) {
    const branchPath = path.join(branchDir, file);
    const mainPath = path.join(mainDir, file);

    if (!mainFiles.has(file)) {
      copyTo(branchPath, outputDir, "branch", file);
      console.log(`ADDED: ${file} (not on main)`);
      rows.push({ status: "ADDED", file, details: "not on main" });
      added += 1;
      continue;
    }

    mainFiles.delete(file);

    const mainImg = PNG.sync.read(fs.readFileSync(mainPath));
    const branchImg = PNG.sync.read(fs.readFileSync(branchPath));
    const width = Math.max(mainImg.width, branchImg.width);
    const height = Math.max(mainImg.height, branchImg.height);
    const mainFull = adjustCanvas(mainImg, width, height);
    const branchFull = adjustCanvas(branchImg, width, height);
    const diff = new PNG({ width, height });

    const mismatch = pixelmatch(
      mainFull.data,
      branchFull.data,
      diff.data,
      width,
      height,
      COMPARISON_OPTIONS,
    );
    const percentage = Math.sqrt(mismatch / width / height);

    if (mismatch > 0) {
      copyTo(mainPath, outputDir, "main", file);
      copyTo(branchPath, outputDir, "branch", file);
      fs.mkdirSync(path.join(outputDir, "diff"), { recursive: true });
      fs.writeFileSync(
        path.join(outputDir, "diff", file),
        PNG.sync.write(diff),
      );
      const details = `${(percentage * 100).toFixed(4)}% mismatch, ${mismatch} pixels`;
      console.log(`DIFF: ${file} (${details})`);
      rows.push({ status: "DIFF", file, details });
      diffs += 1;
    } else {
      matches += 1;
    }
  }

  for (const file of [...mainFiles].sort()) {
    copyTo(path.join(mainDir, file), outputDir, "main", file);
    console.log(`REMOVED: ${file} (on main, not on branch)`);
    rows.push({ status: "REMOVED", file, details: "not on branch" });
  }

  const summary = `${matches} match, ${diffs} differ, ${added} added, ${mainFiles.size} removed`;
  console.log(`\nSummary: ${summary}`);
  writeJobSummary(rows, summary);
  process.exit(0);
}

main();
