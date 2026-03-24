import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerOGComponent } from "./server-og.component";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerOGComponent", () => {
  let component: ServerOGComponent;
  let fixture: ComponentFixture<ServerOGComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerOGComponent],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerOGComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
