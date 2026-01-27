import { TimeToShortDatePipe } from "./time-to-short-date.pipe";

describe("TimeToShortDatePipe", () => {
  it("create an instance", () => {
    const pipe = new TimeToShortDatePipe();
    expect(pipe).toBeTruthy();
  });
});
