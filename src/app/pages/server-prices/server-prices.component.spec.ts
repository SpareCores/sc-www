import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerPricesComponent } from "./server-prices.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerPricesComponent", () => {
  let component: ServerPricesComponent;
  let fixture: ComponentFixture<ServerPricesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerPricesComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerPricesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
