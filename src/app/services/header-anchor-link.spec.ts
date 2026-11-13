import { ViewportScroller } from "@angular/common";
import { TestBed } from "@angular/core/testing";

import { HeaderAnchorLink } from "./header-anchor-link";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("HeaderAnchorLink", () => {
  let service: HeaderAnchorLink;
  let target: HTMLElement;
  let originalUrl: string;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [...sharedTestingProviders] });
    service = TestBed.inject(HeaderAnchorLink);
    originalUrl = window.location.href;
    target = document.createElement("div");
    target.id = "anchor_spec_target";
    target.style.scrollMarginTop = "24px";
    document.body.appendChild(target);
  });

  afterEach(() => {
    target.remove();
    history.replaceState(history.state, "", originalUrl);
  });

  it("adds the fragment target scroll margin to the scroll offset", () => {
    const setOffset = spyOn(TestBed.inject(ViewportScroller), "setOffset");
    service.syncScrollOffset();
    const offset = setOffset.calls.mostRecent().args[0] as () => [
      number,
      number,
    ];

    const withoutFragment = offset()[1];
    history.replaceState(history.state, "", "#anchor_spec_target");

    expect(offset()[1]).toBe(withoutFragment + 24);
  });

  it("scrolls to the current fragment once its target exists", () => {
    const scrollToAnchor = spyOn(
      TestBed.inject(ViewportScroller),
      "scrollToAnchor",
    );
    history.replaceState(history.state, "", "#anchor_spec_target");

    service.scrollToCurrentFragment();

    expect(scrollToAnchor).toHaveBeenCalledWith("anchor_spec_target", {
      behavior: "smooth",
    });
  });
});
