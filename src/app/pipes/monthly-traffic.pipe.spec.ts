import { MonthlyTrafficPipe } from "./monthly-traffic.pipe";

describe("MonthlyTrafficPipe", () => {
  const pipe = new MonthlyTrafficPipe();

  it("keeps zero visible with units and only hides nullish values", () => {
    expect(pipe.transform(0)).toBe("0 GiB/mo");
    expect(pipe.transform(512)).toBe("512 GiB/mo");
    expect(pipe.transform(1024)).toBe("1 TiB/mo");
    expect(pipe.transform(null)).toBe("-");
    expect(pipe.transform(undefined)).toBe("-");
  });
});
