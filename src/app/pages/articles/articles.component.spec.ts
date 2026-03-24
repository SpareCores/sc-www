import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ArticlesComponent } from "./articles.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ArticlesComponent", () => {
  let component: ArticlesComponent;
  let fixture: ComponentFixture<ArticlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticlesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
