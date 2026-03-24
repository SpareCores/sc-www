import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerListingComponent } from "./server-listing.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerListingComponent", () => {
  let component: ServerListingComponent;
  let fixture: ComponentFixture<ServerListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerListingComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
