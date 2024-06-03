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

/**
 * ComplianceFramework
 * List of Compliance Frameworks, such as HIPAA or SOC 2 Type 1.
 *
 * Attributes:
 *     compliance_framework_id (str): Unique identifier.
 *     name (str): Human-friendly name.
 *     abbreviation (typing.Optional[str]): Short abbreviation of the Framework name.
 *     description (typing.Optional[str]): Description of the framework in a few paragrahs, outlining key features and characteristics for reference.
 *     logo (typing.Optional[str]): Publicly accessible URL to the image of the Framework's logo.
 *     homepage (typing.Optional[str]): Public homepage with more information on the Framework.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface ComplianceFramework {
  /**
   * Compliance Framework Id
   * Unique identifier.
   */
  compliance_framework_id: string;
  /**
   * Name
   * Human-friendly name.
   */
  name: string;
  /**
   * Abbreviation
   * Short abbreviation of the Framework name.
   */
  abbreviation: string | null;
  /**
   * Description
   * Description of the framework in a few paragrahs, outlining key features and characteristics for reference.
   */
  description: string | null;
  /**
   * Logo
   * Publicly accessible URL to the image of the Framework's logo.
   */
  logo?: string | null;
  /**
   * Homepage
   * Public homepage with more information on the Framework.
   */
  homepage?: string | null;
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

/** ComplianceFrameworks */
export enum ComplianceFrameworks {
  Hipaa = "hipaa",
  Iso27001 = "iso27001",
  Soc2T2 = "soc2t2",
}

/**
 * Country
 * Country and continent mapping.
 *
 * Attributes:
 *     country_id (str): Country code by ISO 3166 alpha-2.
 *     continent (str): Continent name.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Country {
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

/**
 * Datacenter
 * Datacenters/regions of Vendors.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     datacenter_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
 *     display_name (str): Human-friendly reference (usually the id or name) of the resource.
 *     aliases (typing.List[str]): List of other commonly used names for the same Datacenter.
 *     country_id (str): Reference to the Country, where the Datacenter is located.
 *     state (typing.Optional[str]): Optional state/administrative area of the Datacenter's location within the Country.
 *     city (typing.Optional[str]): Optional city name of the Datacenter's location.
 *     address_line (typing.Optional[str]): Optional address line of the Datacenter's location.
 *     zip_code (typing.Optional[str]): Optional ZIP code of the Datacenter's location.
 *     lon (typing.Optional[float]): Longitude coordinate of the Datacenter's known or approximate location.
 *     lat (typing.Optional[float]): Latitude coordinate of the Datacenter's known or approximate location.
 *     founding_year (typing.Optional[int]): 4-digit year when the Datacenter was founded.
 *     green_energy (typing.Optional[bool]): If the Datacenter is 100% powered by renewable energy.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Datacenter {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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
   * Lon
   * Longitude coordinate of the Datacenter's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Datacenter's known or approximate location.
   */
  lat?: number | null;
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
}

