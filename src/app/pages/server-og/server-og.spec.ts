import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerOG } from "./server-og";
import { sharedTestingProviders } from "../../../testing/testbed.providers";

describe("ServerOG", () => {
  let component: ServerOG;
  let fixture: ComponentFixture<ServerOG>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerOG],
      providers: [...sharedTestingProviders],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerOG);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
