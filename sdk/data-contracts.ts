/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/**
 * Allocation
 * Server allocation options.
 */
export enum Allocation {
  Ondemand = "ondemand",
  Reserved = "reserved",
  Spot = "spot",
}

/** ComplianceFrameworks */
export enum ComplianceFrameworks {
  Hipaa = "hipaa",
  Iso27001 = "iso27001",
  Soc2T2 = "soc2t2",
}

/** CountryBase */
export interface CountryBase {
  /**
   * Country Id
   * Country code by ISO 3166 alpha-2.
   */
  country_id: string;
  /**
   * Continent
   * Continent name.
   */
  continent: string;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
}

/**
 * Cpu
 * CPU details.
 */
export interface Cpu {
  /** Manufacturer */
  manufacturer?: string | null;
  /** Family */
  family?: string | null;
  /** Model */
  model?: string | null;
  /** Cores */
  cores?: number | null;
  /** Threads */
  threads?: number | null;
  /** L1 Cache Size */
  l1_cache_size?: number | null;
  /** L2 Cache Size */
  l2_cache_size?: number | null;
  /** L3 Cache Size */
  l3_cache_size?: number | null;
  /** Microcode */
  microcode?: string | null;
  /**
   * Capabilities
   * @default []
   */
  capabilities?: string[];
  /**
   * Bugs
   * @default []
   */
  bugs?: string[];
  /** Bogomips */
  bogomips?: number | null;
}

/**
 * CpuAllocation
 * CPU allocation methods at cloud vendors.
 */
export enum CpuAllocation {
  Shared = "Shared",
  Burstable = "Burstable",
  Dedicated = "Dedicated",
}

/**
 * CpuArchitecture
 * CPU architectures.
 */
export enum CpuArchitecture {
  Arm64 = "arm64",
  Arm64Mac = "arm64_mac",
  I386 = "i386",
  X8664 = "x86_64",
  X8664Mac = "x86_64_mac",
}

/** DatacenterBaseWithPKs */
export interface DatacenterBaseWithPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Datacenter Id
   * Unique identifier, as called at the Vendor.
   */
  datacenter_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Aliases
   * List of other commonly used names for the same Datacenter.
   * @default []
   */
  aliases?: string[];
  /**
   * Country Id
   * Reference to the Country, where the Datacenter is located.
   */
  country_id: string;
  /**
   * State
   * Optional state/administrative area of the Datacenter's location within the Country.
   */
  state?: string | null;
  /**
   * City
   * Optional city name of the Datacenter's location.
   */
  city?: string | null;
  /**
   * Address Line
   * Optional address line of the Datacenter's location.
   */
  address_line?: string | null;
  /**
   * Zip Code
   * Optional ZIP code of the Datacenter's location.
   */
  zip_code?: string | null;
  /**
   * Founding Year
   * 4-digit year when the Datacenter was founded.
   */
  founding_year?: number | null;
  /**
   * Green Energy
   * If the Datacenter is 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
  country: CountryBase;
}

/**
 * Disk
 * Disk definition based on size and storage type.
 */
export interface Disk {
  /**
   * Size
   * @default 0
   */
  size?: number;
  /** Type of a storage, e.g. HDD or SSD. */
  storage_type: StorageType;
}

/**
 * Gpu
 * GPU accelerator details.
 */
