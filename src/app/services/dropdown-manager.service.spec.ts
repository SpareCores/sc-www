import { TestBed } from "@angular/core/testing";

import { DropdownManagerService } from "./dropdown-manager.service";

describe("DropdownManagerService", () => {
  let service: DropdownManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DropdownManagerService);
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