/** DatacenterBase */
export interface DatacenterBase {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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
   * Lon
   * Longitude coordinate of the Datacenter's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Datacenter's known or approximate location.
   */
  lat?: number | null;
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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
   * Lon
   * Longitude coordinate of the Datacenter's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Datacenter's known or approximate location.
   */
  lat?: number | null;
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

/** DatacenterPKs */
export interface DatacenterPKs {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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
   * Lon
   * Longitude coordinate of the Datacenter's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Datacenter's known or approximate location.
   */
  lat?: number | null;
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
  vendor: VendorBase;
}

/** Datacenters */
export enum Datacenters {
  Value1000 = "1000",
  Value1100 = "1100",
  Value1210 = "1210",
  Value1220 = "1220",
  Value1230 = "1230",
  Value1250 = "1250",
  Value1260 = "1260",
  Value1270 = "1270",
  Value1280 = "1280",
  Value1290 = "1290",
  Value1300 = "1300",
  Value1310 = "1310",
  Value1320 = "1320",
  Value1330 = "1330",
  Value1340 = "1340",
  Value1350 = "1350",
  Value1360 = "1360",
  Value1370 = "1370",
  Value1380 = "1380",
  Value1390 = "1390",
  Value1410 = "1410",
  Value1420 = "1420",
  Value1430 = "1430",
  Value1440 = "1440",
  Value1450 = "1450",
  Value1460 = "1460",
  Value1470 = "1470",
  Value1480 = "1480",
  Value1490 = "1490",
  Value1510 = "1510",
  Value1520 = "1520",
  Value1530 = "1530",
  Value1540 = "1540",
  Value1550 = "1550",
  Value1560 = "1560",
  Value1570 = "1570",
  Value1580 = "1580",
  Value1590 = "1590",
  Value1600 = "1600",
  Value1610 = "1610",
  Value2 = "2",
  Value3 = "3",
  Value4 = "4",
  Value5 = "5",
  Value6 = "6",
  AfSouth1 = "af-south-1",
  ApEast1 = "ap-east-1",
  ApNortheast1 = "ap-northeast-1",
  ApNortheast2 = "ap-northeast-2",
  ApNortheast3 = "ap-northeast-3",
  ApSouth1 = "ap-south-1",
  ApSouth2 = "ap-south-2",
  ApSoutheast1 = "ap-southeast-1",
  ApSoutheast2 = "ap-southeast-2",
  ApSoutheast3 = "ap-southeast-3",
  ApSoutheast4 = "ap-southeast-4",
  CaCentral1 = "ca-central-1",
  CaWest1 = "ca-west-1",
  CnNorth1 = "cn-north-1",
  CnNorthwest1 = "cn-northwest-1",
  EuCentral1 = "eu-central-1",
  EuCentral2 = "eu-central-2",
  EuNorth1 = "eu-north-1",
  EuSouth1 = "eu-south-1",
  EuSouth2 = "eu-south-2",
  EuWest1 = "eu-west-1",
  EuWest2 = "eu-west-2",
  EuWest3 = "eu-west-3",
  IlCentral1 = "il-central-1",
  MeCentral1 = "me-central-1",
  MeSouth1 = "me-south-1",
  SaEast1 = "sa-east-1",
  UsEast1 = "us-east-1",
  UsEast2 = "us-east-2",
  UsWest1 = "us-west-1",
  UsWest2 = "us-west-2",
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

/** NameAndDescription */
export interface NameAndDescription {
  /** Name */
  name: string;
  /** Description */
  description: string;
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

/**
 * Server
 * Server types.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     server_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
 *     display_name (str): Human-friendly reference (usually the id or name) of the resource.
 *     description (typing.Optional[str]): Short description.
 *     family (typing.Optional[str]): Server family, e.g. General-purpose machine (GCP), or M5g (AWS).
 *     vcpus (int): Default number of virtual CPUs (vCPU) of the server.
 *     hypervisor (typing.Optional[str]): Hypervisor of the virtual server, e.g. Xen, KVM, Nitro or Dedicated.
 *     cpu_allocation (CpuAllocation): Allocation of CPU(s) to the server, e.g. shared, burstable or dedicated.
 *     cpu_cores (typing.Optional[int]): Default number of CPU cores of the server. Equals to vCPUs when HyperThreading is disabled.
 *     cpu_speed (typing.Optional[float]): Vendor-reported maximum CPU clock speed (GHz).
 *     cpu_architecture (CpuArchitecture): CPU architecture (arm64, arm64_mac, i386, or x86_64).
 *     cpu_manufacturer (typing.Optional[str]): The manufacturer of the primary processor, e.g. Intel or AMD.
 *     cpu_family (typing.Optional[str]): The product line/family of the primary processor, e.g. Xeon, Core i7, Ryzen 9.
 *     cpu_model (typing.Optional[str]): The model number of the primary processor, e.g. 9750H.
 *     cpus (typing.List[sc_crawler.table_fields.Cpu]): JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
 *     memory (int): RAM amount (MiB).
 *     gpu_count (int): Number of GPU accelerator(s).
 *     gpu_memory_min (typing.Optional[int]): Memory (MiB) allocated to the lowest-end GPU accelerator.
 *     gpu_memory_total (typing.Optional[int]): Overall memory (MiB) allocated to all the GPU accelerator(s).
 *     gpu_manufacturer (typing.Optional[str]): The manufacturer of the primary GPU accelerator, e.g. Nvidia or AMD.
 *     gpu_model (typing.Optional[str]): The model number of the primary GPU accelerator.
 *     gpus (typing.List[sc_crawler.table_fields.Gpu]): JSON array of GPU accelerator details, including the manufacturer, name, and memory (MiB) of each GPU.
 *     storage_size (int): Overall size (GB) of the disk(s).
 *     storage_type (typing.Optional[sc_crawler.table_fields.StorageType]): Primary disk type, e.g. HDD, SSD, NVMe SSD, or network).
 *     storages (typing.List[sc_crawler.table_fields.Disk]): JSON array of disks attached to the server, including the size (MiB) and type of each disk.
 *     network_speed (typing.Optional[float]): The baseline network performance (Gbps) of the network card.
 *     inbound_traffic (float): Amount of complimentary inbound traffic (GB) per month.
 *     outbound_traffic (float): Amount of complimentary outbound traffic (GB) per month.
 *     ipv4 (int): Number of complimentary IPv4 address(es).
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Server {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Family
   * Server family, e.g. General-purpose machine (GCP), or M5g (AWS).
   */
  family?: string | null;
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Family
   * Server family, e.g. General-purpose machine (GCP), or M5g (AWS).
   */
  family?: string | null;
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Family
   * Server family, e.g. General-purpose machine (GCP), or M5g (AWS).
   */
  family?: string | null;
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

/** ServerPKsWithPrices */
export interface ServerPKsWithPrices {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
  /**
   * Description
   * Short description.
   */
  description: string | null;
  /**
   * Family
   * Server family, e.g. General-purpose machine (GCP), or M5g (AWS).
   */
  family?: string | null;
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
  /** Prices */
  prices: ServerPricePKs[];
}

/** ServerPricePKs */
export interface ServerPricePKs {
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
  datacenter: DatacenterBase;
  zone: ZoneBase;
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
 * Storage
 * Flexible storage options that can be attached to a Server.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     storage_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     description (typing.Optional[str]): Short description.
 *     storage_type (StorageType): High-level category of the storage, e.g. HDD or SDD.
 *     max_iops (typing.Optional[int]): Maximum Input/Output Operations Per Second.
 *     max_throughput (typing.Optional[int]): Maximum Throughput (MiB/s).
 *     min_size (typing.Optional[int]): Minimum required size (GiB).
 *     max_size (typing.Optional[int]): Maximum possible size (GiB).
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Storage {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Storage Id
   * Unique identifier, as called at the Vendor.
   */
  storage_id: string;
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
  /** High-level category of the storage, e.g. HDD or SDD. */
  storage_type: StorageType;
  /**
   * Max Iops
   * Maximum Input/Output Operations Per Second.
   */
  max_iops?: number | null;
  /**
   * Max Throughput
   * Maximum Throughput (MiB/s).
   */
  max_throughput?: number | null;
  /**
   * Min Size
   * Minimum required size (GiB).
   */
  min_size?: number | null;
  /**
   * Max Size
   * Maximum possible size (GiB).
   */
  max_size?: number | null;
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
 * StorageType
 * Type of a storage, e.g. HDD or SSD.
 */
export enum StorageType {
  Hdd = "hdd",
  Ssd = "ssd",
  NvmeSsd = "nvme ssd",
  Network = "network",
}

/** TableMetaData */
export interface TableMetaData {
  table: NameAndDescription;
  /** Fields */
  fields: NameAndDescription[];
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

/**
 * Vendor
 * Compute resource vendors, such as cloud and server providers.
 *
 *     Examples:
 *         >>> from sc_crawler.tables import Vendor
 *         >>> from sc_crawler.lookup import countries
 *         >>> aws = Vendor(vendor_id='aws', name='Amazon Web Services', homepage='https://aws.amazon.com', country=countries["US"], founding_year=2002)
 *         >>> aws
 *         Vendor(vendor_id='aws'...
 *         >>> from sc_crawler import vendors
 *         >>> vendors.aws
 *         Vendor(vendor_id='aws'...
 *
 *
 * Attributes:
 *     vendor_id (str): Unique identifier.
 *     name (str): Human-friendly name.
 *     logo (typing.Optional[str]): Publicly accessible URL to the image of the Vendor's logo.
 *     homepage (typing.Optional[str]): Public homepage of the Vendor.
 *     country_id (str): Reference to the Country, where the Vendor's main headquarter is located.
 *     state (typing.Optional[str]): Optional state/administrative area of the Vendor's location within the Country.
 *     city (typing.Optional[str]): Optional city name of the Vendor's main location.
 *     address_line (typing.Optional[str]): Optional address line of the Vendor's main location.
 *     zip_code (typing.Optional[str]): Optional ZIP code of the Vendor's main location.
 *     founding_year (int): 4-digit year when the Vendor was founded.
 *     status_page (typing.Optional[str]): Public status page of the Vendor.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Vendor {
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

/**
 * Zone
 * Availability zones of Datacenters.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     datacenter_id (str): Reference to the Datacenter.
 *     zone_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
 *     display_name (str): Human-friendly reference (usually the id or name) of the resource.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Zone {
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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
   * Api Reference
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
   */
  api_reference: string;
  /**
   * Display Name
   * Human-friendly reference (usually the id or name) of the resource.
   */
  display_name: string;
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

/** Response Table Country Table Country Get */
export type TableCountryTableCountryGetData = Country[];

/** Response Table Compliance Frameworks Table Compliance Framework Get */
export type TableComplianceFrameworksTableComplianceFrameworkGetData = ComplianceFramework[];

/** Response Table Vendor Table Vendor Get */
export type TableVendorTableVendorGetData = Vendor[];

/** Response Table Datacenter Table Datacenter Get */
export type TableDatacenterTableDatacenterGetData = Datacenter[];

/** Response Table Zone Table Zone Get */
export type TableZoneTableZoneGetData = Zone[];

/** Response Table Server Table Server Get */
export type TableServerTableServerGetData = Server[];

export type TableMetadataServerTableServerMetaGetData = TableMetaData;

/** Response Table Storage Table Storage Get */
export type TableStorageTableStorageGetData = Storage[];

export interface SearchDatacentersDatacentersGetParams {
  /**
   * Vendor id
   * Cloud provider vendor.
   */
  vendor?: "aws" | "gcp" | "hcloud";
}

/** Response Search Datacenters Datacenters Get */
export type SearchDatacentersDatacentersGetData = DatacenterPKs[];

export type GetServerServerVendorIdServerIdGetData = ServerPKsWithPrices;

export interface SearchServersServersGetParams {
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
   * Minimum amount of memory in GBs.
   */
  memory_min?: number | null;
  /**
   * Active only
   * Show only active servers
   * @default true
   */
  only_active?: boolean | null;
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
   * Storage Size
   * Reserver storage size in GBs.
   */
  storage_size?: number | null;
  /**
   * Storage Type
   * Storage type.
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * GPU count
   * Number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * GPU memory
   * Amount of GPU memory in GBs.
   */
  gpu_memory_min?: number | null;
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
   * @default "vcpus"
   */
  order_by?: string;
  /**
   * Order Dir
   * Order direction.
   * @default "asc"
   */
  order_dir?: OrderDir;
  /**
   * Add Total Count Header
   * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
   * @default false
   */
  add_total_count_header?: boolean;
}

/** Response Search Servers Servers Get */
export type SearchServersServersGetData = ServerPKs[];

export interface SearchServerPricesServerPricesGetParams {
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
   * Minimum amount of memory in GBs.
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
  allocation?: "ondemand" | "reserved" | "spot";
  /**
   * Vendor id
   * Cloud provider vendor.
   */
  vendor?: "aws" | "gcp" | "hcloud";
  /**
   * Datacenter id
   * Datacenter.
   */
  datacenters?:
    | "1000"
    | "1100"
    | "1210"
    | "1220"
    | "1230"
    | "1250"
    | "1260"
    | "1270"
    | "1280"
    | "1290"
    | "1300"
    | "1310"
    | "1320"
    | "1330"
    | "1340"
    | "1350"
    | "1360"
    | "1370"
    | "1380"
    | "1390"
    | "1410"
    | "1420"
    | "1430"
    | "1440"
    | "1450"
    | "1460"
    | "1470"
    | "1480"
    | "1490"
    | "1510"
    | "1520"
    | "1530"
    | "1540"
    | "1550"
    | "1560"
    | "1570"
    | "1580"
    | "1590"
    | "1600"
    | "1610"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "af-south-1"
    | "ap-east-1"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ca-central-1"
    | "ca-west-1"
    | "cn-north-1"
    | "cn-northwest-1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "il-central-1"
    | "me-central-1"
    | "me-south-1"
    | "sa-east-1"
    | "us-east-1"
    | "us-east-2"
    | "us-west-1"
    | "us-west-2";
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Storage Size
   * Reserver storage size in GBs.
   */
  storage_size?: number | null;
  /**
   * Storage Type
   * Storage type.
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Countries
   * Datacenter countries.
   */
  countries?:
    | "AE"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "ES"
    | "FI"
    | "FR"
    | "GB"
    | "HK"
    | "ID"
    | "IE"
    | "IL"
    | "IN"
    | "IT"
    | "JP"
    | "KR"
    | "NL"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TW"
    | "US"
    | "ZA";
  /**
   * GPU count
   * Number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * GPU memory
   * Amount of GPU memory in GBs.
   */
  gpu_memory_min?: number | null;
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

/** Response Search Server Prices Server Prices Get */
export type SearchServerPricesServerPricesGetData = ServerPriceWithPKs[];

export interface AssistServerFiltersAiAssistServerFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Server Filters Ai Assist Server Filters Get */
export type AssistServerFiltersAiAssistServerFiltersGetData = object;

export interface AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Server Price Filters Ai Assist Server Price Filters Get */
export type AssistServerPriceFiltersAiAssistServerPriceFiltersGetData = object;
