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

  it("copies the current URL and confirms with a toast", () => {
    const writeText = spyOn(navigator.clipboard, "writeText").and.resolveTo();

    expect(TestBed.inject(ShareLink).copyCurrentUrl()).toBeTrue();
    expect(writeText).toHaveBeenCalledWith(document.location.href);
    expect(show).toHaveBeenCalledWith(
      jasmine.objectContaining({ title: "Link copied to clipboard!" }),
    );
  });
});
