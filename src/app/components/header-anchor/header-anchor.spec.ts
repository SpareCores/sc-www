import { ComponentFixture, TestBed } from "@angular/core/testing";
import { HeaderAnchor } from "./header-anchor";
import { HeaderAnchorLink } from "../../services/header-anchor-link";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("HeaderAnchor", () => {
  let fixture: ComponentFixture<HeaderAnchor>;
  let anchorLink: HeaderAnchorLink;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeaderAnchor],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    anchorLink = TestBed.inject(HeaderAnchorLink);
    fixture = TestBed.createComponent(HeaderAnchor);
    fixture.componentRef.setInput("anchorId", "llm_prompt");
    fixture.componentRef.setInput("label", "LLM Prompt Processing");
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it("renders the scroll target and the permalink", () => {
    const element = fixture.nativeElement as HTMLElement;
    const link = element.querySelector("a.sc-header-anchor");

    expect(element.querySelector("#llm_prompt")).not.toBeNull();
    expect(link?.getAttribute("href")).toContain("#llm_prompt");
    expect(link?.getAttribute("aria-label")).toBe(
      "Copy link to LLM Prompt Processing",
    );
  });

  it("omits the scroll target when disabled", () => {
    fixture.componentRef.setInput("withTarget", false);
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelector("#llm_prompt"),
    ).toBeNull();
  });

  it("copies the link on click", () => {
    const copySpy = spyOn(anchorLink, "copy");
    const link = (fixture.nativeElement as HTMLElement).querySelector(
      "a.sc-header-anchor",
    ) as HTMLAnchorElement;
    link.addEventListener("click", (event) => event.preventDefault());

    link.click();

    expect(copySpy).toHaveBeenCalledWith("llm_prompt");
  });
});