export interface Gpu {
  /** Manufacturer */
  manufacturer: string;
  /** Model */
  model: string;
  /** Memory */
  memory: number;
  /** Firmware */
  firmware?: string | null;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** OrderDir */
export enum OrderDir {
  Asc = "asc",
  Desc = "desc",
}

/**
 * PriceTier
 * Price tier definition.
 *
 * As standard JSON does not support Inf, NaN etc values,
 * those should be passed as string, e.g. for the upper bound.
 *
 * See [float_inf_to_str][sc_crawler.utils.float_inf_to_str] for
 * converting an infinite numeric value into "Infinity".
 */
export interface PriceTier {
  /** Lower */
  lower: number | string;
  /** Upper */
  upper: number | string;
  /** Price */
  price: number;
}

/**
 * PriceUnit
 * Supported units for the price tables.
 */
export enum PriceUnit {
  Year = "year",
  Month = "month",
  Hour = "hour",
  GiB = "GiB",
  GB = "GB",
  GBMonth = "GB/month",
}

/** ServerBase */
export interface ServerBase {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Server Id
   * Unique identifier, as called at the Vendor.
   */
  server_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Vcpus
   * Default number of virtual CPUs (vCPU) of the server.
   */
  vcpus?: number;
  /**
   * Hypervisor
   * Hypervisor of the virtual server, e.g. Xen, KVM, Nitro or Dedicated.
   */
  hypervisor?: string | null;
  /** Allocation of CPU(s) to the server, e.g. shared, burstable or dedicated. */
  cpu_allocation?: CpuAllocation;
  /**
   * Cpu Cores
   * Default number of CPU cores of the server. Equals to vCPUs when HyperThreading is disabled.
   */
  cpu_cores?: number | null;
  /**
   * Cpu Speed
   * Vendor-reported maximum CPU clock speed (GHz).
   */
  cpu_speed?: number | null;
  /** CPU architecture (arm64, arm64_mac, i386, or x86_64). */
  cpu_architecture?: CpuArchitecture;
  /**
   * Cpu Manufacturer
   * The manufacturer of the primary processor, e.g. Intel or AMD.
   */
  cpu_manufacturer?: string | null;
  /**
   * Cpu Family
   * The product line/family of the primary processor, e.g. Xeon, Core i7, Ryzen 9.
   */
  cpu_family?: string | null;
  /**
   * Cpu Model
   * The model number of the primary processor, e.g. 9750H.
   */
  cpu_model?: string | null;
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory
   * RAM amount (MiB).
   */
  memory?: number;
  /**
   * Gpu Count
   * Number of GPU accelerator(s).
   * @default 0
   */
  gpu_count?: number;
  /**
   * Gpu Memory Min
   * Memory (MiB) allocated to the lowest-end GPU accelerator.
   */
  gpu_memory_min?: number | null;
  /**
   * Gpu Memory Total
   * Overall memory (MiB) allocated to all the GPU accelerator(s).
   */
  gpu_memory_total?: number | null;
  /**
   * Gpu Manufacturer
   * The manufacturer of the primary GPU accelerator, e.g. Nvidia or AMD.
   */
  gpu_manufacturer?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator.
   */
  gpu_model?: string | null;
  /**
   * Gpus
   * JSON array of GPU accelerator details, including the manufacturer, name, and memory (MiB) of each GPU.
   * @default []
   */
  gpus?: Gpu[];
  /**
   * Storage Size
   * Overall size (GB) of the disk(s).
   * @default 0
   */
  storage_size?: number;
  /** Primary disk type, e.g. HDD, SSD, NVMe SSD, or network). */
  storage_type?: StorageType | null;
  /**
   * Storages
   * JSON array of disks attached to the server, including the size (MiB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed?: number | null;
  /**
   * Inbound Traffic
   * Amount of complimentary inbound traffic (GB) per month.
   * @default 0
   */
  inbound_traffic?: number;
  /**
   * Outbound Traffic
   * Amount of complimentary outbound traffic (GB) per month.
   * @default 0
   */
  outbound_traffic?: number;
  /**
   * Ipv4
   * Number of complimentary IPv4 address(es).
   * @default 0
   */
  ipv4?: number;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
}

/** ServerPKs */
export interface ServerPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Server Id
   * Unique identifier, as called at the Vendor.
   */
  server_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Vcpus
   * Default number of virtual CPUs (vCPU) of the server.
   */
  vcpus?: number;
  /**
   * Hypervisor
   * Hypervisor of the virtual server, e.g. Xen, KVM, Nitro or Dedicated.
   */
  hypervisor?: string | null;
  /** Allocation of CPU(s) to the server, e.g. shared, burstable or dedicated. */
  cpu_allocation?: CpuAllocation;
  /**
   * Cpu Cores
   * Default number of CPU cores of the server. Equals to vCPUs when HyperThreading is disabled.
   */
  cpu_cores?: number | null;
  /**
   * Cpu Speed
   * Vendor-reported maximum CPU clock speed (GHz).
   */
  cpu_speed?: number | null;
  /** CPU architecture (arm64, arm64_mac, i386, or x86_64). */
  cpu_architecture?: CpuArchitecture;
  /**
   * Cpu Manufacturer
   * The manufacturer of the primary processor, e.g. Intel or AMD.
   */
  cpu_manufacturer?: string | null;
  /**
   * Cpu Family
   * The product line/family of the primary processor, e.g. Xeon, Core i7, Ryzen 9.
   */
  cpu_family?: string | null;
  /**
   * Cpu Model
   * The model number of the primary processor, e.g. 9750H.
   */
  cpu_model?: string | null;
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory
   * RAM amount (MiB).
   */
  memory?: number;
  /**
   * Gpu Count
   * Number of GPU accelerator(s).
   * @default 0
   */
  gpu_count?: number;
  /**
   * Gpu Memory Min
   * Memory (MiB) allocated to the lowest-end GPU accelerator.
   */
  gpu_memory_min?: number | null;
  /**
   * Gpu Memory Total
   * Overall memory (MiB) allocated to all the GPU accelerator(s).
   */
  gpu_memory_total?: number | null;
  /**
   * Gpu Manufacturer
   * The manufacturer of the primary GPU accelerator, e.g. Nvidia or AMD.
   */
  gpu_manufacturer?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator.
   */
  gpu_model?: string | null;
  /**
   * Gpus
   * JSON array of GPU accelerator details, including the manufacturer, name, and memory (MiB) of each GPU.
   * @default []
   */
  gpus?: Gpu[];
  /**
   * Storage Size
   * Overall size (GB) of the disk(s).
   * @default 0
   */
  storage_size?: number;
  /** Primary disk type, e.g. HDD, SSD, NVMe SSD, or network). */
  storage_type?: StorageType | null;
  /**
   * Storages
   * JSON array of disks attached to the server, including the size (MiB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed?: number | null;
  /**
   * Inbound Traffic
   * Amount of complimentary inbound traffic (GB) per month.
   * @default 0
   */
  inbound_traffic?: number;
  /**
   * Outbound Traffic
   * Amount of complimentary outbound traffic (GB) per month.
   * @default 0
   */
  outbound_traffic?: number;
  /**
   * Ipv4
   * Number of complimentary IPv4 address(es).
   * @default 0
   */
  ipv4?: number;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
  vendor: VendorBase;
}

