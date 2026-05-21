import { Injectable, PLATFORM_ID, inject } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { AnalyticsService } from "./analytics.service";

@Injectable({
  providedIn: "root",
})
export class NeetoCalService {
  private platformId = inject(PLATFORM_ID);
  private analyticsService = inject(AnalyticsService);

  private isScriptLoaded = false;
  private isScriptLoading = false;
  private initializedElements = new WeakSet<Element>();

  initialize(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    (window as any).neetoCal = (window as any).neetoCal || {
      embed: function (...args: any[]) {
        ((window as any).neetoCal.q = (window as any).neetoCal.q || []).push(
          args,
        );
      },
    };
    if (!this.isScriptLoaded && !this.isScriptLoading) {
      this.isScriptLoading = true;
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://cdn.neetocal.com/javascript/embed.js";
      script.onload = () => {
        this.isScriptLoaded = true;
        this.isScriptLoading = false;
        this.initializeButtons();
      };
      document.head.appendChild(script);
    } else if (this.isScriptLoaded) {
      this.initializeButtons();
    }
  }

  private initializeButtons(): void {
    const advisorMeetingContext =
      "I am interested in multi-server optimization, programmatic API access, or workflow automations for advanced cloud management.";

    const buttonContextMap = {
      "#meeting-header-demo": "",
      "#meeting-general-demo": "",
      "#meeting-advisor-promo-banner": advisorMeetingContext,
      "#meeting-navigator-caas":
        "I am interested in the managed Container-as-a-Service platform.",
      "#meeting-painpoints":
        "Discuss use-cases and painpoints, and get a demo of the Spare Cores Resource Tracker and Sentinel products.",
      "#meeting-services-consulting":
        "I am interested in Cloud-Optimization Consulting services.",
      "#meeting-services-shiny":
        "I would like to discuss Scalable Shiny/Streamlit Hosting.",
      "#meeting-services-llms": "I need help with AI Workload Sizing.",
    } as Record<string, string>;
    const buttonSelectors = Object.keys(buttonContextMap);

    buttonSelectors.forEach((selector) => {
      const element = document.querySelector(selector);
      if (element && !this.initializedElements.has(element)) {
        this.initializedElements.add(element);
        element.addEventListener("click", () => {
          this.analyticsService.trackEvent("meeting scheduler open", {
            button_selector: selector.replace("#", ""),
          });
        });
        const contextMessage = buttonContextMap[selector];
        (window as any).neetoCal.embed({
          type: "elementClick",
          id: "7c3c0ad8-812b-423f-b064-0ea44d527368",
          organization: "sparecores",
          elementSelector: selector,
          queryParams: { context: contextMessage },
        });
      }
    });
  }
}
