import { toConnectedPositions } from "./dropdown-positions";

describe("toConnectedPositions", () => {
  it("maps bottom-end below the trigger, aligned to its end", () => {
    expect(toConnectedPositions("bottom-end", false)).toEqual([
      {
        originX: "end",
        originY: "bottom",
        overlayX: "end",
        overlayY: "top",
        offsetY: 10,
      },
    ]);
  });

  it("maps bottom-start and bottom alignments", () => {
    expect(toConnectedPositions("bottom-start", false)[0]).toEqual(
      jasmine.objectContaining({ originX: "start", overlayX: "start" }),
    );
    expect(toConnectedPositions("bottom", false)[0]).toEqual(
      jasmine.objectContaining({ originX: "center", overlayX: "center" }),
    );
  });

  it("mirrors top placements above the trigger", () => {
    expect(toConnectedPositions("top-start", false)).toEqual([
      {
        originX: "start",
        originY: "top",
        overlayX: "start",
        overlayY: "bottom",
        offsetY: -10,
      },
    ]);
  });

  it("adds the vertical mirror as a fallback when flipping", () => {
    const positions = toConnectedPositions("bottom-start", true);

    expect(positions.length).toBe(2);
    expect(positions[1]).toEqual({
      originX: "start",
      originY: "top",
      overlayX: "start",
      overlayY: "bottom",
      offsetY: -10,
    });
  });
});