/** ServerPriceWithPKs */
export interface ServerPriceWithPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Datacenter Id
   * Reference to the Datacenter.
   */
  datacenter_id: string;
  /**
   * Zone Id
   * Reference to the Zone.
   */
  zone_id: string;
  /**
   * Server Id
   * Reference to the Server.
   */
  server_id: string;
  /**
   * Operating System
   * Operating System.
   */
  operating_system: string;
  /**
   * Allocation method, e.g. on-demand or spot.
   * @default "ondemand"
   */
  allocation?: Allocation;
  /** Billing unit of the pricing model. */
  unit: PriceUnit;
  /**
   * Price
   * Actual price of a billing unit.
   */
  price: number;
  /**
   * Price Upfront
   * Price to be paid when setting up the resource.
   * @default 0
   */
  price_upfront?: number;
  /**
   * Price Tiered
   * List of pricing tiers with min/max thresholds and actual prices.
   * @default []
   */
  price_tiered?: PriceTier[];
  /**
   * Currency
   * Currency of the prices.
   * @default "USD"
   */
  currency?: string;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
  vendor: VendorBase;
  datacenter: DatacenterBaseWithPKs;
  zone: ZoneBase;
  server: ServerBase;
}

/**
 * Status
 * Last known status of a resource, e.g. active or inactive.
 */
