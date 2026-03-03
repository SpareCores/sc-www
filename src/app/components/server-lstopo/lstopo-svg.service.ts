import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, catchError } from "rxjs";

const SVG_BAKED_STYLES = `
  text { fill: #ffffff; font-family: ui-monospace, monospace; }
  rect, line { stroke: #34d399; }
  rect.Machine { fill: #082f49; }
  rect.Die { fill: #0c4a6e; }
  rect.PCIBridge { fill: #082f49; }
  rect.NUMANode { fill: #0c4a6e; }
  rect.Package { fill: #082f49; }
  rect.L3, rect.L2, rect.L1d, rect.L1i { fill: #082f49; }
  rect.Core { fill: #082f49; }
  rect.PU { fill: #ffffff; }
  text.PU { fill: #082f49; }
  rect.HostBridge { fill: #082f49; }
  rect.PCI { fill: #0c4a6e; }
  rect.Net { fill: #082f49; }
  rect.Block { fill: #082f49; }
  rect.Misc { fill: #082f49; }
  rect { transition: stroke-width 0.15s ease, stroke 0.15s ease, filter 0.15s ease; }
  rect:hover { stroke: #a7f3d0; stroke-width: 1.5; filter: drop-shadow(0 0 1.5px #34d399); cursor: pointer; }
`;

@Injectable({ providedIn: "root" })
export class LstopoSvgService {
  private http = inject(HttpClient);

  getSvg(url: string): Observable<string | null> {
    return this.http
      .get(url, { responseType: "text" })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Parses the raw SVG text once and derives all three display variants
   * (coloured thumbnail, tooltip overlay, normalised modal) in a single pass,
   * avoiding redundant DOMParser/XMLSerializer round-trips.
   */
  processSvg(svgText: string): {
    w: number;
    h: number;
    coloredSvg: string;
    tooltipSvg: string;
    normalizedSvg: string;
  } {
    const { doc, svgEl, w, h } = this.parseSvg(svgText);
    const serializer = new XMLSerializer();

    // 1. Normalized — viewBox already fixed by parseSvg, nothing else to change.
    const normalizedSvg = serializer.serializeToString(doc);

    // 2. Tooltip overlay — remove width/height so it stretches to fill container.
    const tooltipEl = svgEl.cloneNode(true) as SVGSVGElement;
    tooltipEl.removeAttribute("width");
    tooltipEl.removeAttribute("height");
    const tooltipSvg = serializer.serializeToString(tooltipEl);

    // 3. Coloured thumbnail — inject brand-colour <style> block.
    const coloredEl = svgEl.cloneNode(true) as SVGSVGElement;
    const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = SVG_BAKED_STYLES;
    coloredEl.insertBefore(styleEl, coloredEl.firstChild);
    const coloredSvg = serializer.serializeToString(coloredEl);

    return { w, h, coloredSvg, tooltipSvg, normalizedSvg };
  }

  /**
   * Parses an SVG string, normalises the viewBox (strips unit suffixes like "px")
   * and returns the document, root element and intrinsic dimensions.
   */
  private parseSvg(svgText: string): {
    doc: Document;
    svgEl: SVGSVGElement;
    w: number;
    h: number;
  } {
    const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
    const svgEl = doc.documentElement as unknown as SVGSVGElement;
    const w = parseFloat(svgEl.getAttribute("width") ?? "0");
    const h = parseFloat(svgEl.getAttribute("height") ?? "0");
    // Override viewBox when missing or when it contains unit suffixes (e.g. "0 0 1436px 1576px")
    const existing = svgEl.getAttribute("viewBox");
    if ((!existing || /\d+[a-z%]+/i.test(existing)) && w && h) {
      svgEl.setAttribute("viewBox", `0 0 ${w} ${h}`);
    }
    return { doc, svgEl, w, h };
  }

  /**
   * Returns a serialised SVG string with brand-colour styles baked in as a
   * <style> element — safe to use as the source of a Blob / <img> URL.
   */
  private buildColoredSvg(svgText: string): string {
    const { doc, svgEl } = this.parseSvg(svgText);
    const styleEl = doc.createElementNS("http://www.w3.org/2000/svg", "style");
    styleEl.textContent = SVG_BAKED_STYLES;
    svgEl.insertBefore(styleEl, svgEl.firstChild);
    return new XMLSerializer().serializeToString(doc);
  }

  /**
   * Returns a serialised SVG string with width/height removed so it can
   * stretch to fill its container — used for the transparent hover overlay.
   */
  private buildTooltipSvg(svgText: string): string {
    const { doc, svgEl } = this.parseSvg(svgText);
    svgEl.removeAttribute("width");
    svgEl.removeAttribute("height");
    return new XMLSerializer().serializeToString(doc);
  }

  /**
   * Returns a serialised SVG string with only the viewBox normalised (unit
   * suffixes stripped) — used for the modal where natural size is desired.
   */
  private normalizeViewBox(svgText: string): string {
    const { doc } = this.parseSvg(svgText);
    return new XMLSerializer().serializeToString(doc);
  }
}
