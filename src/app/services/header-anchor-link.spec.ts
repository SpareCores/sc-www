import { ViewportScroller } from "@angular/common";
import { TestBed } from "@angular/core/testing";

import { HeaderAnchorLink } from "./header-anchor-link";
import { ShareLink } from "./share-link";
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

  it("stops waiting for the fragment target after user input", () => {
    jasmine.clock().install();
    const scrollToAnchor = spyOn(
      TestBed.inject(ViewportScroller),
      "scrollToAnchor",
    );
    target.remove();
    history.replaceState(history.state, "", "#anchor_spec_target");

    service.scrollToCurrentFragment();
    window.dispatchEvent(new Event("wheel"));
    document.body.appendChild(target);
    jasmine.clock().tick(100);
    jasmine.clock().uninstall();

    expect(scrollToAnchor).not.toHaveBeenCalled();
  });

  it("copies the anchor link through ShareLink", () => {
    const copyUrl = spyOn(TestBed.inject(ShareLink), "copyUrl").and.resolveTo(
      true,
    );

    service.copy("anchor_spec_target");

    expect(copyUrl).toHaveBeenCalledWith(
      jasmine.stringMatching(/#anchor_spec_target$/),
    );
  });
});
