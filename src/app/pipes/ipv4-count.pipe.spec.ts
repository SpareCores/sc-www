import { Ipv4CountPipe } from "./ipv4-count.pipe";

describe("Ipv4CountPipe", () => {
  const pipe = new Ipv4CountPipe();

  it("keeps zero visible and only hides nullish values", () => {
    expect(pipe.transform(0)).toBe(0);
    expect(pipe.transform(4)).toBe(4);
    expect(pipe.transform(null)).toBe("-");
    expect(pipe.transform(undefined)).toBe("-");
  });
});