export enum Status {
  Active = "active",
  Inactive = "inactive",
}

/**
 * StorageType
 * Type of a storage, e.g. HDD or SSD.
 */
export enum StorageType {
  Hdd = "hdd",
  Ssd = "ssd",
  NvmeSsd = "nvme ssd",
  Network = "network",
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

/** VendorBase */
export interface VendorBase {
  /**
   * Vendor Id
   * Unique identifier.
   */
  vendor_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Logo
   * Publicly accessible URL to the image of the Vendor's logo.
   */
  logo?: string | null;
  /**
   * Homepage
   * Public homepage of the Vendor.
   */
  homepage?: string | null;
  /**
   * Country Id
   * Reference to the Country, where the Vendor's main headquarter is located.
   */
  country_id: string;
  /**
   * State
   * Optional state/administrative area of the Vendor's location within the Country.
   */
  state?: string | null;
  /**
   * City
   * Optional city name of the Vendor's main location.
   */
  city?: string | null;
  /**
   * Address Line
   * Optional address line of the Vendor's main location.
   */
  address_line?: string | null;
  /**
   * Zip Code
   * Optional ZIP code of the Vendor's main location.
   */
  zip_code?: string | null;
  /**
   * Founding Year
   * 4-digit year when the Vendor was founded.
   */
  founding_year: number;
  /**
   * Status Page
   * Public status page of the Vendor.
   */
  status_page?: string | null;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
}

/** Vendors */
export enum Vendors {
  Aws = "aws",
  Gcp = "gcp",
  Hcloud = "hcloud",
}

/** ZoneBase */
export interface ZoneBase {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Datacenter Id
   * Reference to the Datacenter.
   */
  datacenter_id: string;
  /**
   * Zone Id
   * Unique identifier, as called at the Vendor.
   */
  zone_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Status of the resource (active or inactive).
   * @default "active"
   */
  status?: Status;
  /**
   * Observed At
   * Timestamp of the last observation.
   * @format date-time
   */
  observed_at?: string;
}

/** Response Healthcheck Healthcheck Get */
export type HealthcheckHealthcheckGetData = object;

export type ReadServerServerVendorIdServerIdGetData = ServerPKs;

export interface SearchServerSearchGetParams {
  /**
   * Processor number
   * Minimum number of virtual CPUs.
   * @min 1
   * @max 128
   * @default 1
   */
  vcpus_min?: number;
  /**
   * Processor architecture
   * Processor architecture.
   */
  architecture?: "arm64" | "arm64_mac" | "i386" | "x86_64" | "x86_64_mac";
  /**
   * Memory amount
   * Minimum amount of memory in MBs.
   */
  memory_min?: number | null;
  /**
   * Maximum price
   * Maximum price (USD/hr).
   */
  price_max?: number | null;
  /**
   * Active only
   * Show only active servers
   * @default true
   */
  only_active?: boolean | null;
  /**
   * Green energy
   * Low CO2 emission only.
   */
  green_energy?: boolean | null;
  /**
   * Allocation
   * Server allocation method.
   */
  allocation?: Allocation | null;
  /**
   * Vendor id
   * Cloud provider vendor.
   */
  vendor?: "aws" | "gcp" | "hcloud";
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Limit
   * Maximum number of results. Set to -1 for unlimited
   * @default 50
   */
  limit?: number;
  /**
   * Page
   * Page number.
   */
  page?: number | null;
  /**
   * Order By
   * Order by column.
   * @default "price"
   */
  order_by?: string;
  /**
   * Order Dir
   * Order direction.
   * @default "asc"
   */
  order_dir?: OrderDir;
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string;
  /**
   * Add Total Count Header
   * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
   * @default false
   */
  add_total_count_header?: boolean;
}

/** Response Search Server Search Get */
export type SearchServerSearchGetData = ServerPriceWithPKs[];
