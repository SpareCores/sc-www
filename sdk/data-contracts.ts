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
 * Benchmark
 * Benchmark scenario definitions.
 *
 * Attributes:
 *     benchmark_id (str): Unique identifier of a specific Benchmark.
 *     name (str): Human-friendly name.
 *     description (typing.Optional[str]): Short description.
 *     framework (str): The name of the benchmark framework/software/tool used.
 *     config_fields (dict): A dictionary of descriptions on the framework-specific config options, e.g. {"bandwidth": "Memory amount to use for compression in MB."}.
 *     measurement (typing.Optional[str]): The name of measurement recoreded in the benchmark.
 *     unit (typing.Optional[str]): Optional unit of measurement for the benchmark score.
 *     higher_is_better (bool): If higher benchmark score means better performance, or vica versa.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Benchmark {
  /**
   * Benchmark Id
   * Unique identifier of a specific Benchmark.
   */
  benchmark_id: string;
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
   * Framework
   * The name of the benchmark framework/software/tool used.
   */
  framework: string;
  /**
   * Config Fields
   * A dictionary of descriptions on the framework-specific config options, e.g. {"bandwidth": "Memory amount to use for compression in MB."}.
   * @default {}
   */
  config_fields?: object;
  /**
   * Measurement
   * The name of measurement recoreded in the benchmark.
   */
  measurement?: string | null;
  /**
   * Unit
   * Optional unit of measurement for the benchmark score.
   */
  unit?: string | null;
  /**
   * Higher Is Better
   * If higher benchmark score means better performance, or vica versa.
   * @default true
   */
  higher_is_better?: boolean;
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
 * BenchmarkScore
 * Results of running Benchmark scenarios on Servers.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     server_id (str): Reference to the Server.
 *     benchmark_id (str): Reference to the Benchmark.
 *     config (sc_crawler.table_fields.HashableDict | dict): Dictionary of config parameters of the specific benchmark, e.g. {"bandwidth": 4096}
 *     score (float): The resulting score of the benchmark.
 *     note (typing.Optional[str]): Optional note, comment or context on the benchmark score.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface BenchmarkScore {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Server Id
   * Reference to the Server.
   */
  server_id: string;
  /**
   * Benchmark Id
   * Reference to the Benchmark.
   */
  benchmark_id: string;
  /**
   * Config
   * Dictionary of config parameters of the specific benchmark, e.g. {"bandwidth": 4096}
   * @default {}
   */
  config?: object;
  /**
   * Score
   * The resulting score of the benchmark.
   */
  score: number;
  /**
   * Note
   * Optional note, comment or context on the benchmark score.
   */
  note?: string | null;
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

/** Countries */
export enum Countries {
  AE = "AE",
  AU = "AU",
  BE = "BE",
  BH = "BH",
  BR = "BR",
  CA = "CA",
  CH = "CH",
  CL = "CL",
  CN = "CN",
  DE = "DE",
  ES = "ES",
  FI = "FI",
  FR = "FR",
  GB = "GB",
  HK = "HK",
  ID = "ID",
  IE = "IE",
  IL = "IL",
  IN = "IN",
  IT = "IT",
  JP = "JP",
  KR = "KR",
  NL = "NL",
  NO = "NO",
  PL = "PL",
  QA = "QA",
  SA = "SA",
  SE = "SE",
  SG = "SG",
  TW = "TW",
  US = "US",
  ZA = "ZA",
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

/** CpuFamilies */
export enum CpuFamilies {
  ARM = "ARM",
  ARMv8 = "ARMv8",
  AmpereAltra = "Ampere Altra",
  EPYC = "EPYC",
  Xeon = "Xeon",
}

/** CpuManufacturers */
export enum CpuManufacturers {
  AMD = "AMD",
  AWS = "AWS",
  Ampere = "Ampere",
  Apple = "Apple",
  Intel = "Intel",
  Microsoft = "Microsoft",
}

/**
 * DdrGeneration
 * Generation of the DDR SDRAM.
 */
export enum DdrGeneration {
  DDR3 = "DDR3",
  DDR4 = "DDR4",
  DDR5 = "DDR5",
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
  /** Family */
  family?: string | null;
  /** Model */
  model?: string | null;
  /** Memory */
  memory: number;
  /** Firmware Version */
  firmware_version?: string | null;
  /** Bios Version */
  bios_version?: string | null;
  /** Graphics Clock */
  graphics_clock?: number | null;
  /** Sm Clock */
  sm_clock?: number | null;
  /** Mem Clock */
  mem_clock?: number | null;
  /** Video Clock */
  video_clock?: number | null;
}

/** GpuFamilies */
export enum GpuFamilies {
  AdaLovelace = "Ada Lovelace",
  Ampere = "Ampere",
  Gaudi = "Gaudi",
  Hopper = "Hopper",
  Kepler = "Kepler",
  Maxwell = "Maxwell",
  RadeonProNavi = "Radeon Pro Navi",
  Turing = "Turing",
  Volta = "Volta",
}

/** GpuManufacturers */
export enum GpuManufacturers {
  AMD = "AMD",
  Habana = "Habana",
  NVIDIA = "NVIDIA",
}

/** GpuModels */
export enum GpuModels {
  A100 = "A100",
  A10G = "A10G",
  H100 = "H100",
  H200 = "H200",
  HL205 = "HL-205",
  K80 = "K80",
  L4 = "L4",
  L40S = "L40S",
  M60 = "M60",
  T4 = "T4",
  T4G = "T4G",
  V100 = "V100",
  V520 = "V520",
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthcheckResponse */
export interface HealthcheckResponse {
  /** Packages */
  packages: object;
  /** Database Last Updated */
  database_last_updated: number;
  /** Database Hash */
  database_hash: string;
  /** Database Alembic Version */
  database_alembic_version: string;
}

/** IdNameAndDescriptionAndCategory */
export interface IdNameAndDescriptionAndCategory {
  /** Name */
  name: string;
  /** Description */
  description: string;
  /** Id */
  id: string;
  /** Category */
  category: string;
  /** Unit */
  unit: string | null;
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
 * Region
 * Regions of Vendors.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     region_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depening on the vendor and actual API endpoint.
 *     display_name (str): Human-friendly reference (usually the id or name) of the resource.
 *     aliases (typing.List[str]): List of other commonly used names for the same Region.
 *     country_id (str): Reference to the Country, where the Region is located.
 *     state (typing.Optional[str]): Optional state/administrative area of the Region's location within the Country.
 *     city (typing.Optional[str]): Optional city name of the Region's location.
 *     address_line (typing.Optional[str]): Optional address line of the Region's location.
 *     zip_code (typing.Optional[str]): Optional ZIP code of the Region's location.
 *     lon (typing.Optional[float]): Longitude coordinate of the Region's known or approximate location.
 *     lat (typing.Optional[float]): Latitude coordinate of the Region's known or approximate location.
 *     founding_year (typing.Optional[int]): 4-digit year when the Region was founded.
 *     green_energy (typing.Optional[bool]): If the Region is 100% powered by renewable energy.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface Region {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Unique identifier, as called at the Vendor.
   */
  region_id: string;
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
   * List of other commonly used names for the same Region.
   * @default []
   */
  aliases?: string[];
  /**
   * Country Id
   * Reference to the Country, where the Region is located.
   */
  country_id: string;
  /**
   * State
   * Optional state/administrative area of the Region's location within the Country.
   */
  state?: string | null;
  /**
   * City
   * Optional city name of the Region's location.
   */
  city?: string | null;
  /**
   * Address Line
   * Optional address line of the Region's location.
   */
  address_line?: string | null;
  /**
   * Zip Code
   * Optional ZIP code of the Region's location.
   */
  zip_code?: string | null;
  /**
   * Lon
   * Longitude coordinate of the Region's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Region's known or approximate location.
   */
  lat?: number | null;
  /**
   * Founding Year
   * 4-digit year when the Region was founded.
   */
  founding_year?: number | null;
  /**
   * Green Energy
   * If the Region is 100% powered by renewable energy.
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

/** RegionBaseWithPKs */
export interface RegionBaseWithPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Unique identifier, as called at the Vendor.
   */
  region_id: string;
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
   * List of other commonly used names for the same Region.
   * @default []
   */
  aliases?: string[];
  /**
   * Country Id
   * Reference to the Country, where the Region is located.
   */
  country_id: string;
  /**
   * State
   * Optional state/administrative area of the Region's location within the Country.
   */
  state?: string | null;
  /**
   * City
   * Optional city name of the Region's location.
   */
  city?: string | null;
  /**
   * Address Line
   * Optional address line of the Region's location.
   */
  address_line?: string | null;
  /**
   * Zip Code
   * Optional ZIP code of the Region's location.
   */
  zip_code?: string | null;
  /**
   * Lon
   * Longitude coordinate of the Region's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Region's known or approximate location.
   */
  lat?: number | null;
  /**
   * Founding Year
   * 4-digit year when the Region was founded.
   */
  founding_year?: number | null;
  /**
   * Green Energy
   * If the Region is 100% powered by renewable energy.
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

/** RegionPKs */
export interface RegionPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Unique identifier, as called at the Vendor.
   */
  region_id: string;
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
   * List of other commonly used names for the same Region.
   * @default []
   */
  aliases?: string[];
  /**
   * Country Id
   * Reference to the Country, where the Region is located.
   */
  country_id: string;
  /**
   * State
   * Optional state/administrative area of the Region's location within the Country.
   */
  state?: string | null;
  /**
   * City
   * Optional city name of the Region's location.
   */
  city?: string | null;
  /**
   * Address Line
   * Optional address line of the Region's location.
   */
  address_line?: string | null;
  /**
   * Zip Code
   * Optional ZIP code of the Region's location.
   */
  zip_code?: string | null;
  /**
   * Lon
   * Longitude coordinate of the Region's known or approximate location.
   */
  lon?: number | null;
  /**
   * Lat
   * Latitude coordinate of the Region's known or approximate location.
   */
  lat?: number | null;
  /**
   * Founding Year
   * 4-digit year when the Region was founded.
   */
  founding_year?: number | null;
  /**
   * Green Energy
   * If the Region is 100% powered by renewable energy.
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

/** Regions */
export enum Regions {
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
  Value7 = "7",
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
  Australiacentral = "australiacentral",
  Australiacentral2 = "australiacentral2",
  Australiaeast = "australiaeast",
  Australiasoutheast = "australiasoutheast",
  Brazilsouth = "brazilsouth",
  Brazilsoutheast = "brazilsoutheast",
  Brazilus = "brazilus",
  CaCentral1 = "ca-central-1",
  Canadacentral = "canadacentral",
  Canadaeast = "canadaeast",
  CaWest1 = "ca-west-1",
  Centralindia = "centralindia",
  Centralus = "centralus",
  Centraluseuap = "centraluseuap",
  CnNorth1 = "cn-north-1",
  CnNorthwest1 = "cn-northwest-1",
  Eastasia = "eastasia",
  Eastus = "eastus",
  Eastus2 = "eastus2",
  Eastus2Euap = "eastus2euap",
  Eastusstg = "eastusstg",
  EuCentral1 = "eu-central-1",
  EuCentral2 = "eu-central-2",
  EuNorth1 = "eu-north-1",
  EuSouth1 = "eu-south-1",
  EuSouth2 = "eu-south-2",
  EuWest1 = "eu-west-1",
  EuWest2 = "eu-west-2",
  EuWest3 = "eu-west-3",
  Francecentral = "francecentral",
  Francesouth = "francesouth",
  Germanynorth = "germanynorth",
  Germanywestcentral = "germanywestcentral",
  IlCentral1 = "il-central-1",
  Israelcentral = "israelcentral",
  Italynorth = "italynorth",
  Japaneast = "japaneast",
  Japanwest = "japanwest",
  Jioindiacentral = "jioindiacentral",
  Jioindiawest = "jioindiawest",
  Koreacentral = "koreacentral",
  Koreasouth = "koreasouth",
  MeCentral1 = "me-central-1",
  MeSouth1 = "me-south-1",
  Mexicocentral = "mexicocentral",
  Northcentralus = "northcentralus",
  Northeurope = "northeurope",
  Norwayeast = "norwayeast",
  Norwaywest = "norwaywest",
  Polandcentral = "polandcentral",
  Qatarcentral = "qatarcentral",
  SaEast1 = "sa-east-1",
  Southafricanorth = "southafricanorth",
  Southafricawest = "southafricawest",
  Southcentralus = "southcentralus",
  Southcentralusstg = "southcentralusstg",
  Southeastasia = "southeastasia",
  Southindia = "southindia",
  Spaincentral = "spaincentral",
  Swedencentral = "swedencentral",
  Switzerlandnorth = "switzerlandnorth",
  Switzerlandwest = "switzerlandwest",
  Uaecentral = "uaecentral",
  Uaenorth = "uaenorth",
  Uksouth = "uksouth",
  Ukwest = "ukwest",
  UsEast1 = "us-east-1",
  UsEast2 = "us-east-2",
  UsWest1 = "us-west-1",
  UsWest2 = "us-west-2",
  Westcentralus = "westcentralus",
  Westeurope = "westeurope",
  Westindia = "westindia",
  Westus = "westus",
  Westus2 = "westus2",
  Westus3 = "westus3",
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
 *     cpu_l1_cache (typing.Optional[int]): L1 cache size (byte).
 *     cpu_l2_cache (typing.Optional[int]): L2 cache size (byte).
 *     cpu_l3_cache (typing.Optional[int]): L3 cache size (byte).
 *     cpu_flags (typing.List[str]): CPU features/flags.
 *     cpus (typing.List[sc_crawler.table_fields.Cpu]): JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
 *     memory_amount (int): RAM amount (MiB).
 *     memory_generation (typing.Optional[sc_crawler.table_fields.DdrGeneration]): Generation of the DDR SDRAM, e.g. DDR4 or DDR5.
 *     memory_speed (typing.Optional[int]): DDR SDRAM clock rate (Mhz).
 *     memory_ecc (typing.Optional[bool]): If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
 *     gpu_count (int): Number of GPU accelerator(s).
 *     gpu_memory_min (typing.Optional[int]): Memory (MiB) allocated to the lowest-end GPU accelerator.
 *     gpu_memory_total (typing.Optional[int]): Overall memory (MiB) allocated to all the GPU accelerator(s).
 *     gpu_manufacturer (typing.Optional[str]): The manufacturer of the primary GPU accelerator, e.g. Nvidia or AMD.
 *     gpu_family (typing.Optional[str]): The product family of the primary GPU accelerator, e.g. Turing.
 *     gpu_model (typing.Optional[str]): The model number of the primary GPU accelerator, e.g. Tesla T4.
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
   * Cpu L1 Cache
   * L1 cache size (byte).
   */
  cpu_l1_cache?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (byte).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (byte).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu Flags
   * CPU features/flags.
   * @default []
   */
  cpu_flags?: string[];
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory Amount
   * RAM amount (MiB).
   */
  memory_amount?: number;
  /** Generation of the DDR SDRAM, e.g. DDR4 or DDR5. */
  memory_generation?: DdrGeneration | null;
  /**
   * Memory Speed
   * DDR SDRAM clock rate (Mhz).
   */
  memory_speed?: number | null;
  /**
   * Memory Ecc
   * If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
   */
  memory_ecc?: boolean | null;
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
   * Gpu Family
   * The product family of the primary GPU accelerator, e.g. Turing.
   */
  gpu_family?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator, e.g. Tesla T4.
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
   * Cpu L1 Cache
   * L1 cache size (byte).
   */
  cpu_l1_cache?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (byte).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (byte).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu Flags
   * CPU features/flags.
   * @default []
   */
  cpu_flags?: string[];
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory Amount
   * RAM amount (MiB).
   */
  memory_amount?: number;
  /** Generation of the DDR SDRAM, e.g. DDR4 or DDR5. */
  memory_generation?: DdrGeneration | null;
  /**
   * Memory Speed
   * DDR SDRAM clock rate (Mhz).
   */
  memory_speed?: number | null;
  /**
   * Memory Ecc
   * If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
   */
  memory_ecc?: boolean | null;
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
   * Gpu Family
   * The product family of the primary GPU accelerator, e.g. Turing.
   */
  gpu_family?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator, e.g. Tesla T4.
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
   * Cpu L1 Cache
   * L1 cache size (byte).
   */
  cpu_l1_cache?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (byte).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (byte).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu Flags
   * CPU features/flags.
   * @default []
   */
  cpu_flags?: string[];
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory Amount
   * RAM amount (MiB).
   */
  memory_amount?: number;
  /** Generation of the DDR SDRAM, e.g. DDR4 or DDR5. */
  memory_generation?: DdrGeneration | null;
  /**
   * Memory Speed
   * DDR SDRAM clock rate (Mhz).
   */
  memory_speed?: number | null;
  /**
   * Memory Ecc
   * If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
   */
  memory_ecc?: boolean | null;
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
   * Gpu Family
   * The product family of the primary GPU accelerator, e.g. Turing.
   */
  gpu_family?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator, e.g. Tesla T4.
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
  /** Score */
  score?: number | null;
  /** Price */
  price?: number | null;
  /** Min Price */
  min_price?: number | null;
  /** Min Price Spot */
  min_price_spot?: number | null;
  /** Min Price Ondemand */
  min_price_ondemand?: number | null;
  /** Score Per Price */
  score_per_price?: number | null;
  vendor: VendorBase;
}

/**
 * ServerPrice
 * Server type prices per Region and Allocation method.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     region_id (str): Reference to the Region.
 *     zone_id (str): Reference to the Zone.
 *     server_id (str): Reference to the Server.
 *     operating_system (str): Operating System.
 *     allocation (Allocation): Allocation method, e.g. on-demand or spot.
 *     unit (PriceUnit): Billing unit of the pricing model.
 *     price (float): Actual price of a billing unit.
 *     price_upfront (float): Price to be paid when setting up the resource.
 *     price_tiered (typing.List[sc_crawler.table_fields.PriceTier]): List of pricing tiers with min/max thresholds and actual prices.
 *     currency (str): Currency of the prices.
 *     status (Status): Status of the resource (active or inactive).
 *     observed_at (datetime): Timestamp of the last observation.
 */
export interface ServerPrice {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
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
}

/** ServerPriceWithPKs */
export interface ServerPriceWithPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
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
  region: RegionBaseWithPKs;
  zone: ZoneBase;
  server: ServerWithScore;
}

/** ServerTableMetaData */
export interface ServerTableMetaData {
  table: NameAndDescription;
  /** Fields */
  fields: IdNameAndDescriptionAndCategory[];
}

/** ServerWithScore */
export interface ServerWithScore {
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
   * Cpu L1 Cache
   * L1 cache size (byte).
   */
  cpu_l1_cache?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (byte).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (byte).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu Flags
   * CPU features/flags.
   * @default []
   */
  cpu_flags?: string[];
  /**
   * Cpus
   * JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
   * @default []
   */
  cpus?: Cpu[];
  /**
   * Memory Amount
   * RAM amount (MiB).
   */
  memory_amount?: number;
  /** Generation of the DDR SDRAM, e.g. DDR4 or DDR5. */
  memory_generation?: DdrGeneration | null;
  /**
   * Memory Speed
   * DDR SDRAM clock rate (Mhz).
   */
  memory_speed?: number | null;
  /**
   * Memory Ecc
   * If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
   */
  memory_ecc?: boolean | null;
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
   * Gpu Family
   * The product family of the primary GPU accelerator, e.g. Turing.
   */
  gpu_family?: string | null;
  /**
   * Gpu Model
   * The model number of the primary GPU accelerator, e.g. Tesla T4.
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
  /** Score */
  score?: number | null;
  /** Price */
  price?: number | null;
  /** Min Price */
  min_price?: number | null;
  /** Min Price Spot */
  min_price_spot?: number | null;
  /** Min Price Ondemand */
  min_price_ondemand?: number | null;
  /** Score Per Price */
  score_per_price?: number | null;
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

/** StorageBase */
export interface StorageBase {
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

/** StoragePriceWithPKs */
export interface StoragePriceWithPKs {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
  /**
   * Storage Id
   * Reference to the Storage.
   */
  storage_id: string;
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
  region: RegionBaseWithPKs;
  vendor: VendorBase;
  storage: StorageBase;
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

/**
 * TrafficDirection
 * Direction of the network traffic.
 */
export enum TrafficDirection {
  Inbound = "inbound",
  Outbound = "outbound",
}

/** TrafficPriceWithPKsWithMonthlyTraffic */
export interface TrafficPriceWithPKsWithMonthlyTraffic {
  /**
   * Vendor Id
   * Reference to the Vendor.
   */
  vendor_id: string;
  /**
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
  /** Direction of the traffic: inbound or outbound. */
  direction: TrafficDirection;
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
  region: RegionBaseWithPKs;
  vendor: VendorBase;
  /** Price Monthly Traffic */
  price_monthly_traffic?: number | null;
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
  Azure = "azure",
  Gcp = "gcp",
  Hcloud = "hcloud",
}

/**
 * Zone
 * Availability zones of Regions.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     region_id (str): Reference to the Region.
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
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
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
   * Region Id
   * Reference to the Region.
   */
  region_id: string;
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

export type HealthcheckHealthcheckGetData = HealthcheckResponse;

/** Response Table Benchmark Table Benchmark Get */
export type TableBenchmarkTableBenchmarkGetData = Benchmark[];

/** Response Table Country Table Country Get */
export type TableCountryTableCountryGetData = Country[];

/** Response Table Compliance Frameworks Table Compliance Framework Get */
export type TableComplianceFrameworksTableComplianceFrameworkGetData = ComplianceFramework[];

/** Response Table Vendor Table Vendor Get */
export type TableVendorTableVendorGetData = Vendor[];

/** Response Table Region Table Region Get */
export type TableRegionTableRegionGetData = Region[];

/** Response Table Zone Table Zone Get */
export type TableZoneTableZoneGetData = Zone[];

/** Response Table Server Table Server Get */
export type TableServerTableServerGetData = Server[];

/** Response Table Storage Table Storage Get */
export type TableStorageTableStorageGetData = Storage[];

export type TableMetadataServerTableServerMetaGetData = ServerTableMetaData;

export type GetServerWithoutRelationsV2ServerVendorServerGetData = ServerBase;

export interface GetSimilarServersServerVendorServerSimilarServersByNumGetParams {
  /**
   * Benchmark Id
   * Benchmark id to use as the main score for the server.
   * @default "stress_ng:cpu_all"
   */
  benchmark_id?: string;
  /**
   * Benchmark Config
   * Benchmark id to use as the main score for the server.
   * @default ""
   */
  benchmark_config?: string;
  /**
   * Vendor
   * Vendor ID.
   */
  vendor: string;
  /**
   * Server
   * Server ID or API reference.
   */
  server: string;
  /**
   * By
   * Algorithm to look for similar servers.
   */
  by: "family" | "specs" | "score" | "score_per_price";
  /**
   * Num
   * Number of servers to get.
   * @max 100
   */
  num: number;
}

/** Response Get Similar Servers Server  Vendor   Server  Similar Servers  By   Num  Get */
export type GetSimilarServersServerVendorServerSimilarServersByNumGetData = ServerPKs[];

export interface GetServerPricesServerVendorServerPricesGetParams {
  /**
   * Currency
   * Currency used for prices.
   */
  currency?: string | null;
  /**
   * Vendor
   * A Vendor's ID.
   */
  vendor: string;
  /**
   * Server
   * A Server's ID or API reference.
   */
  server: string;
}

/** Response Get Server Prices Server  Vendor   Server  Prices Get */
export type GetServerPricesServerVendorServerPricesGetData = ServerPrice[];

/** Response Get Server Benchmarks Server  Vendor   Server  Benchmarks Get */
export type GetServerBenchmarksServerVendorServerBenchmarksGetData = BenchmarkScore[];

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

export interface AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Storage Price Filters Ai Assist Storage Price Filters Get */
export type AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData = object;

export interface AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Traffic Price Filters Ai Assist Traffic Price Filters Get */
export type AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetData = object;

export interface SearchRegionsRegionsGetParams {
  /**
   * Vendor id
   * Identifier of the cloud provider vendor.
   */
  vendor?: "aws" | "azure" | "gcp" | "hcloud";
}

/** Response Search Regions Regions Get */
export type SearchRegionsRegionsGetData = RegionPKs[];

export interface SearchServersServersGetParams {
  /**
   * Partial name or id
   * Freetext, case-insensitive search on the server_id, name, api_reference or display_name.
   */
  partial_name_or_id?: string | null;
  /**
   * Minimum vCPUs
   * Minimum number of virtual CPUs.
   * @min 1
   * @max 256
   * @default 1
   */
  vcpus_min?: number;
  /**
   * Maximum vCPUs
   * Maximum number of virtual CPUs.
   */
  vcpus_max?: number | null;
  /**
   * Processor architecture
   * Processor architecture.
   */
  architecture?: "arm64" | "arm64_mac" | "i386" | "x86_64" | "x86_64_mac";
  /** Processor manufacturer */
  cpu_manufacturer?: "AMD" | "AWS" | "Ampere" | "Apple" | "Intel" | "Microsoft";
  /** Processor family */
  cpu_family?: "ARM" | "ARMv8" | "Ampere Altra" | "EPYC" | "Xeon";
  /**
   * CPU allocation
   * Allocation of the CPU(s) to the server, e.g. shared, burstable or dedicated.
   */
  cpu_allocation?: "Shared" | "Burstable" | "Dedicated";
  /**
   * SCore
   * Minimum stress-ng div16 CPU workload score.
   */
  benchmark_score_stressng_cpu_min?: number | null;
  /**
   * $Core
   * Minimum stress-ng div16 CPU workload score per USD/hr.
   */
  benchmark_score_per_price_stressng_cpu_min?: number | null;
  /**
   * Minimum memory
   * Minimum amount of memory in GBs.
   */
  memory_min?: number | null;
  /**
   * Active only
   * Filter for active servers only.
   * @default true
   */
  only_active?: boolean | null;
  /**
   * Vendor id
   * Identifier of the cloud provider vendor.
   */
  vendor?: "aws" | "azure" | "gcp" | "hcloud";
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Storage Size
   * Minimum amount of storage (GBs).
   */
  storage_size?: number | null;
  /**
   * Storage Type
   * Type of the storage attached to the server.
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * GPU count
   * Minimum number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * Minimum GPU memory
   * Minimum amount of GPU memory (GB) in each GPU.
   */
  gpu_memory_min?: number | null;
  /**
   * Total GPU memory
   * Minimum amount of total GPU memory (GBs) in all GPUs.
   */
  gpu_memory_total?: number | null;
  /** GPU manufacturer */
  gpu_manufacturer?: "AMD" | "Habana" | "NVIDIA";
  /** GPU family */
  gpu_family?:
    | "Ada Lovelace"
    | "Ampere"
    | "Gaudi"
    | "Hopper"
    | "Kepler"
    | "Maxwell"
    | "Radeon Pro Navi"
    | "Turing"
    | "Volta";
  /** GPU model */
  gpu_model?:
    | "A100"
    | "A10G"
    | "H100"
    | "H200"
    | "HL-205"
    | "K80"
    | "L4"
    | "L40S"
    | "M60"
    | "T4"
    | "T4G"
    | "V100"
    | "V520";
  /**
   * Limit
   * Maximum number of results. Set to -1 for unlimited.
   * @default 25
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
   * Partial name or id
   * Freetext, case-insensitive search on the server_id, name, api_reference or display_name.
   */
  partial_name_or_id?: string | null;
  /**
   * Minimum vCPUs
   * Minimum number of virtual CPUs.
   * @min 1
   * @max 256
   * @default 1
   */
  vcpus_min?: number;
  /**
   * Maximum vCPUs
   * Maximum number of virtual CPUs.
   */
  vcpus_max?: number | null;
  /**
   * Processor architecture
   * Processor architecture.
   */
  architecture?: "arm64" | "arm64_mac" | "i386" | "x86_64" | "x86_64_mac";
  /** Processor manufacturer */
  cpu_manufacturer?: "AMD" | "AWS" | "Ampere" | "Apple" | "Intel" | "Microsoft";
  /** Processor family */
  cpu_family?: "ARM" | "ARMv8" | "Ampere Altra" | "EPYC" | "Xeon";
  /**
   * CPU allocation
   * Allocation of the CPU(s) to the server, e.g. shared, burstable or dedicated.
   */
  cpu_allocation?: "Shared" | "Burstable" | "Dedicated";
  /**
   * SCore
   * Minimum stress-ng div16 CPU workload score.
   */
  benchmark_score_stressng_cpu_min?: number | null;
  /**
   * $Core
   * Minimum stress-ng div16 CPU workload score per USD/hr.
   */
  benchmark_score_per_price_stressng_cpu_min?: number | null;
  /**
   * Minimum memory
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
   * Filter for active servers only.
   * @default true
   */
  only_active?: boolean | null;
  /**
   * Green energy
   * Filter for regions that are 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Allocation
   * Server allocation method.
   */
  allocation?: "ondemand" | "reserved" | "spot";
  /**
   * Vendor id
   * Identifier of the cloud provider vendor.
   */
  vendor?: "aws" | "azure" | "gcp" | "hcloud";
  /**
   * Region id
   * Identifier of the region.
   */
  regions?:
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
    | "7"
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
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "cn-north-1"
    | "cn-northwest-1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "il-central-1"
    | "israelcentral"
    | "italynorth"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "koreacentral"
    | "koreasouth"
    | "me-central-1"
    | "me-south-1"
    | "mexicocentral"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "polandcentral"
    | "qatarcentral"
    | "sa-east-1"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "uaecentral"
    | "uaenorth"
    | "uksouth"
    | "ukwest"
    | "us-east-1"
    | "us-east-2"
    | "us-west-1"
    | "us-west-2"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3";
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Storage Size
   * Minimum amount of storage (GBs).
   */
  storage_size?: number | null;
  /**
   * Storage Type
   * Type of the storage attached to the server.
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
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
    | "NO"
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
   * Minimum number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * Minimum GPU memory
   * Minimum amount of GPU memory (GB) in each GPU.
   */
  gpu_memory_min?: number | null;
  /**
   * Total GPU memory
   * Minimum amount of total GPU memory (GBs) in all GPUs.
   */
  gpu_memory_total?: number | null;
  /** GPU manufacturer */
  gpu_manufacturer?: "AMD" | "Habana" | "NVIDIA";
  /** GPU family */
  gpu_family?:
    | "Ada Lovelace"
    | "Ampere"
    | "Gaudi"
    | "Hopper"
    | "Kepler"
    | "Maxwell"
    | "Radeon Pro Navi"
    | "Turing"
    | "Volta";
  /** GPU model */
  gpu_model?:
    | "A100"
    | "A10G"
    | "H100"
    | "H200"
    | "HL-205"
    | "K80"
    | "L4"
    | "L40S"
    | "M60"
    | "T4"
    | "T4G"
    | "V100"
    | "V520";
  /**
   * Limit
   * Maximum number of results.
   * @max 250
   * @default 25
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
   * Order direction.
   * @default "asc"
   */
  order_dir?: OrderDir;
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string | null;
  /**
   * Add Total Count Header
   * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
   * @default false
   */
  add_total_count_header?: boolean;
}

/** Response Search Server Prices Server Prices Get */
export type SearchServerPricesServerPricesGetData = ServerPriceWithPKs[];

export interface SearchStoragePricesStoragePricesGetParams {
  /**
   * Vendor id
   * Identifier of the cloud provider vendor.
   */
  vendor?: "aws" | "azure" | "gcp" | "hcloud";
  /**
   * Green energy
   * Filter for regions that are 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Storage Size
   * Minimum amount of storage (GBs).
   */
  storage_min?: number | null;
  /**
   * Storage Type
   * Type of the storage attached to the server.
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Region id
   * Identifier of the region.
   */
  regions?:
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
    | "7"
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
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "cn-north-1"
    | "cn-northwest-1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "il-central-1"
    | "israelcentral"
    | "italynorth"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "koreacentral"
    | "koreasouth"
    | "me-central-1"
    | "me-south-1"
    | "mexicocentral"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "polandcentral"
    | "qatarcentral"
    | "sa-east-1"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "uaecentral"
    | "uaenorth"
    | "uksouth"
    | "ukwest"
    | "us-east-1"
    | "us-east-2"
    | "us-west-1"
    | "us-west-2"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
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
    | "NO"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TW"
    | "US"
    | "ZA";
  /**
   * Limit
   * Maximum number of results. Set to -1 for unlimited.
   * @default 10
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
   * Order direction.
   * @default "asc"
   */
  order_dir?: OrderDir;
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string | null;
  /**
   * Add Total Count Header
   * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
   * @default false
   */
  add_total_count_header?: boolean;
}

/** Response Search Storage Prices Storage Prices Get */
export type SearchStoragePricesStoragePricesGetData = StoragePriceWithPKs[];

export interface SearchTrafficPricesTrafficPricesGetParams {
  /**
   * Vendor id
   * Identifier of the cloud provider vendor.
   */
  vendor?: "aws" | "azure" | "gcp" | "hcloud";
  /**
   * Green energy
   * Filter for regions that are 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Compliance Framework id
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Region id
   * Identifier of the region.
   */
  regions?:
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
    | "7"
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
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "cn-north-1"
    | "cn-northwest-1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "il-central-1"
    | "israelcentral"
    | "italynorth"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "koreacentral"
    | "koreasouth"
    | "me-central-1"
    | "me-south-1"
    | "mexicocentral"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "polandcentral"
    | "qatarcentral"
    | "sa-east-1"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "uaecentral"
    | "uaenorth"
    | "uksouth"
    | "ukwest"
    | "us-east-1"
    | "us-east-2"
    | "us-west-1"
    | "us-west-2"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
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
    | "NO"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TW"
    | "US"
    | "ZA";
  /**
   * Direction
   * Direction of the Internet traffic.
   * @default ["outbound"]
   */
  direction?: "inbound" | "outbound";
  /**
   * Monthly Overall Traffic
   * Overall amount of monthly traffic (GBs).
   * @default 1
   */
  monthly_traffic?: number | null;
  /**
   * Limit
   * Maximum number of results. Set to -1 for unlimited.
   * @default 10
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
   * Order direction.
   * @default "asc"
   */
  order_dir?: OrderDir;
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string | null;
  /**
   * Add Total Count Header
   * Add the X-Total-Count header to the response with the overall number of items (without paging). Note that it might reduce response times.
   * @default false
   */
  add_total_count_header?: boolean;
}

/** Response Search Traffic Prices Traffic Prices Get */
export type SearchTrafficPricesTrafficPricesGetData = TrafficPriceWithPKsWithMonthlyTraffic[];
