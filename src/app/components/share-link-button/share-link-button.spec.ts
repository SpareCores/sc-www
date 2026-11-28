import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { sharedTestingProviders } from "../../../testing/testbed.providers";
import { ShareLink } from "../../services/share-link";
import { ShareLinkButton } from "./share-link-button";

describe("ShareLinkButton", () => {
  let fixture: ComponentFixture<ShareLinkButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShareLinkButton],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareLinkButton);
    fixture.detectChanges();
  });

  it("copies the link and swaps the icon", async () => {
    const copy = spyOn(
      TestBed.inject(ShareLink),
      "copyCurrentUrl",
    ).and.resolveTo(true);
    const button = fixture.debugElement.query(By.css("sc-button"));

    button.triggerEventHandler("buttonClick", new MouseEvent("click"));
    await fixture.whenStable();
    fixture.detectChanges();

    expect(copy).toHaveBeenCalled();
    expect(button.componentInstance.icon()).toBe("check");
  });
});
