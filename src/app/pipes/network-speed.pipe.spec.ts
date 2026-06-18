import { NetworkSpeedPipe } from "./network-speed.pipe";

describe("NetworkSpeedPipe", () => {
  const pipe = new NetworkSpeedPipe();

  it("keeps zero visible and only hides nullish values", () => {
    expect(pipe.transform(0)).toBe("0 Gbps");
    expect(pipe.transform(0.5)).toBe("500 Mbps");
    expect(pipe.transform(2)).toBe("2 Gbps");
    expect(pipe.transform(null)).toBe("-");
    expect(pipe.transform(undefined)).toBe("-");
  });
});
