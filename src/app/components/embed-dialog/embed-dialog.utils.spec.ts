import { buildEmbedPreset, embedTargetKey } from "./embed-dialog.utils";

describe("embed dialog utils", () => {
  const baseUrl = "https://sparecores.com";

  it("builds detail embed urls per resource", () => {
    const server = buildEmbedPreset(
      { kind: "details", resource: "server", vendor: "aws", id: "m5.large" },
      baseUrl,
    );
    const database = buildEmbedPreset(
      { kind: "details", resource: "database", vendor: "aws", id: "db" },
      baseUrl,
    );

    expect(server.srcFor("metadata")).toBe(
      `${baseUrl}/embed/server/aws/m5.large/metadata`,
    );
    expect(server.idPrefix).toBe("server_embed");
    expect(database.srcFor("pgbench")).toBe(
      `${baseUrl}/embed/database/aws/db/pgbench`,
    );
    expect(database.captureEventPrefix).toBe("database embed");
  });

  it("builds compare embed urls per resource", () => {
    const server = buildEmbedPreset(
      { kind: "compare", resource: "server", instances: "abc" },
      baseUrl,
    );
    const database = buildEmbedPreset(
      { kind: "compare", resource: "database", instances: "abc" },
      baseUrl,
    );

    expect(server.srcFor("generic")).toBe(
      `${baseUrl}/embed/compare/generic?instances=abc`,
    );
    expect(server.idPrefix).toBe("compare_embed");
    expect(server.minHeight).toBe(600);
    expect(database.srcFor("generic")).toBe(
      `${baseUrl}/embed/database-compare/generic?instances=abc`,
    );
    expect(database.idPrefix).toBe("database_compare_embed");
  });

  it("escapes base64 characters in compare embed urls", () => {
    const preset = buildEmbedPreset(
      { kind: "compare", resource: "server", instances: "a+b/c=" },
      baseUrl,
    );

    expect(preset.srcFor("generic")).toBe(
      `${baseUrl}/embed/compare/generic?instances=a%2Bb%2Fc%3D`,
    );
  });

  it("keys targets by what they embed", () => {
    expect(
      embedTargetKey({
        kind: "details",
        resource: "server",
        vendor: "aws",
        id: "a",
      }),
    ).not.toBe(
      embedTargetKey({
        kind: "details",
        resource: "server",
        vendor: "aws",
        id: "b",
      }),
    );
  });
});
