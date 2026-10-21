import { TestBed } from "@angular/core/testing";

import { DropdownManager } from "./dropdown-manager";

describe("DropdownManager", () => {
  let service: DropdownManager;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownManager);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("resolves existing dropdown elements immediately", async () => {
    const triggerEl = document.createElement("button");
    triggerEl.id = "dropdown-trigger";
    document.body.appendChild(triggerEl);

    const targetEl = document.createElement("div");
    targetEl.id = "dropdown-target";
    document.body.appendChild(targetEl);

    try {
      const result = await (service as any).waitForElements(
        "dropdown-trigger",
        "dropdown-target",
      );

      expect(result).toEqual({ triggerEl, targetEl });
    } finally {
      triggerEl.remove();
      targetEl.remove();
    }
  });
});
