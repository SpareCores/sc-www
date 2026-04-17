import {
  decodeBase64JsonUrlState,
  isBenchmarkUrlState,
  isServerCompareUrlState,
} from "./encoded-url-state";

describe("encoded-url-state", () => {
  it("decodes valid compare URL state", () => {
    const encoded = btoa(
      JSON.stringify([
        {
          display_name: "c7a.large",
          vendor: "aws",
          server: "c7a.large",
          zonesRegions: [{ region: "us-east-1", zone: "us-east-1a" }],
        },
      ]),
    );

    const decoded = decodeBase64JsonUrlState(encoded, isServerCompareUrlState);

    expect(decoded.error).toBeNull();
    expect(decoded.value).toEqual([
      {
        display_name: "c7a.large",
        vendor: "aws",
        server: "c7a.large",
        zonesRegions: [{ region: "us-east-1", zone: "us-east-1a" }],
      },
    ]);
  });

  it("returns an error for malformed base64 payloads", () => {
    const decoded = decodeBase64JsonUrlState(
      "%not-base64%",
      isServerCompareUrlState,
    );

    expect(decoded.value).toBeNull();
    expect(decoded.error).not.toBeNull();
  });

  it("rejects benchmark payloads with an unexpected shape", () => {
    const encoded = btoa(JSON.stringify({ id: "stress_ng:bestn" }));

    const decoded = decodeBase64JsonUrlState(encoded, isBenchmarkUrlState);

    expect(decoded.value).toBeNull();
    expect(decoded.error).toEqual(jasmine.any(Error));
  });
});
