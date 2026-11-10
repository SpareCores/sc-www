import { existsSync, globSync, readFileSync, writeFileSync } from "node:fs";

const [previousFile, shardsDir, outputFile] = process.argv.slice(2);

function readDurations(file) {
  return new Map(
    JSON.parse(readFileSync(file, "utf8")).durations.map(
      ({ spec, duration }) => [spec, duration],
    ),
  );
}

const previous = existsSync(previousFile)
  ? readDurations(previousFile)
  : new Map();
const current = new Map(
  globSync(`${shardsDir}/*/timings-shard.json`).flatMap((file) => [
    ...readDurations(file),
  ]),
);

const durations = globSync("cypress/e2e/**/*.cy.ts")
  .map((spec) => spec.replaceAll("\\", "/"))
  .filter((spec) => current.has(spec) || previous.has(spec))
  .map((spec) => ({
    spec,
    duration: current.get(spec) ?? previous.get(spec),
  }))
  .sort((a, b) => b.duration - a.duration);

writeFileSync(outputFile, `${JSON.stringify({ durations }, null, 2)}\n`);
