import { buildDetailsRows, dedupeIdentityRows } from "./details-card.utils";

describe("details card utils", () => {
  it("drops empty values and maps booleans to icons", () => {
    const rows = buildDetailsRows(
      [
        { id: "a", name: "A", value: true },
        { id: "b", name: "B", value: null },
      ],
      (id) => (id === "a" ? "About A" : undefined),
    );

    expect(rows).toEqual([
      {
        id: "a",
        name: "A",
        values: ["check"],
        routerLink: undefined,
        tooltips: [{ key: "a", content: "About A" }],
      },
    ]);
  });

  it("folds identity rows matching the name into its tooltips", () => {
    const rows = dedupeIdentityRows(
      [
        {
          id: "name",
          name: "Name",
          values: ["m5.large"],
          tooltips: [{ key: "name", content: "Name" }],
        },
        {
          id: "api_reference",
          name: "API Reference",
          values: ["M5.LARGE"],
          tooltips: [{ key: "api_reference", content: "Reference" }],
        },
        { id: "family", name: "Family", values: ["m5"] },
      ],
      ["api_reference"],
    );

    expect(rows.map((row) => row.id)).toEqual(["name", "family"]);
    expect(rows[0].tooltips?.map((tooltip) => tooltip.key)).toEqual([
      "name",
      "api_reference",
    ]);
  });
});
