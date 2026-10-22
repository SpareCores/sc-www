import {
  DOCUMENT,
  Injectable,
  NgZone,
  PLATFORM_ID,
  inject,
} from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { Analytics } from "./analytics";

const GLOSSARY_SCRIPT_URL =
  import.meta.env?.NG_APP_GLOSSARY_SCRIPT_URL ||
  "https://docs.sparecores.com/glossary.js";
const GLOSSARY_SCRIPT_TIMEOUT_MS = 10000;

type GlossaryView = {
  term: string;
  via: string;
};

@Injectable({
  providedIn: "root",
})
export class Glossary {
  private platformId = inject(PLATFORM_ID);
  private document = inject(DOCUMENT);
  private ngZone = inject(NgZone);
  private analytics = inject(Analytics);
  private loaded: Promise<boolean> | null = null;
  private viewsTracked = false;

  apply(element: HTMLElement): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.load()
        .then((loaded) => {
          if (loaded) {
            this.document.defaultView?.SpareCoresGlossary?.apply(element);
          }
        })
        .catch((error) => this.analytics.SentryException(error));
    });
  }

  private load(): Promise<boolean> {
    if (!this.loaded) {
      this.loaded = new Promise((resolve) => {
        const view = this.document.defaultView;
        if (!view) {
          resolve(false);
          return;
        }

        this.trackViews(view);

        const script = this.document.createElement("script");
        const timeout = view.setTimeout(
          () => fail("timed out"),
          GLOSSARY_SCRIPT_TIMEOUT_MS,
        );
        const fail = (reason: string) => {
          view.clearTimeout(timeout);
          script.onload = null;
          script.onerror = null;
          script.remove();
          this.analytics.SentryException(
            new Error(`Glossary script ${reason}: ${GLOSSARY_SCRIPT_URL}`),
          );
          resolve(false);
        };
        script.src = GLOSSARY_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
          view.clearTimeout(timeout);
          if (view.SpareCoresGlossary) {
            resolve(true);
          } else {
            fail("did not register SpareCoresGlossary");
          }
        };
        script.onerror = () => fail("failed to load");
        this.document.head.appendChild(script);
      });
    }
    return this.loaded;
  }

  private trackViews(view: Window): void {
    if (this.viewsTracked) {
      return;
    }

    this.viewsTracked = true;
    view.addEventListener("sc-glossary-view", (event) => {
      const detail = (event as CustomEvent<GlossaryView>).detail;
      this.analytics.trackEvent("glossary term view", {
        term: detail?.term,
        via: detail?.via,
      });
    });
  }
}
