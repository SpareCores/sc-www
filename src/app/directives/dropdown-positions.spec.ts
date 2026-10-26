import { placePanel, toConnectedPositions } from "./dropdown-positions";

describe("placePanel", () => {
  const viewport = { width: 1000, height: 800 };
  const panel = { width: 200, height: 150 };
  const trigger = (top: number, left: number) => ({
    top,
    bottom: top + 40,
    left,
    right: left + 100,
    width: 100,
    height: 40,
  });

  it("places bottom-end below the trigger, aligned to its end", () => {
    expect(
      placePanel(trigger(100, 500), panel, viewport, "bottom-end", false),
    ).toEqual({ top: 150, left: 400 });
  });

  it("aligns bottom-start to the trigger start and bottom to its center", () => {
    expect(
      placePanel(trigger(100, 500), panel, viewport, "bottom-start", false)
        .left,
    ).toBe(500);
    expect(
      placePanel(trigger(100, 500), panel, viewport, "bottom", false).left,
    ).toBe(450);
  });

  it("flips above the trigger when there is no room below", () => {
    expect(
      placePanel(trigger(700, 500), panel, viewport, "bottom-start", true).top,
    ).toBe(540);
  });

  it("stays below without flip even when there is no room", () => {
    expect(
      placePanel(trigger(700, 500), panel, viewport, "bottom-start", false).top,
    ).toBe(750);
  });

  it("keeps the panel inside the horizontal viewport edges", () => {
    expect(
      placePanel(trigger(100, 950), panel, viewport, "bottom-start", false)
        .left,
    ).toBe(792);
    expect(
      placePanel(trigger(100, 0), panel, viewport, "bottom-end", false).left,
    ).toBe(8);
  });
});

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
