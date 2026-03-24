import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerDetailsComponent } from "./server-details.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerDetailsComponent", () => {
  let component: ServerDetailsComponent;
  let fixture: ComponentFixture<ServerDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerDetailsComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
