import {
  ConnectedPosition,
  HorizontalConnectionPos,
} from "@angular/cdk/overlay";

export type DropdownPlacement =
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "top"
  | "top-start"
  | "top-end";

const OFFSET = 10;

const MIRRORED_PLACEMENTS: Record<DropdownPlacement, DropdownPlacement> = {
  bottom: "top",
  "bottom-start": "top-start",
  "bottom-end": "top-end",
  top: "bottom",
  "top-start": "bottom-start",
  "top-end": "bottom-end",
};

export function toConnectedPositions(
  placement: DropdownPlacement,
  flip: boolean,
): ConnectedPosition[] {
  const primary = toConnectedPosition(placement);
  return flip
    ? [primary, toConnectedPosition(MIRRORED_PLACEMENTS[placement])]
    : [primary];
}

function toConnectedPosition(placement: DropdownPlacement): ConnectedPosition {
  const [side, alignment] = placement.split("-");
  const x: HorizontalConnectionPos =
    alignment === "start" || alignment === "end" ? alignment : "center";

  return side === "bottom"
    ? {
        originX: x,
        originY: "bottom",
        overlayX: x,
        overlayY: "top",
        offsetY: OFFSET,
      }
    : {
        originX: x,
        originY: "top",
        overlayX: x,
        overlayY: "bottom",
        offsetY: -OFFSET,
      };
}
