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

export interface PanelSize {
  width: number;
  height: number;
}

export interface TriggerRect extends PanelSize {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

const OFFSET = 10;
const EDGE = 8;

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

export function placePanel(
  trigger: TriggerRect,
  panel: PanelSize,
  viewport: PanelSize,
  placement: DropdownPlacement,
  flip: boolean,
): { top: number; left: number } {
  const [side, alignment] = placement.split("-");
  const below = trigger.bottom + OFFSET;
  const above = trigger.top - OFFSET - panel.height;
  const fitsBelow = below + panel.height <= viewport.height;
  const fitsAbove = above >= 0;

  let top = side === "bottom" ? below : above;
  if (flip && side === "bottom" && !fitsBelow && fitsAbove) {
    top = above;
  } else if (flip && side === "top" && !fitsAbove && fitsBelow) {
    top = below;
  }

  const left =
    alignment === "start"
      ? trigger.left
      : alignment === "end"
        ? trigger.right - panel.width
        : trigger.left + (trigger.width - panel.width) / 2;
  const maxLeft = Math.max(viewport.width - panel.width - EDGE, EDGE);

  return { top, left: Math.min(Math.max(left, EDGE), maxLeft) };
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
