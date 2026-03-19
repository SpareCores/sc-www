import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareComponent } from "./server-compare.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerCompareComponent", () => {
  let component: ServerCompareComponent;
  let fixture: ComponentFixture<ServerCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
