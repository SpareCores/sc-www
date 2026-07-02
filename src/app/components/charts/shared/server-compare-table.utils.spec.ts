import {
  formatNumberWithCommas,
  getBestBenchmarkCellStyle,
  getBestPropertyCellStyle,
  getServerPropertyValue,
} from "./server-compare-table.utils";

type PropertyValueServer = Parameters<typeof getServerPropertyValue>[1];
type BestPropertyServer = Parameters<typeof getBestPropertyCellStyle>[1];

describe("server compare table utils", () => {
  it("formats numbers with commas", () => {
    expect(formatNumberWithCommas(1234567)).toBe("1,234,567");
  });

  it("flags the best benchmark value when higher is better", () => {
    expect(
      getBestBenchmarkCellStyle(
        20,
        [10, 20, 15],
        { higher_is_better: true },
        "best",
      ),
    ).toBe("best");
  });

  it("flags the best benchmark value when lower is better", () => {
    expect(
      getBestBenchmarkCellStyle(
        10,
        [10, 20, 15],
        { higher_is_better: false },
        "best",
      ),
    ).toBe("best");
  });

  it("formats instance property values", () => {
    expect(
      getServerPropertyValue({ id: "memory_amount" }, { memory_amount: 2048 }),
    ).toBe("2.0 GiB");
  });

  it("formats byte-valued columns with binary units", () => {
    const server: PropertyValueServer & { disk_bytes: number } = {
      disk_bytes: 2048,
    };

    expect(
      getServerPropertyValue({ id: "disk_bytes", unit: "byte" }, server),
    ).toBe("2 KiB");
  });

  it("returns a dash for array properties containing nested objects", () => {
    const server: PropertyValueServer & { gpus: Array<{ name: string }> } = {
      gpus: [{ name: "A100" }],
    };

    expect(getServerPropertyValue({ id: "gpus" }, server)).toBe("-");
  });

  it("renders boolean values with inline lucide svg markup", () => {
    expect(
      getServerPropertyValue({ id: "hw_virt" }, { hw_virt: true } as never),
    ).toBe("check");
    expect(
      getServerPropertyValue({ id: "hw_virt" }, { hw_virt: false } as never),
    ).toBe("x");
  });

  it("renders non-hw_virt boolean properties as dashes", () => {
    expect(
      getServerPropertyValue({ id: "virtualization" }, {
        virtualization: true,
      } as never),
    ).toBe("-");
    expect(
      getServerPropertyValue({ id: "virtualization" }, {
        virtualization: false,
      } as never),
    ).toBe("-");
  });

  it("renders none-like values as dashes", () => {
    expect(
      getServerPropertyValue({ id: "hw_virt" }, { hw_virt: "none" } as never),
    ).toBe("-");
    expect(getServerPropertyValue({ id: "hw_virt" }, {} as never)).toBe("-");
    expect(
      getServerPropertyValue({ id: "vcpu_count", unit: "vCPU" }, {} as never),
    ).toBe("-");
    expect(
      getServerPropertyValue({ id: "memory_amount" }, {
        memory_amount: null,
      } as never),
    ).toBe("-");
    expect(
      getServerPropertyValue({ id: "storage_size" }, {
        storage_size: undefined,
      } as never),
    ).toBe("-");
    expect(
      getServerPropertyValue({ id: "region" }, { region: "" } as never),
    ).toBe("-");
    expect(
      getServerPropertyValue({ id: "region" }, { region: "none" } as never),
    ).toBe("-");
  });

  it("renders zero values with units", () => {
    expect(
      getServerPropertyValue({ id: "memory_amount" }, { memory_amount: 0 }),
    ).toBe("0.0 GiB");
    expect(
      getServerPropertyValue({ id: "storage_size" }, { storage_size: 0 }),
    ).toBe("0 GB");
    expect(
      getServerPropertyValue({ id: "gpu_memory_min" }, { gpu_memory_min: 0 }),
    ).toBe("0 GiB");
    expect(
      getServerPropertyValue({ id: "network_speed_max" }, {
        network_speed_max: 0,
      } as never),
    ).toBe("0 Gbps");
    expect(
      getServerPropertyValue({ id: "cpu_l3_cache" }, {
        cpu_l3_cache: 0,
      } as never),
    ).toBe("0 KiB");
    expect(
      getServerPropertyValue({ id: "inbound_traffic" }, {
        inbound_traffic: 0,
      } as never),
    ).toBe("0 GiB/mo");
    expect(getServerPropertyValue({ id: "ipv4" }, { ipv4: 0 } as never)).toBe(
      0,
    );
    expect(
      getServerPropertyValue({ id: "gpu_count" }, { gpu_count: 0 } as never),
    ).toBe(0);
    expect(
      getServerPropertyValue({ id: "vcpu_count", unit: "vCPU" }, {
        vcpu_count: 0,
      } as never),
    ).toBe("0 vCPU");
    expect(
      getServerPropertyValue({ id: "disk_bytes", unit: "byte" }, {
        disk_bytes: 0,
      } as never),
    ).toBe("0 Bytes");
  });

  it("formats known property types with existing helpers", () => {
    expect(
      getServerPropertyValue({ id: "storage_size" }, { storage_size: 500 }),
    ).toBe("500 GB");
    expect(
      getServerPropertyValue(
        { id: "gpu_memory_total" },
        {
          gpu_memory_total: 16384,
        },
      ),
    ).toBe("16 GiB");
    expect(
      getServerPropertyValue({ id: "network_speed_baseline" }, {
        network_speed_baseline: 25,
      } as never),
    ).toBe("25 Gbps");
    expect(
      getServerPropertyValue({ id: "cpu_l2_cache" }, {
        cpu_l2_cache: 256,
      } as never),
    ).toBe("256 KiB");
    expect(
      getServerPropertyValue({ id: "outbound_traffic" }, {
        outbound_traffic: 2048,
      } as never),
    ).toBe("2 TiB/mo");
    expect(
      getServerPropertyValue({ id: "gpu_count" }, { gpu_count: 0.5 } as never),
    ).toBe("½");
  });

  it("flags the best numeric property", () => {
    const server: BestPropertyServer & { vcpu_count: number } = {
      vcpu_count: 8,
    };
    const servers: Array<BestPropertyServer & { vcpu_count: number }> = [
      { vcpu_count: 4 },
      { vcpu_count: 8 },
    ];

    expect(
      getBestPropertyCellStyle("vcpu_count", server, servers, "best"),
    ).toBe("best");
  });

  it("flags the lowest average time to start including ties", () => {
    const servers: Array<
      BestPropertyServer & { average_time_to_start: number }
    > = [
      { average_time_to_start: 30 },
      { average_time_to_start: 11 },
      { average_time_to_start: 11 },
      { average_time_to_start: 28 },
    ];

    expect(
      getBestPropertyCellStyle(
        "average_time_to_start",
        servers[0],
        servers,
        "best",
      ),
    ).toBe("");
    expect(
      getBestPropertyCellStyle(
        "average_time_to_start",
        servers[1],
        servers,
        "best",
      ),
    ).toBe("best");
    expect(
      getBestPropertyCellStyle(
        "average_time_to_start",
        servers[2],
        servers,
        "best",
      ),
    ).toBe("best");
  });
});
