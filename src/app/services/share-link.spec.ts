import { TestBed } from "@angular/core/testing";

import { ShareLink } from "./share-link";
import { Toast } from "./toast";
import { sharedTestingProviders } from "../../testing/testbed.providers";

describe("ShareLink", () => {
  const show = jasmine.createSpy("show");

  beforeEach(() => {
    show.calls.reset();
    TestBed.configureTestingModule({
      providers: [
        ...sharedTestingProviders,
        { provide: Toast, useValue: { show } },
      ],
    });
  });

  it("copies the current URL and confirms with a toast", async () => {
    const writeText = spyOn(navigator.clipboard, "writeText").and.resolveTo();

    expect(await TestBed.inject(ShareLink).copyCurrentUrl()).toBeTrue();
    expect(writeText).toHaveBeenCalledWith(document.location.href);
    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: "Link copied to clipboard!" }),
    );
  });

  it("copies a given URL", async () => {
    const writeText = spyOn(navigator.clipboard, "writeText").and.resolveTo();

    expect(
      await TestBed.inject(ShareLink).copyUrl("https://example.com/a"),
    ).toBeTrue();
    expect(writeText).toHaveBeenCalledWith("https://example.com/a");
  });

  it("reports a failed copy", async () => {
    spyOn(navigator.clipboard, "writeText").and.rejectWith(new Error("denied"));

    expect(await TestBed.inject(ShareLink).copyCurrentUrl()).toBeFalse();
    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({ type: "error" }),
    );
  });
});
