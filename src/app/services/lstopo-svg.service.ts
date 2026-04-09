import { Injectable, inject } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, of, catchError } from "rxjs";

@Injectable({ providedIn: "root" })
export class LstopoSvgService {
  private http = inject(HttpClient);

  getSvg(url: string): Observable<string | null> {
    return this.http
      .get(url, { responseType: "text" })
      .pipe(catchError(() => of(null)));
  }

  /**
   * Parses the raw SVG text and returns a normalized SVG string that preserves
   * the upstream coloring while fixing structural issues such as malformed viewBox values.
   */
  processSvg(svgText: string): {
    w: number;
    normalizedSvg: string;
  } {
    const { doc, w } = this.parseSvg(svgText);
    const serializer = new XMLSerializer();
    const normalizedSvg = serializer.serializeToString(doc);

    return { w, normalizedSvg };
  }

  /**
   * Parses an SVG string, normalises the viewBox (strips unit suffixes like "px")
   * and returns the document and intrinsic width.
   */
  private parseSvg(svgText: string): {
    doc: Document;
    w: number;
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
    return { doc, w };
  }
}
