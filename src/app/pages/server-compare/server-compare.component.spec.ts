import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ServerCompareComponent } from "./server-compare.component";

describe("ServerCompareComponent", () => {
  let component: ServerCompareComponent;
  let fixture: ComponentFixture<ServerCompareComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServerCompareComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ServerCompareComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
