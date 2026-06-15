/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** Vendors */
export enum Vendors {
  Alicloud = "alicloud",
  Aws = "aws",
  Azure = "azure",
  Gcp = "gcp",
  Hcloud = "hcloud",
  Ovh = "ovh",
  Upcloud = "upcloud",
  Vultr = "vultr",
}

/** VendorRegions */
export enum VendorRegions {
  AlicloudApNortheast1 = "alicloud~ap-northeast-1",
  AlicloudApNortheast2 = "alicloud~ap-northeast-2",
  AlicloudApSoutheast1 = "alicloud~ap-southeast-1",
  AlicloudApSoutheast3 = "alicloud~ap-southeast-3",
  AlicloudApSoutheast5 = "alicloud~ap-southeast-5",
  AlicloudApSoutheast6 = "alicloud~ap-southeast-6",
  AlicloudApSoutheast7 = "alicloud~ap-southeast-7",
  AlicloudApSoutheast8 = "alicloud~ap-southeast-8",
  AlicloudCnBeijing = "alicloud~cn-beijing",
  AlicloudCnChengdu = "alicloud~cn-chengdu",
  AlicloudCnFuzhou = "alicloud~cn-fuzhou",
  AlicloudCnGuangzhou = "alicloud~cn-guangzhou",
  AlicloudCnHangzhou = "alicloud~cn-hangzhou",
  AlicloudCnHangzhouAcdrUt3 = "alicloud~cn-hangzhou-acdr-ut-3",
  AlicloudCnHeyuan = "alicloud~cn-heyuan",
  AlicloudCnHongkong = "alicloud~cn-hongkong",
  AlicloudCnHuhehaote = "alicloud~cn-huhehaote",
  AlicloudCnNanjing = "alicloud~cn-nanjing",
  AlicloudCnQingdao = "alicloud~cn-qingdao",
  AlicloudCnShanghai = "alicloud~cn-shanghai",
  AlicloudCnShenzhen = "alicloud~cn-shenzhen",
  AlicloudCnWuhanLr = "alicloud~cn-wuhan-lr",
  AlicloudCnWulanchabu = "alicloud~cn-wulanchabu",
  AlicloudCnZhangjiakou = "alicloud~cn-zhangjiakou",
  AlicloudCnZhongwei = "alicloud~cn-zhongwei",
  AlicloudEuCentral1 = "alicloud~eu-central-1",
  AlicloudEuWest1 = "alicloud~eu-west-1",
  AlicloudEuWest2 = "alicloud~eu-west-2",
  AlicloudMeCentral1 = "alicloud~me-central-1",
  AlicloudMeEast1 = "alicloud~me-east-1",
  AlicloudNaSouth1 = "alicloud~na-south-1",
  AlicloudUsEast1 = "alicloud~us-east-1",
  AlicloudUsWest1 = "alicloud~us-west-1",
  AwsAfSouth1 = "aws~af-south-1",
  AwsApEast1 = "aws~ap-east-1",
  AwsApEast2 = "aws~ap-east-2",
  AwsApNortheast1 = "aws~ap-northeast-1",
  AwsApNortheast2 = "aws~ap-northeast-2",
  AwsApNortheast3 = "aws~ap-northeast-3",
  AwsApSouth1 = "aws~ap-south-1",
  AwsApSouth2 = "aws~ap-south-2",
  AwsApSoutheast1 = "aws~ap-southeast-1",
  AwsApSoutheast2 = "aws~ap-southeast-2",
  AwsApSoutheast3 = "aws~ap-southeast-3",
  AwsApSoutheast4 = "aws~ap-southeast-4",
  AwsApSoutheast5 = "aws~ap-southeast-5",
  AwsApSoutheast6 = "aws~ap-southeast-6",
  AwsApSoutheast7 = "aws~ap-southeast-7",
  AwsCaCentral1 = "aws~ca-central-1",
  AwsCaWest1 = "aws~ca-west-1",
  AwsCnNorth1 = "aws~cn-north-1",
  AwsCnNorthwest1 = "aws~cn-northwest-1",
  AwsEuCentral1 = "aws~eu-central-1",
  AwsEuCentral2 = "aws~eu-central-2",
  AwsEuNorth1 = "aws~eu-north-1",
  AwsEuSouth1 = "aws~eu-south-1",
  AwsEuSouth2 = "aws~eu-south-2",
  AwsEuWest1 = "aws~eu-west-1",
  AwsEuWest2 = "aws~eu-west-2",
  AwsEuWest3 = "aws~eu-west-3",
  AwsIlCentral1 = "aws~il-central-1",
  AwsMeCentral1 = "aws~me-central-1",
  AwsMeSouth1 = "aws~me-south-1",
  AwsMxCentral1 = "aws~mx-central-1",
  AwsSaEast1 = "aws~sa-east-1",
  AwsUsEast1 = "aws~us-east-1",
  AwsUsEast2 = "aws~us-east-2",
  AwsUsWest1 = "aws~us-west-1",
  AwsUsWest2 = "aws~us-west-2",
  AzureAustraliacentral = "azure~australiacentral",
  AzureAustraliacentral2 = "azure~australiacentral2",
  AzureAustraliaeast = "azure~australiaeast",
  AzureAustraliasoutheast = "azure~australiasoutheast",
  AzureAustriaeast = "azure~austriaeast",
  AzureBelgiumcentral = "azure~belgiumcentral",
  AzureBrazilsouth = "azure~brazilsouth",
  AzureBrazilsoutheast = "azure~brazilsoutheast",
  AzureBrazilus = "azure~brazilus",
  AzureCanadacentral = "azure~canadacentral",
  AzureCanadaeast = "azure~canadaeast",
  AzureCentralindia = "azure~centralindia",
  AzureCentralus = "azure~centralus",
  AzureCentraluseuap = "azure~centraluseuap",
  AzureChilecentral = "azure~chilecentral",
  AzureDenmarkeast = "azure~denmarkeast",
  AzureEastasia = "azure~eastasia",
  AzureEastus = "azure~eastus",
  AzureEastus2 = "azure~eastus2",
  AzureEastus2Euap = "azure~eastus2euap",
  AzureEastusstg = "azure~eastusstg",
  AzureFrancecentral = "azure~francecentral",
  AzureFrancesouth = "azure~francesouth",
  AzureGermanynorth = "azure~germanynorth",
  AzureGermanywestcentral = "azure~germanywestcentral",
  AzureIndonesiacentral = "azure~indonesiacentral",
  AzureIsraelcentral = "azure~israelcentral",
  AzureItalynorth = "azure~italynorth",
  AzureJapaneast = "azure~japaneast",
  AzureJapanwest = "azure~japanwest",
  AzureJioindiacentral = "azure~jioindiacentral",
  AzureJioindiawest = "azure~jioindiawest",
  AzureKoreacentral = "azure~koreacentral",
  AzureKoreasouth = "azure~koreasouth",
  AzureMalaysiawest = "azure~malaysiawest",
  AzureMexicocentral = "azure~mexicocentral",
  AzureNewzealandnorth = "azure~newzealandnorth",
  AzureNorthcentralus = "azure~northcentralus",
  AzureNortheurope = "azure~northeurope",
  AzureNorwayeast = "azure~norwayeast",
  AzureNorwaywest = "azure~norwaywest",
  AzurePolandcentral = "azure~polandcentral",
  AzureQatarcentral = "azure~qatarcentral",
  AzureSouthafricanorth = "azure~southafricanorth",
  AzureSouthafricawest = "azure~southafricawest",
  AzureSouthcentralus = "azure~southcentralus",
  AzureSouthcentralusstg = "azure~southcentralusstg",
  AzureSoutheastasia = "azure~southeastasia",
  AzureSouthindia = "azure~southindia",
  AzureSpaincentral = "azure~spaincentral",
  AzureSwedencentral = "azure~swedencentral",
  AzureSwitzerlandnorth = "azure~switzerlandnorth",
  AzureSwitzerlandwest = "azure~switzerlandwest",
  AzureUaecentral = "azure~uaecentral",
  AzureUaenorth = "azure~uaenorth",
  AzureUksouth = "azure~uksouth",
  AzureUkwest = "azure~ukwest",
  AzureWestcentralus = "azure~westcentralus",
  AzureWesteurope = "azure~westeurope",
  AzureWestindia = "azure~westindia",
  AzureWestus = "azure~westus",
  AzureWestus2 = "azure~westus2",
  AzureWestus3 = "azure~westus3",
  Gcp1000 = "gcp~1000",
  Gcp1100 = "gcp~1100",
  Gcp1210 = "gcp~1210",
  Gcp1220 = "gcp~1220",
  Gcp1230 = "gcp~1230",
  Gcp1250 = "gcp~1250",
  Gcp1260 = "gcp~1260",
  Gcp1270 = "gcp~1270",
  Gcp1280 = "gcp~1280",
  Gcp1290 = "gcp~1290",
  Gcp1300 = "gcp~1300",
  Gcp1310 = "gcp~1310",
  Gcp1320 = "gcp~1320",
  Gcp1330 = "gcp~1330",
  Gcp1340 = "gcp~1340",
  Gcp1350 = "gcp~1350",
  Gcp1360 = "gcp~1360",
  Gcp1370 = "gcp~1370",
  Gcp1380 = "gcp~1380",
  Gcp1390 = "gcp~1390",
  Gcp1410 = "gcp~1410",
  Gcp1420 = "gcp~1420",
  Gcp1430 = "gcp~1430",
  Gcp1440 = "gcp~1440",
  Gcp1450 = "gcp~1450",
  Gcp1460 = "gcp~1460",
  Gcp1470 = "gcp~1470",
  Gcp1480 = "gcp~1480",
  Gcp1490 = "gcp~1490",
  Gcp1510 = "gcp~1510",
  Gcp1520 = "gcp~1520",
  Gcp1530 = "gcp~1530",
  Gcp1540 = "gcp~1540",
  Gcp1550 = "gcp~1550",
  Gcp1560 = "gcp~1560",
  Gcp1570 = "gcp~1570",
  Gcp1580 = "gcp~1580",
  Gcp1590 = "gcp~1590",
  Gcp1600 = "gcp~1600",
  Gcp1610 = "gcp~1610",
  Gcp1640 = "gcp~1640",
  Gcp1650 = "gcp~1650",
  Gcp1680 = "gcp~1680",
  Hcloud2 = "hcloud~2",
  Hcloud3 = "hcloud~3",
  Hcloud4 = "hcloud~4",
  Hcloud5 = "hcloud~5",
  Hcloud6 = "hcloud~6",
  Hcloud7 = "hcloud~7",
  OvhAPSOUTHMUM = "ovh~AP-SOUTH-MUM",
  OvhAPSOUTHMUM1 = "ovh~AP-SOUTH-MUM-1",
  OvhAPSOUTHEASTSYD = "ovh~AP-SOUTHEAST-SYD",
  OvhAPSOUTHEASTSYD2 = "ovh~AP-SOUTHEAST-SYD-2",
  OvhBHS = "ovh~BHS",
  OvhBHS5 = "ovh~BHS5",
  OvhCAEASTTOR = "ovh~CA-EAST-TOR",
  OvhDE = "ovh~DE",
  OvhDE1 = "ovh~DE1",
  OvhEUSOUTHMIL = "ovh~EU-SOUTH-MIL",
  OvhEUWESTPAR = "ovh~EU-WEST-PAR",
  OvhGRA = "ovh~GRA",
  OvhGRA11 = "ovh~GRA11",
  OvhGRA7 = "ovh~GRA7",
  OvhGRA9 = "ovh~GRA9",
  OvhRBX = "ovh~RBX",
  OvhRBXA = "ovh~RBX-A",
  OvhRBXARCHIVE = "ovh~RBX-ARCHIVE",
  OvhSBG = "ovh~SBG",
  OvhSBG5 = "ovh~SBG5",
  OvhSBG7 = "ovh~SBG7",
  OvhSGP = "ovh~SGP",
  OvhSGP1 = "ovh~SGP1",
  OvhSYD = "ovh~SYD",
  OvhSYD1 = "ovh~SYD1",
  OvhUK = "ovh~UK",
  OvhUK1 = "ovh~UK1",
  OvhWAW = "ovh~WAW",
  OvhWAW1 = "ovh~WAW1",
  UpcloudAuSyd1 = "upcloud~au-syd1",
  UpcloudDeFra1 = "upcloud~de-fra1",
  UpcloudDkCph1 = "upcloud~dk-cph1",
  UpcloudEsMad1 = "upcloud~es-mad1",
  UpcloudFiHel1 = "upcloud~fi-hel1",
  UpcloudFiHel2 = "upcloud~fi-hel2",
  UpcloudNlAms1 = "upcloud~nl-ams1",
  UpcloudNoSvg1 = "upcloud~no-svg1",
  UpcloudPlWaw1 = "upcloud~pl-waw1",
  UpcloudSeSto1 = "upcloud~se-sto1",
  UpcloudSgSin1 = "upcloud~sg-sin1",
  UpcloudUkLon1 = "upcloud~uk-lon1",
  UpcloudUsChi1 = "upcloud~us-chi1",
  UpcloudUsNyc1 = "upcloud~us-nyc1",
  UpcloudUsSjo1 = "upcloud~us-sjo1",
  VultrAms = "vultr~ams",
  VultrAtl = "vultr~atl",
  VultrBlr = "vultr~blr",
  VultrBom = "vultr~bom",
  VultrCdg = "vultr~cdg",
  VultrDel = "vultr~del",
  VultrDfw = "vultr~dfw",
  VultrEwr = "vultr~ewr",
  VultrFra = "vultr~fra",
  VultrHnl = "vultr~hnl",
  VultrIcn = "vultr~icn",
  VultrItm = "vultr~itm",
  VultrJnb = "vultr~jnb",
  VultrLax = "vultr~lax",
  VultrLhr = "vultr~lhr",
  VultrMad = "vultr~mad",
  VultrMan = "vultr~man",
  VultrMel = "vultr~mel",
  VultrMex = "vultr~mex",
  VultrMia = "vultr~mia",
  VultrMxp = "vultr~mxp",
  VultrNrt = "vultr~nrt",
  VultrOrd = "vultr~ord",
  VultrSao = "vultr~sao",
  VultrScl = "vultr~scl",
  VultrSea = "vultr~sea",
  VultrSgp = "vultr~sgp",
  VultrSjc = "vultr~sjc",
  VultrSto = "vultr~sto",
  VultrSyd = "vultr~syd",
  VultrTlv = "vultr~tlv",
  VultrWaw = "vultr~waw",
  VultrYto = "vultr~yto",
}

/**
 * TrafficDirection
 * Direction of the network traffic.
 */
export enum TrafficDirection {
  Inbound = "inbound",
  Outbound = "outbound",
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
 * Status
 * Last known status of a resource, e.g. active or inactive.
 */
export enum Status {
  Active = "active",
  Inactive = "inactive",
}

/** ServerColumns */
export enum ServerColumns {
  VendorId = "vendor_id",
  ServerId = "server_id",
  Name = "name",
  ApiReference = "api_reference",
  DisplayName = "display_name",
  Description = "description",
  Family = "family",
  Vcpus = "vcpus",
  Hypervisor = "hypervisor",
  CpuAllocation = "cpu_allocation",
  CpuCores = "cpu_cores",
  CpuSpeed = "cpu_speed",
  CpuArchitecture = "cpu_architecture",
  CpuManufacturer = "cpu_manufacturer",
  CpuFamily = "cpu_family",
  CpuModel = "cpu_model",
  CpuL1DCache = "cpu_l1d_cache",
  CpuL1DCacheTotal = "cpu_l1d_cache_total",
  CpuL1ICache = "cpu_l1i_cache",
  CpuL1ICacheTotal = "cpu_l1i_cache_total",
  CpuL2Cache = "cpu_l2_cache",
  CpuL2CacheTotal = "cpu_l2_cache_total",
  CpuL3Cache = "cpu_l3_cache",
  CpuL3CacheTotal = "cpu_l3_cache_total",
  CpuFlags = "cpu_flags",
  Cpus = "cpus",
  Ecpus = "ecpus",
  Scalability = "scalability",
  HwVirt = "hw_virt",
  MemoryAmount = "memory_amount",
  MemoryAmountActual = "memory_amount_actual",
  MemoryGeneration = "memory_generation",
  MemorySpeed = "memory_speed",
  MemoryEcc = "memory_ecc",
  GpuCount = "gpu_count",
  GpuMemoryMin = "gpu_memory_min",
  GpuMemoryTotal = "gpu_memory_total",
  GpuManufacturer = "gpu_manufacturer",
  GpuFamily = "gpu_family",
  GpuModel = "gpu_model",
  Gpus = "gpus",
  StorageSize = "storage_size",
  StorageType = "storage_type",
  Storages = "storages",
  NetworkSpeedBaseline = "network_speed_baseline",
  NetworkSpeedMax = "network_speed_max",
  NetworkStorageSpeedBaseline = "network_storage_speed_baseline",
  NetworkStorageSpeedMax = "network_storage_speed_max",
  InboundTraffic = "inbound_traffic",
  OutboundTraffic = "outbound_traffic",
  Ipv4 = "ipv4",
  AverageTimeToStart = "average_time_to_start",
  Status = "status",
  ObservedAt = "observed_at",
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
  Value1640 = "1640",
  Value1650 = "1650",
  Value1680 = "1680",
  Value2 = "2",
  Value3 = "3",
  Value4 = "4",
  Value5 = "5",
  Value6 = "6",
  Value7 = "7",
  AfSouth1 = "af-south-1",
  Ams = "ams",
  ApEast1 = "ap-east-1",
  ApEast2 = "ap-east-2",
  ApNortheast1 = "ap-northeast-1",
  ApNortheast2 = "ap-northeast-2",
  ApNortheast3 = "ap-northeast-3",
  ApSouth1 = "ap-south-1",
  ApSouth2 = "ap-south-2",
  ApSoutheast1 = "ap-southeast-1",
  ApSoutheast2 = "ap-southeast-2",
  ApSoutheast3 = "ap-southeast-3",
  ApSoutheast4 = "ap-southeast-4",
  ApSoutheast5 = "ap-southeast-5",
  ApSoutheast6 = "ap-southeast-6",
  ApSoutheast7 = "ap-southeast-7",
  ApSoutheast8 = "ap-southeast-8",
  APSOUTHEASTSYD = "AP-SOUTHEAST-SYD",
  APSOUTHEASTSYD2 = "AP-SOUTHEAST-SYD-2",
  APSOUTHMUM = "AP-SOUTH-MUM",
  APSOUTHMUM1 = "AP-SOUTH-MUM-1",
  Atl = "atl",
  Australiacentral = "australiacentral",
  Australiacentral2 = "australiacentral2",
  Australiaeast = "australiaeast",
  Australiasoutheast = "australiasoutheast",
  Austriaeast = "austriaeast",
  AuSyd1 = "au-syd1",
  Belgiumcentral = "belgiumcentral",
  BHS = "BHS",
  BHS5 = "BHS5",
  Blr = "blr",
  Bom = "bom",
  Brazilsouth = "brazilsouth",
  Brazilsoutheast = "brazilsoutheast",
  Brazilus = "brazilus",
  CaCentral1 = "ca-central-1",
  CAEASTTOR = "CA-EAST-TOR",
  Canadacentral = "canadacentral",
  Canadaeast = "canadaeast",
  CaWest1 = "ca-west-1",
  Cdg = "cdg",
  Centralindia = "centralindia",
  Centralus = "centralus",
  Centraluseuap = "centraluseuap",
  Chilecentral = "chilecentral",
  CnBeijing = "cn-beijing",
  CnChengdu = "cn-chengdu",
  CnFuzhou = "cn-fuzhou",
  CnGuangzhou = "cn-guangzhou",
  CnHangzhou = "cn-hangzhou",
  CnHangzhouAcdrUt3 = "cn-hangzhou-acdr-ut-3",
  CnHeyuan = "cn-heyuan",
  CnHongkong = "cn-hongkong",
  CnHuhehaote = "cn-huhehaote",
  CnNanjing = "cn-nanjing",
  CnNorth1 = "cn-north-1",
  CnNorthwest1 = "cn-northwest-1",
  CnQingdao = "cn-qingdao",
  CnShanghai = "cn-shanghai",
  CnShenzhen = "cn-shenzhen",
  CnWuhanLr = "cn-wuhan-lr",
  CnWulanchabu = "cn-wulanchabu",
  CnZhangjiakou = "cn-zhangjiakou",
  CnZhongwei = "cn-zhongwei",
  DE = "DE",
  DE1 = "DE1",
  DeFra1 = "de-fra1",
  Del = "del",
  Denmarkeast = "denmarkeast",
  Dfw = "dfw",
  DkCph1 = "dk-cph1",
  Eastasia = "eastasia",
  Eastus = "eastus",
  Eastus2 = "eastus2",
  Eastus2Euap = "eastus2euap",
  Eastusstg = "eastusstg",
  EsMad1 = "es-mad1",
  EuCentral1 = "eu-central-1",
  EuCentral2 = "eu-central-2",
  EuNorth1 = "eu-north-1",
  EuSouth1 = "eu-south-1",
  EuSouth2 = "eu-south-2",
  EUSOUTHMIL = "EU-SOUTH-MIL",
  EuWest1 = "eu-west-1",
  EuWest2 = "eu-west-2",
  EuWest3 = "eu-west-3",
  EUWESTPAR = "EU-WEST-PAR",
  Ewr = "ewr",
  FiHel1 = "fi-hel1",
  FiHel2 = "fi-hel2",
  Fra = "fra",
  Francecentral = "francecentral",
  Francesouth = "francesouth",
  Germanynorth = "germanynorth",
  Germanywestcentral = "germanywestcentral",
  GRA = "GRA",
  GRA11 = "GRA11",
  GRA7 = "GRA7",
  GRA9 = "GRA9",
  Hnl = "hnl",
  Icn = "icn",
  IlCentral1 = "il-central-1",
  Indonesiacentral = "indonesiacentral",
  Israelcentral = "israelcentral",
  Italynorth = "italynorth",
  Itm = "itm",
  Japaneast = "japaneast",
  Japanwest = "japanwest",
  Jioindiacentral = "jioindiacentral",
  Jioindiawest = "jioindiawest",
  Jnb = "jnb",
  Koreacentral = "koreacentral",
  Koreasouth = "koreasouth",
  Lax = "lax",
  Lhr = "lhr",
  Mad = "mad",
  Malaysiawest = "malaysiawest",
  Man = "man",
  MeCentral1 = "me-central-1",
  MeEast1 = "me-east-1",
  Mel = "mel",
  MeSouth1 = "me-south-1",
  Mex = "mex",
  Mexicocentral = "mexicocentral",
  Mia = "mia",
  MxCentral1 = "mx-central-1",
  Mxp = "mxp",
  NaSouth1 = "na-south-1",
  Newzealandnorth = "newzealandnorth",
  NlAms1 = "nl-ams1",
  Northcentralus = "northcentralus",
  Northeurope = "northeurope",
  Norwayeast = "norwayeast",
  Norwaywest = "norwaywest",
  NoSvg1 = "no-svg1",
  Nrt = "nrt",
  Ord = "ord",
  PlWaw1 = "pl-waw1",
  Polandcentral = "polandcentral",
  Qatarcentral = "qatarcentral",
  RBX = "RBX",
  RBXA = "RBX-A",
  RBXARCHIVE = "RBX-ARCHIVE",
  SaEast1 = "sa-east-1",
  Sao = "sao",
  SBG = "SBG",
  SBG5 = "SBG5",
  SBG7 = "SBG7",
  Scl = "scl",
  Sea = "sea",
  SeSto1 = "se-sto1",
  Sgp = "sgp",
  SGP = "SGP",
  SGP1 = "SGP1",
  SgSin1 = "sg-sin1",
  Sjc = "sjc",
  Southafricanorth = "southafricanorth",
  Southafricawest = "southafricawest",
  Southcentralus = "southcentralus",
  Southcentralusstg = "southcentralusstg",
  Southeastasia = "southeastasia",
  Southindia = "southindia",
  Spaincentral = "spaincentral",
  Sto = "sto",
  Swedencentral = "swedencentral",
  Switzerlandnorth = "switzerlandnorth",
  Switzerlandwest = "switzerlandwest",
  Syd = "syd",
  SYD = "SYD",
  SYD1 = "SYD1",
  Tlv = "tlv",
  Uaecentral = "uaecentral",
  Uaenorth = "uaenorth",
  UK = "UK",
  UK1 = "UK1",
  UkLon1 = "uk-lon1",
  Uksouth = "uksouth",
  Ukwest = "ukwest",
  UsChi1 = "us-chi1",
  UsEast1 = "us-east-1",
  UsEast2 = "us-east-2",
  UsNyc1 = "us-nyc1",
  UsSjo1 = "us-sjo1",
  UsWest1 = "us-west-1",
  UsWest2 = "us-west-2",
  Waw = "waw",
  WAW = "WAW",
  WAW1 = "WAW1",
  Westcentralus = "westcentralus",
  Westeurope = "westeurope",
  Westindia = "westindia",
  Westus = "westus",
  Westus2 = "westus2",
  Westus3 = "westus3",
  Yto = "yto",
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

/** OrderDir */
export enum OrderDir {
  Asc = "asc",
  Desc = "desc",
}

/** GpuModels */
export enum GpuModels {
  A10 = "A10",
  A100 = "A100",
  A100PCIE = "A100 PCIE",
  A100SXM = "A100 SXM",
  A10G = "A10G",
  A16 = "A16",
  A40 = "A40",
  B200 = "B200",
  B300 = "B300",
  G49 = "G49",
  G49E = "G49E",
  GH200 = "GH200",
  GPUH = "GPU H",
  H100 = "H100",
  H200 = "H200",
  HL205 = "HL-205",
  L20 = "L20",
  L20N = "L20N",
  L4 = "L4",
  L40S = "L40S",
  MI300X = "MI300X",
  MI325X = "MI325X",
  MI355X = "MI355X",
  P100 = "P100",
  P4 = "P4",
  RTX5000 = "RTX 5000",
  RTXPro6000 = "RTX Pro 6000",
  T4 = "T4",
  T4G = "T4G",
  V100 = "V100",
  V100S = "V100S",
  V520 = "V520",
  V620 = "V620",
  V710 = "V710",
  NvidiaGb200 = "nvidia-gb200",
  VGPU8 = "vGPU8",
}

/** GpuManufacturers */
export enum GpuManufacturers {
  AMD = "AMD",
  Habana = "Habana",
  NVIDIA = "NVIDIA",
}

/** GpuFamilies */
export enum GpuFamilies {
  AdaLovelace = "Ada Lovelace",
  Ampere = "Ampere",
  Blackwell = "Blackwell",
  CDNA3 = "CDNA3",
  CDNA4 = "CDNA4",
  Gaudi = "Gaudi",
  Hopper = "Hopper",
  Pascal = "Pascal",
  RadeonProNavi = "Radeon Pro Navi",
  Turing = "Turing",
  Volta = "Volta",
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

/** CpuManufacturers */
export enum CpuManufacturers {
  AMD = "AMD",
  AWS = "AWS",
  Alibaba = "Alibaba",
  Ampere = "Ampere",
  Apple = "Apple",
  Intel = "Intel",
  Microsoft = "Microsoft",
  NVIDIA = "NVIDIA",
}

/** CpuFamilies */
export enum CpuFamilies {
  ARM = "ARM",
  ARMv8 = "ARMv8",
  ARMv9 = "ARMv9",
  AmpereAltra = "Ampere Altra",
  EPYC = "EPYC",
  Grace = "Grace",
  Xeon = "Xeon",
  Yitian = "Yitian",
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
 * CpuAllocation
 * CPU allocation methods at cloud vendors.
 */
export enum CpuAllocation {
  Shared = "Shared",
  Burstable = "Burstable",
  Dedicated = "Dedicated",
}

/** Countries */
export enum Countries {
  AE = "AE",
  AT = "AT",
  AU = "AU",
  BE = "BE",
  BH = "BH",
  BR = "BR",
  CA = "CA",
  CH = "CH",
  CL = "CL",
  CN = "CN",
  DE = "DE",
  DK = "DK",
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
  MX = "MX",
  MY = "MY",
  NL = "NL",
  NO = "NO",
  NZ = "NZ",
  PH = "PH",
  PL = "PL",
  QA = "QA",
  SA = "SA",
  SE = "SE",
  SG = "SG",
  TH = "TH",
  TW = "TW",
  US = "US",
  ZA = "ZA",
}

/** ComplianceFrameworks */
export enum ComplianceFrameworks {
  Hipaa = "hipaa",
  Iso27001 = "iso27001",
  Soc2T2 = "soc2t2",
}

/**
 * BestPriceAllocation
 * Controls how the server's "best price" is computed: use only spot prices, only on-demand prices, or the lowest available price from any allocation type.
 */
export enum BestPriceAllocation {
  ANY = "ANY",
  SPOT_ONLY = "SPOT_ONLY",
  ONDEMAND_ONLY = "ONDEMAND_ONLY",
  MONTHLY = "MONTHLY",
}

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
 *     category (typing.Optional[str]): Category of the resource.
 *     name (str): Human-friendly name.
 *     description (typing.Optional[str]): Short description.
 *     framework (str): The name of the benchmark framework/software/tool used.
 *     config_fields (dict): A dictionary of descriptions on the framework-specific config options, e.g. {"bandwidth": "Memory amount to use for compression in MB."}.
 *     measurement (typing.Optional[str]): The name of measurement recorded in the benchmark.
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
   * Category
   * Category of the resource.
   */
  category: string | null;
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
  config_fields?: Record<string, any>;
  /**
   * Measurement
   * The name of measurement recorded in the benchmark.
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

/** BenchmarkConfig */
export interface BenchmarkConfig {
  /** Benchmark Id */
  benchmark_id: string;
  /** Config */
  config: string;
  /** Category */
  category?: string | null;
}

/**
 * BenchmarkHistogram
 * Histogram data for a benchmark score distribution.
 */
export interface BenchmarkHistogram {
  /**
   * Breakpoints
   * NUM_BINS + 1 boundary values defining the edges of each bucket
   */
  breakpoints: number[];
  /**
   * Counts
   * Number of scores falling in each bucket (length == len(breakpoints) - 1)
   */
  counts: number[];
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
 *     framework_version (typing.Optional[str]): The version of the benchmark tool used.
 *     kernel_version (typing.Optional[str]): The kernel version of the server when the benchmark was run.
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
  config?: Record<string, any>;
  /**
   * Framework Version
   * The version of the benchmark tool used.
   */
  framework_version?: string | null;
  /**
   * Kernel Version
   * The kernel version of the server when the benchmark was run.
   */
  kernel_version?: string | null;
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
 * BenchmarkScoreStatsItem
 * Aggregate statistics and score distribution for a single benchmark.
 */
export interface BenchmarkScoreStatsItem {
  /**
   * Benchmark Id
   * Unique identifier of the benchmark
   */
  benchmark_id: string;
  /**
   * Name
   * Human-friendly name of the benchmark
   */
  name: string;
  /**
   * Description
   * Short description of the benchmark
   */
  description?: string | null;
  /**
   * Framework
   * The benchmark framework/software/tool used
   */
  framework: string;
  /**
   * Measurement
   * Name of the measurement recorded
   */
  measurement?: string | null;
  /**
   * Unit
   * Optional unit of measurement for the score
   */
  unit?: string | null;
  /**
   * Higher Is Better
   * Whether a higher score indicates better performance
   */
  higher_is_better: boolean;
  /**
   * Status
   * Benchmark status (e.g., 'ACTIVE', 'INACTIVE')
   */
  status: string;
  /**
   * Configs
   * Benchmark config fields enriched with example values. Keys come from Benchmark.config_fields; each value includes the original description plus an 'examples' list of unique observed config values.
   */
  configs?: Record<string, any>;
  /**
   * Count
   * Total number of active, non-null benchmark score records
   */
  count: number;
  /**
   * Count Servers
   * Number of distinct (vendor_id, server_id) pairs with scores
   */
  count_servers: number;
  /** Score distribution histogram; None when no scores are available */
  histogram?: BenchmarkHistogram | null;
}

/**
 * ComplianceFramework
 * List of Compliance Frameworks, such as HIPAA or SOC 2 Type 1.
 *
 * Attributes:
 *     compliance_framework_id (str): Unique identifier.
 *     name (str): Human-friendly name.
 *     abbreviation (typing.Optional[str]): Short abbreviation of the Framework name.
 *     description (typing.Optional[str]): Description of the framework in a few paragraphs, outlining key features and characteristics for reference.
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
   * Description of the framework in a few paragraphs, outlining key features and characteristics for reference.
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
 * DebugInfoResponse
 * Complete debug information about server and benchmark data availability.
 */
export interface DebugInfoResponse {
  /**
   * Vendors
   * Per-vendor statistics about benchmark coverage
   */
  vendors: VendorDebugInfo[];
  /**
   * Servers
   * Detailed information about each server type
   */
  servers: ServerDebugInfo[];
  /**
   * Benchmark Families
   * List of all available benchmark families (e.g., 'stress_ng', 'geekbench', 'passmark')
   */
  benchmark_families: string[];
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
  /** Description */
  description?: string | null;
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

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthcheckResponse */
export interface HealthcheckResponse {
  /** Packages */
  packages: Record<string, any>;
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

/** PriceBreakdown */
export interface PriceBreakdown {
  /** Compute Min Price */
  compute_min_price?: number | null;
  /** Compute Min Price Spot */
  compute_min_price_spot?: number | null;
  /** Compute Min Price Ondemand */
  compute_min_price_ondemand?: number | null;
  /** Compute Min Price Ondemand Monthly */
  compute_min_price_ondemand_monthly?: number | null;
  /** Traffic Inbound Hourly */
  traffic_inbound_hourly?: number | null;
  /** Traffic Inbound Monthly */
  traffic_inbound_monthly?: number | null;
  /** Traffic Outbound Hourly */
  traffic_outbound_hourly?: number | null;
  /** Traffic Outbound Monthly */
  traffic_outbound_monthly?: number | null;
  /** Traffic Hourly */
  traffic_hourly?: number | null;
  /** Traffic Monthly */
  traffic_monthly?: number | null;
  /** Extra Storage Hourly */
  extra_storage_hourly?: number | null;
  /** Extra Storage Monthly */
  extra_storage_monthly?: number | null;
}

/**
 * PriceTier
 * Price tier definition.
 *
 * Infinite bounds (e.g. for an open-ended upper tier) are stored as
 * `float("inf")` in Python and automatically serialized to the
 * JSON-safe string `"Infinity"` on export. Both representations are
 * accepted as input: the model validator converts `"Infinity"` back
 * to `float("inf")` when loading from JSON.
 */
export interface PriceTier {
  /** Lower */
  lower: number;
  /** Upper */
  upper: number;
  /** Price */
  price: number;
}

/**
 * Region
 * Regions of Vendors.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     region_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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

/**
 * Server
 * Server types.
 *
 * Attributes:
 *     vendor_id (str): Reference to the Vendor.
 *     server_id (str): Unique identifier, as called at the Vendor.
 *     name (str): Human-friendly name.
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
 *     cpu_l1d_cache (typing.Optional[int]): L1 data cache size (KiB).
 *     cpu_l1d_cache_total (typing.Optional[int]): Total L1 data cache size (KiB) across all cores.
 *     cpu_l1i_cache (typing.Optional[int]): L1 instruction cache size (KiB).
 *     cpu_l1i_cache_total (typing.Optional[int]): Total L1 instruction cache size (KiB) across all cores.
 *     cpu_l2_cache (typing.Optional[int]): L2 cache size (KiB).
 *     cpu_l2_cache_total (typing.Optional[int]): Total L2 cache size (KiB) across all cores.
 *     cpu_l3_cache (typing.Optional[int]): L3 cache size (KiB).
 *     cpu_l3_cache_total (typing.Optional[int]): Total L3 cache size (KiB) across all cores.
 *     cpu_flags (typing.List[str]): CPU features/flags.
 *     cpus (typing.List[sc_crawler.table_fields.Cpu]): JSON array of known CPU details, e.g. the manufacturer, family, model; L1/L2/L3 cache size; microcode version; feature flags; bugs etc.
 *     ecpus (typing.Optional[float]): The effective "real-world" core count, calculated by dividing the maximum multi-core SCore by the single-core SCore.
 *     scalability (typing.Optional[float]): Measures how efficiently the server scales from a single core performance to using multiple cores. A score of 100% means perfect linear scaling with zero performance loss.
 *     hw_virt (typing.Optional[bool]): If hardware virtualization (e.g. KVM) is supported.
 *     memory_amount (int): RAM amount (MiB) reported by the vendor.
 *     memory_amount_actual (typing.Optional[int]): Actual RAM amount (MiB) measured on the instance via lstopo or other tool. This amount might not match the vendor-reported memory due to the BIOS or the hypervisor reserving a small percentage.
 *     memory_generation (typing.Optional[sc_crawler.table_fields.DdrGeneration]): Generation of the DDR SDRAM, e.g. DDR4 or DDR5.
 *     memory_speed (typing.Optional[int]): DDR SDRAM clock rate (Mhz).
 *     memory_ecc (typing.Optional[bool]): If the DDR SDRAM uses error correction code to detect and correct n-bit data corruption.
 *     gpu_count (float): Number of GPU accelerator(s).
 *     gpu_memory_min (typing.Optional[int]): Memory (MiB) allocated to the lowest-end GPU accelerator.
 *     gpu_memory_total (typing.Optional[int]): Overall memory (MiB) allocated to all the GPU accelerator(s).
 *     gpu_manufacturer (typing.Optional[str]): The manufacturer of the primary GPU accelerator, e.g. Nvidia or AMD.
 *     gpu_family (typing.Optional[str]): The product family of the primary GPU accelerator, e.g. Turing.
 *     gpu_model (typing.Optional[str]): The model number of the primary GPU accelerator, e.g. Tesla T4.
 *     gpus (typing.List[sc_crawler.table_fields.Gpu]): JSON array of GPU accelerator details, including the manufacturer, name, and memory (MiB) of each GPU.
 *     storage_size (int): Overall size (GB) of the disk(s).
 *     storage_type (typing.Optional[sc_crawler.table_fields.StorageType]): Primary disk type, e.g. HDD, SSD, NVMe SSD, or network).
 *     storages (typing.List[sc_crawler.table_fields.Disk]): JSON array of disks attached to the server, including the size (GB) and type of each disk.
 *     network_speed_baseline (typing.Optional[float]): The baseline network performance (Gbps) of the network card.
 *     network_speed_max (typing.Optional[float]): The maximum network performance (Gbps) of the network card.
 *     network_storage_speed_baseline (typing.Optional[float]): The baseline bandwidth performance of network-attached storage (Gbps).
 *     network_storage_speed_max (typing.Optional[float]): The maximum bandwidth performance of network-attached storage (Gbps).
 *     inbound_traffic (float): Amount of complimentary inbound traffic (GB) per month.
 *     outbound_traffic (float): Amount of complimentary outbound traffic (GB) per month.
 *     ipv4 (int): Number of complimentary IPv4 address(es).
 *     average_time_to_start (typing.Optional[float]): Average time to start the server (seconds).
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * Cpu L1D Cache
   * L1 data cache size (KiB).
   */
  cpu_l1d_cache?: number | null;
  /**
   * Cpu L1D Cache Total
   * Total L1 data cache size (KiB) across all cores.
   */
  cpu_l1d_cache_total?: number | null;
  /**
   * Cpu L1I Cache
   * L1 instruction cache size (KiB).
   */
  cpu_l1i_cache?: number | null;
  /**
   * Cpu L1I Cache Total
   * Total L1 instruction cache size (KiB) across all cores.
   */
  cpu_l1i_cache_total?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (KiB).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L2 Cache Total
   * Total L2 cache size (KiB) across all cores.
   */
  cpu_l2_cache_total?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (KiB).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu L3 Cache Total
   * Total L3 cache size (KiB) across all cores.
   */
  cpu_l3_cache_total?: number | null;
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
   * Ecpus
   * The effective "real-world" core count, calculated by dividing the maximum multi-core SCore by the single-core SCore.
   */
  ecpus?: number | null;
  /**
   * Scalability
   * Measures how efficiently the server scales from a single core performance to using multiple cores. A score of 100% means perfect linear scaling with zero performance loss.
   */
  scalability?: number | null;
  /**
   * Hw Virt
   * If hardware virtualization (e.g. KVM) is supported.
   */
  hw_virt?: boolean | null;
  /**
   * Memory Amount
   * RAM amount (MiB) reported by the vendor.
   */
  memory_amount?: number;
  /**
   * Memory Amount Actual
   * Actual RAM amount (MiB) measured on the instance via lstopo or other tool. This amount might not match the vendor-reported memory due to the BIOS or the hypervisor reserving a small percentage.
   */
  memory_amount_actual?: number | null;
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
   * JSON array of disks attached to the server, including the size (GB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed Baseline
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed_baseline?: number | null;
  /**
   * Network Speed Max
   * The maximum network performance (Gbps) of the network card.
   */
  network_speed_max?: number | null;
  /**
   * Network Storage Speed Baseline
   * The baseline bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_baseline?: number | null;
  /**
   * Network Storage Speed Max
   * The maximum bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_max?: number | null;
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
   * Average Time To Start
   * Average time to start the server (seconds).
   */
  average_time_to_start?: number | null;
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * Cpu L1D Cache
   * L1 data cache size (KiB).
   */
  cpu_l1d_cache?: number | null;
  /**
   * Cpu L1D Cache Total
   * Total L1 data cache size (KiB) across all cores.
   */
  cpu_l1d_cache_total?: number | null;
  /**
   * Cpu L1I Cache
   * L1 instruction cache size (KiB).
   */
  cpu_l1i_cache?: number | null;
  /**
   * Cpu L1I Cache Total
   * Total L1 instruction cache size (KiB) across all cores.
   */
  cpu_l1i_cache_total?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (KiB).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L2 Cache Total
   * Total L2 cache size (KiB) across all cores.
   */
  cpu_l2_cache_total?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (KiB).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu L3 Cache Total
   * Total L3 cache size (KiB) across all cores.
   */
  cpu_l3_cache_total?: number | null;
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
   * Ecpus
   * The effective "real-world" core count, calculated by dividing the maximum multi-core SCore by the single-core SCore.
   */
  ecpus?: number | null;
  /**
   * Scalability
   * Measures how efficiently the server scales from a single core performance to using multiple cores. A score of 100% means perfect linear scaling with zero performance loss.
   */
  scalability?: number | null;
  /**
   * Hw Virt
   * If hardware virtualization (e.g. KVM) is supported.
   */
  hw_virt?: boolean | null;
  /**
   * Memory Amount
   * RAM amount (MiB) reported by the vendor.
   */
  memory_amount?: number;
  /**
   * Memory Amount Actual
   * Actual RAM amount (MiB) measured on the instance via lstopo or other tool. This amount might not match the vendor-reported memory due to the BIOS or the hypervisor reserving a small percentage.
   */
  memory_amount_actual?: number | null;
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
   * JSON array of disks attached to the server, including the size (GB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed Baseline
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed_baseline?: number | null;
  /**
   * Network Speed Max
   * The maximum network performance (Gbps) of the network card.
   */
  network_speed_max?: number | null;
  /**
   * Network Storage Speed Baseline
   * The baseline bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_baseline?: number | null;
  /**
   * Network Storage Speed Max
   * The maximum bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_max?: number | null;
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
   * Average Time To Start
   * Average time to start the server (seconds).
   */
  average_time_to_start?: number | null;
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
 * ServerDebugInfo
 * Debug information about a single server type and its benchmark coverage.
 */
export interface ServerDebugInfo {
  /**
   * Vendor Id
   * Vendor identifier
   */
  vendor_id: string;
  /**
   * Server Id
   * Server type identifier
   */
  server_id: string;
  /**
   * Api Reference
   * API reference name for the server
   */
  api_reference: string;
  /**
   * Status
   * Server status (e.g., 'ACTIVE', 'INACTIVE')
   */
  status: string;
  /**
   * Has Hw Info
   * Whether hardware information (e.g. CPU flags) is available
   */
  has_hw_info: boolean;
  /**
   * Has Price
   * Whether any pricing data is available
   */
  has_price: boolean;
  /**
   * Has Benchmarks
   * Whether any benchmark data is available
   */
  has_benchmarks: boolean;
  /**
   * Benchmarks
   * Map of benchmark family names to availability (true if at least one score exists)
   */
  benchmarks: Record<string, boolean>;
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * Cpu L1D Cache
   * L1 data cache size (KiB).
   */
  cpu_l1d_cache?: number | null;
  /**
   * Cpu L1D Cache Total
   * Total L1 data cache size (KiB) across all cores.
   */
  cpu_l1d_cache_total?: number | null;
  /**
   * Cpu L1I Cache
   * L1 instruction cache size (KiB).
   */
  cpu_l1i_cache?: number | null;
  /**
   * Cpu L1I Cache Total
   * Total L1 instruction cache size (KiB) across all cores.
   */
  cpu_l1i_cache_total?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (KiB).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L2 Cache Total
   * Total L2 cache size (KiB) across all cores.
   */
  cpu_l2_cache_total?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (KiB).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu L3 Cache Total
   * Total L3 cache size (KiB) across all cores.
   */
  cpu_l3_cache_total?: number | null;
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
   * Ecpus
   * The effective "real-world" core count, calculated by dividing the maximum multi-core SCore by the single-core SCore.
   */
  ecpus?: number | null;
  /**
   * Scalability
   * Measures how efficiently the server scales from a single core performance to using multiple cores. A score of 100% means perfect linear scaling with zero performance loss.
   */
  scalability?: number | null;
  /**
   * Hw Virt
   * If hardware virtualization (e.g. KVM) is supported.
   */
  hw_virt?: boolean | null;
  /**
   * Memory Amount
   * RAM amount (MiB) reported by the vendor.
   */
  memory_amount?: number;
  /**
   * Memory Amount Actual
   * Actual RAM amount (MiB) measured on the instance via lstopo or other tool. This amount might not match the vendor-reported memory due to the BIOS or the hypervisor reserving a small percentage.
   */
  memory_amount_actual?: number | null;
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
   * JSON array of disks attached to the server, including the size (GB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed Baseline
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed_baseline?: number | null;
  /**
   * Network Speed Max
   * The maximum network performance (Gbps) of the network card.
   */
  network_speed_max?: number | null;
  /**
   * Network Storage Speed Baseline
   * The baseline bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_baseline?: number | null;
  /**
   * Network Storage Speed Max
   * The maximum bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_max?: number | null;
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
   * Average Time To Start
   * Average time to start the server (seconds).
   */
  average_time_to_start?: number | null;
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
  /** Min Price Ondemand Monthly */
  min_price_ondemand_monthly?: number | null;
  /** Score Per Price */
  score_per_price?: number | null;
  /** Selected Benchmark Score */
  selected_benchmark_score?: number | null;
  /** Selected Benchmark Score Per Price */
  selected_benchmark_score_per_price?: number | null;
  vendor: VendorBase;
  /** @default {} */
  price_breakdown?: PriceBreakdown;
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
  /** Price Monthly */
  price_monthly?: number | null;
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * Cpu L1D Cache
   * L1 data cache size (KiB).
   */
  cpu_l1d_cache?: number | null;
  /**
   * Cpu L1D Cache Total
   * Total L1 data cache size (KiB) across all cores.
   */
  cpu_l1d_cache_total?: number | null;
  /**
   * Cpu L1I Cache
   * L1 instruction cache size (KiB).
   */
  cpu_l1i_cache?: number | null;
  /**
   * Cpu L1I Cache Total
   * Total L1 instruction cache size (KiB) across all cores.
   */
  cpu_l1i_cache_total?: number | null;
  /**
   * Cpu L2 Cache
   * L2 cache size (KiB).
   */
  cpu_l2_cache?: number | null;
  /**
   * Cpu L2 Cache Total
   * Total L2 cache size (KiB) across all cores.
   */
  cpu_l2_cache_total?: number | null;
  /**
   * Cpu L3 Cache
   * L3 cache size (KiB).
   */
  cpu_l3_cache?: number | null;
  /**
   * Cpu L3 Cache Total
   * Total L3 cache size (KiB) across all cores.
   */
  cpu_l3_cache_total?: number | null;
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
   * Ecpus
   * The effective "real-world" core count, calculated by dividing the maximum multi-core SCore by the single-core SCore.
   */
  ecpus?: number | null;
  /**
   * Scalability
   * Measures how efficiently the server scales from a single core performance to using multiple cores. A score of 100% means perfect linear scaling with zero performance loss.
   */
  scalability?: number | null;
  /**
   * Hw Virt
   * If hardware virtualization (e.g. KVM) is supported.
   */
  hw_virt?: boolean | null;
  /**
   * Memory Amount
   * RAM amount (MiB) reported by the vendor.
   */
  memory_amount?: number;
  /**
   * Memory Amount Actual
   * Actual RAM amount (MiB) measured on the instance via lstopo or other tool. This amount might not match the vendor-reported memory due to the BIOS or the hypervisor reserving a small percentage.
   */
  memory_amount_actual?: number | null;
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
   * JSON array of disks attached to the server, including the size (GB) and type of each disk.
   * @default []
   */
  storages?: Disk[];
  /**
   * Network Speed Baseline
   * The baseline network performance (Gbps) of the network card.
   */
  network_speed_baseline?: number | null;
  /**
   * Network Speed Max
   * The maximum network performance (Gbps) of the network card.
   */
  network_speed_max?: number | null;
  /**
   * Network Storage Speed Baseline
   * The baseline bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_baseline?: number | null;
  /**
   * Network Storage Speed Max
   * The maximum bandwidth performance of network-attached storage (Gbps).
   */
  network_storage_speed_max?: number | null;
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
   * Average Time To Start
   * Average time to start the server (seconds).
   */
  average_time_to_start?: number | null;
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
  /** Min Price Ondemand Monthly */
  min_price_ondemand_monthly?: number | null;
  /** Score Per Price */
  score_per_price?: number | null;
  /** Selected Benchmark Score */
  selected_benchmark_score?: number | null;
  /** Selected Benchmark Score Per Price */
  selected_benchmark_score_per_price?: number | null;
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
 *     max_throughput (typing.Optional[int]): Maximum Throughput (MB/s).
 *     min_size (typing.Optional[int]): Minimum required size (GB).
 *     max_size (typing.Optional[int]): Maximum possible size (GB).
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
   * Maximum Throughput (MB/s).
   */
  max_throughput?: number | null;
  /**
   * Min Size
   * Minimum required size (GB).
   */
  min_size?: number | null;
  /**
   * Max Size
   * Maximum possible size (GB).
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
   * Maximum Throughput (MB/s).
   */
  max_throughput?: number | null;
  /**
   * Min Size
   * Minimum required size (GB).
   */
  min_size?: number | null;
  /**
   * Max Size
   * Maximum possible size (GB).
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

/**
 * User
 * User object extracted from OAuth 2.0 token introspection.
 */
export interface User {
  /** User Id */
  user_id: string;
  /** Api Credits Per Minute */
  api_credits_per_minute?: number | null;
  [key: string]: any;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
  /** Input */
  input?: any;
  /** Context */
  ctx?: object;
}

/**
 * Vendor
 * Compute resource vendors, such as cloud and server providers.
 *
 * Examples:
 *     >>> from sc_crawler.tables import Vendor
 *     >>> from sc_crawler.lookup import countries
 *     >>> aws = Vendor(vendor_id='aws', name='Amazon Web Services', homepage='https://aws.amazon.com', country=countries["US"], founding_year=2002)
 *     >>> aws
 *     Vendor(vendor_id='aws'...
 *     >>> from sc_crawler import vendors
 *     >>> vendors.aws
 *     Vendor(vendor_id='aws'...
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
 *     founding_year (int): 4-digit year when the public cloud service of the Vendor was launched.
 *     status_page (typing.Optional[str]): Public status page of the Vendor.
 *     stopped_server_charged (typing.Optional[bool]): If the Vendor charges for stopped servers. In case it depends on the instance type or different versions of stopped states, this field reports the worst case.
 *     billing_increment_seconds (typing.Optional[int]): The smallest increment of time for which the Vendor bills for.
 *     minimum_billing_seconds (typing.Optional[int]): The minimum amount of time for which the Vendor bills for. In case it depends on the instance type or other context, this field reports the worst case.
 *     billing_comment (typing.Optional[str]): Comment on the Vendor's billing.
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
   * 4-digit year when the public cloud service of the Vendor was launched.
   */
  founding_year: number;
  /**
   * Status Page
   * Public status page of the Vendor.
   */
  status_page?: string | null;
  /**
   * Stopped Server Charged
   * If the Vendor charges for stopped servers. In case it depends on the instance type or different versions of stopped states, this field reports the worst case.
   */
  stopped_server_charged?: boolean | null;
  /**
   * Billing Increment Seconds
   * The smallest increment of time for which the Vendor bills for.
   */
  billing_increment_seconds?: number | null;
  /**
   * Minimum Billing Seconds
   * The minimum amount of time for which the Vendor bills for. In case it depends on the instance type or other context, this field reports the worst case.
   */
  minimum_billing_seconds?: number | null;
  /**
   * Billing Comment
   * Comment on the Vendor's billing.
   */
  billing_comment?: string | null;
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
   * 4-digit year when the public cloud service of the Vendor was launched.
   */
  founding_year: number;
  /**
   * Status Page
   * Public status page of the Vendor.
   */
  status_page?: string | null;
  /**
   * Stopped Server Charged
   * If the Vendor charges for stopped servers. In case it depends on the instance type or different versions of stopped states, this field reports the worst case.
   */
  stopped_server_charged?: boolean | null;
  /**
   * Billing Increment Seconds
   * The smallest increment of time for which the Vendor bills for.
   */
  billing_increment_seconds?: number | null;
  /**
   * Minimum Billing Seconds
   * The minimum amount of time for which the Vendor bills for. In case it depends on the instance type or other context, this field reports the worst case.
   */
  minimum_billing_seconds?: number | null;
  /**
   * Billing Comment
   * Comment on the Vendor's billing.
   */
  billing_comment?: string | null;
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
 * VendorDebugInfo
 * Statistics about benchmark coverage for a specific vendor.
 */
export interface VendorDebugInfo {
  /**
   * Vendor Id
   * Vendor identifier (e.g., 'aws', 'gcp')
   */
  vendor_id: string;
  /**
   * All
   * Total number of server types for this vendor
   */
  all: number;
  /**
   * Active
   * Number of active server types
   */
  active: number;
  /**
   * Evaluated
   * Number of servers with at least one benchmark score
   */
  evaluated: number;
  /**
   * Missing
   * Number of active servers with prices but no benchmark data
   */
  missing: number;
  /**
   * Inactive
   * Number of servers without prices or with inactive status
   */
  inactive: number;
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
 *     api_reference (str): How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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
   * How this resource is referenced in the vendor API calls. This is usually either the id or name of the resource, depending on the vendor and actual API endpoint.
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

export type MeMeGetData = User;

export interface GetStatsStatsGetParams {
  /**
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Active only
   * Filter for active servers only.
   * @default false
   */
  only_active?: boolean | null;
}

/** Response Get Stats Stats Get */
export type GetStatsStatsGetData = Record<string, any>;

export type GetDebugInfoDebugGetData = DebugInfoResponse;

/** Response Get Benchmark Score Stats Benchmark Score Stats Get */
export type GetBenchmarkScoreStatsBenchmarkScoreStatsGetData =
  BenchmarkScoreStatsItem[];

/** Response Table Benchmark Table Benchmark Get */
export type TableBenchmarkTableBenchmarkGetData = Benchmark[];

/** Response Table Country Table Country Get */
export type TableCountryTableCountryGetData = Country[];

/** Response Table Compliance Frameworks Table Compliance Framework Get */
export type TableComplianceFrameworksTableComplianceFrameworkGetData =
  ComplianceFramework[];

/** Response Table Vendor Table Vendor Get */
export type TableVendorTableVendorGetData = Vendor[];

/** Response Table Region Table Region Get */
export type TableRegionTableRegionGetData = Region[];

/** Response Table Zone Table Zone Get */
export type TableZoneTableZoneGetData = Zone[];

/** Response Table Server Table Server Get */
export type TableServerTableServerGetData = Server[];

export interface TableServerSelectTableServerSelectGetParams {
  /**
   * Server columns
   * Selected server columns.
   */
  columns?:
    | "vendor_id"
    | "server_id"
    | "name"
    | "api_reference"
    | "display_name"
    | "description"
    | "family"
    | "vcpus"
    | "hypervisor"
    | "cpu_allocation"
    | "cpu_cores"
    | "cpu_speed"
    | "cpu_architecture"
    | "cpu_manufacturer"
    | "cpu_family"
    | "cpu_model"
    | "cpu_l1d_cache"
    | "cpu_l1d_cache_total"
    | "cpu_l1i_cache"
    | "cpu_l1i_cache_total"
    | "cpu_l2_cache"
    | "cpu_l2_cache_total"
    | "cpu_l3_cache"
    | "cpu_l3_cache_total"
    | "cpu_flags"
    | "cpus"
    | "ecpus"
    | "scalability"
    | "hw_virt"
    | "memory_amount"
    | "memory_amount_actual"
    | "memory_generation"
    | "memory_speed"
    | "memory_ecc"
    | "gpu_count"
    | "gpu_memory_min"
    | "gpu_memory_total"
    | "gpu_manufacturer"
    | "gpu_family"
    | "gpu_model"
    | "gpus"
    | "storage_size"
    | "storage_type"
    | "storages"
    | "network_speed_baseline"
    | "network_speed_max"
    | "network_storage_speed_baseline"
    | "network_storage_speed_max"
    | "inbound_traffic"
    | "outbound_traffic"
    | "ipv4"
    | "average_time_to_start"
    | "status"
    | "observed_at";
}

/** Response Table Server Select Table Server Select Get */
export type TableServerSelectTableServerSelectGetData = Record<string, any>[];

export interface TableServerPricesTableServerPricesGetParams {
  /**
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Region
   * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
   */
  region?:
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Allocation
   * Server allocation method.
   */
  allocation?: "ondemand" | "reserved" | "spot";
  /**
   * Active only
   * Filter for active servers only.
   * @default true
   */
  only_active?: boolean | null;
  /**
   * Currency
   * Currency used for prices.
   */
  currency?: string | null;
}

/** Response Table Server Prices Table Server Prices Get */
export type TableServerPricesTableServerPricesGetData = ServerPrice[];

/** Response Table Storage Table Storage Get */
export type TableStorageTableStorageGetData = Storage[];

export type TableMetadataServerTableServerMetaGetData = ServerTableMetaData;

export interface GetServerWithoutRelationsV2ServerVendorServerGetParams {
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

export type GetServerWithoutRelationsV2ServerVendorServerGetData = ServerBase;

export interface GetSimilarServersServerVendorServerSimilarServersByNumGetParams {
  /**
   * Server region
   * Region of the baseline server, used for score_per_price ordering to find servers with a similar score_per_price.
   */
  server_region?:
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
    | "TW"
    | "US"
    | "ZA";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Best price allocation strategy
   * Controls how the server's "best price" is computed: use only spot prices, only on-demand prices, or the lowest available price from any allocation type.
   * @default "ANY"
   */
  best_price_allocation?: "ANY" | "SPOT_ONLY" | "ONDEMAND_ONLY" | "MONTHLY";
  /**
   * Benchmark Id
   * Benchmark id to use as the main score for the server.
   */
  benchmark_id?: string;
  /**
   * Benchmark Config
   * Optional benchmark config dict JSON to filter results of a benchmark_id.
   */
  benchmark_config?: string | null;
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string | null;
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
  by:
    | "family"
    | "specs"
    | "score"
    | "score_per_price"
    | "benchmark_score"
    | "benchmark_score_per_price";
  /**
   * Num
   * Number of servers to get.
   * @max 100
   */
  num: number;
}

/** Response Get Similar Servers Server  Vendor   Server  Similar Servers  By   Num  Get */
export type GetSimilarServersServerVendorServerSimilarServersByNumGetData =
  ServerPKs[];

export interface GetServerPricesServerVendorServerPricesGetParams {
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
    | "TW"
    | "US"
    | "ZA";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
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

export interface GetServerBenchmarksServerVendorServerBenchmarksGetParams {
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

/** Response Get Server Benchmarks Server  Vendor   Server  Benchmarks Get */
export type GetServerBenchmarksServerVendorServerBenchmarksGetData =
  BenchmarkScore[];

export interface AssistServerFiltersAiAssistServerFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Server Filters Ai Assist Server Filters Get */
export type AssistServerFiltersAiAssistServerFiltersGetData = Record<
  string,
  any
>;

export interface AssistServerPriceFiltersAiAssistServerPriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Server Price Filters Ai Assist Server Price Filters Get */
export type AssistServerPriceFiltersAiAssistServerPriceFiltersGetData = Record<
  string,
  any
>;

export interface AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Storage Price Filters Ai Assist Storage Price Filters Get */
export type AssistStoragePriceFiltersAiAssistStoragePriceFiltersGetData =
  Record<string, any>;

export interface AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetParams {
  /** Text */
  text: string;
}

/** Response Assist Traffic Price Filters Ai Assist Traffic Price Filters Get */
export type AssistTrafficPriceFiltersAiAssistTrafficPriceFiltersGetData =
  Record<string, any>;

export interface SearchRegionsRegionsGetParams {
  /**
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
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
  cpu_manufacturer?:
    | "AMD"
    | "AWS"
    | "Alibaba"
    | "Ampere"
    | "Apple"
    | "Intel"
    | "Microsoft"
    | "NVIDIA";
  /** Processor family */
  cpu_family?:
    | "ARM"
    | "ARMv8"
    | "ARMv9"
    | "Ampere Altra"
    | "EPYC"
    | "Grace"
    | "Xeon"
    | "Yitian";
  /**
   * CPU allocation
   * Allocation of the CPU(s) to the server, e.g. shared, burstable or dedicated.
   */
  cpu_allocation?: "Shared" | "Burstable" | "Dedicated";
  /**
   * Required CPU speed
   * Required CPU speed in GHz.
   */
  cpu_speed_min?: 1 | 1.5 | 2 | 2.5 | 3 | 3.5 | 4 | 4.5 | 5;
  /**
   * Required L1 data cache size
   * Required L1 data cache size in KiBs.
   */
  cpu_l1d_cache_min?: 32 | 48 | 64 | 128;
  /**
   * Required L1 data cache size across all cores
   * Required L1 data cache size across all cores in KiBs.
   */
  cpu_l1d_cache_total_min?:
    | 32
    | 64
    | 128
    | 192
    | 256
    | 384
    | 512
    | 768
    | 1024
    | 1536
    | 2048
    | 3072
    | 4096
    | 6144
    | 12288;
  /**
   * Required L1 instruction cache size
   * Required L1 instruction cache size in KiBs.
   */
  cpu_l1i_cache_min?: 32 | 48 | 64 | 128;
  /**
   * Required L1 instruction cache size across all cores
   * Required L1 instruction cache size across all cores in KiBs.
   */
  cpu_l1i_cache_total_min?:
    | 32
    | 64
    | 128
    | 192
    | 256
    | 384
    | 512
    | 768
    | 1024
    | 1536
    | 2048
    | 3072
    | 4096
    | 6144
    | 12288;
  /**
   * Required L2 cache size
   * Required L2 cache size in KiBs.
   */
  cpu_l2_cache_min?: 256 | 512 | 1024 | 2048 | 4096;
  /**
   * Required L2 cache size across all cores
   * Required L2 cache size across all cores in KiBs.
   */
  cpu_l2_cache_total_min?:
    | 256
    | 512
    | 1024
    | 2048
    | 4096
    | 8192
    | 16384
    | 24576
    | 32768
    | 49152
    | 65536
    | 98304
    | 131072
    | 196608
    | 393216;
  /**
   * Required L3 cache size
   * Required L3 cache size in MiBs.
   */
  cpu_l3_cache_min?: 4 | 8 | 16 | 32 | 48 | 64 | 128 | 256 | 480;
  /**
   * Required L3 cache size across all cores
   * Required L3 cache size across all cores in MiBs.
   */
  cpu_l3_cache_total_min?:
    | 8
    | 16
    | 32
    | 48
    | 64
    | 96
    | 128
    | 192
    | 256
    | 480
    | 1024
    | 2048
    | 4096;
  /**
   * Hardware virtualization
   * Filter for servers with hardware virtualization.
   */
  hw_virt?: boolean | null;
  /**
   * Required SCore
   * Required stress-ng div16 CPU workload score.
   */
  benchmark_score_stressng_cpu_min?: number | null;
  /**
   * Required $Core
   * Required stress-ng div16 CPU workload score per USD/hr (using the best ondemand or spot price of all zones).
   */
  benchmark_score_per_price_stressng_cpu_min?: number | null;
  /**
   * Benchmark Id
   * Benchmark id to use as the main score for the server.
   */
  benchmark_id?: string;
  /**
   * Benchmark Config
   * Optional benchmark config dict JSON to filter results of a benchmark_id.
   */
  benchmark_config?: string | null;
  /**
   * Required benchmark score
   * Required value of the selected benchmark score.
   */
  benchmark_score_min?: number | null;
  /**
   * Required benchmark score/price
   * Required value of the selected benchmark score per USD/hr (using the best ondemand or spot price of all zones).
   */
  benchmark_score_per_price_min?: number | null;
  /**
   * Required memory
   * Required amount of memory in GBs.
   */
  memory_min?: number | null;
  /**
   * Required baseline network speed
   * Required baseline network speed in Gbps.
   */
  network_speed_baseline_min?:
    | 0.01
    | 0.05
    | 0.1
    | 0.5
    | 1
    | 5
    | 10
    | 25
    | 50
    | 100
    | 500
    | 1000
    | 10000
    | 25000;
  /**
   * Required maximum network speed
   * Required maximum network speed in Gbps.
   */
  network_speed_max_min?:
    | 0.01
    | 0.05
    | 0.1
    | 0.5
    | 1
    | 5
    | 10
    | 25
    | 50
    | 100
    | 500
    | 1000
    | 10000
    | 25000;
  /**
   * Active only
   * Filter for active servers only.
   * @default true
   */
  only_active?: boolean | null;
  /**
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Compliance framework
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Region
   * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
    | "TW"
    | "US"
    | "ZA";
  /**
   * Required local storage size
   * Required amount of built-in local (SSD, HDD, NVMe) server storage in GBs.
   */
  storage_size?: number | null;
  /**
   * Local storage type
   * Storage type of the server's built-in local storage (e.g. HDD, SSD, NVMe).
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Required baseline network storage speed
   * Required baseline network storage speed in Gbps.
   */
  network_storage_speed_baseline_min?:
    | 0.01
    | 0.05
    | 0.1
    | 0.2
    | 0.5
    | 0.75
    | 1
    | 2
    | 5
    | 10
    | 15
    | 20
    | 25
    | 50
    | 75
    | 100
    | 150
    | 300;
  /**
   * Required maximum network storage speed
   * Required maximum network storage speed in Gbps.
   */
  network_storage_speed_max_min?:
    | 0.01
    | 0.05
    | 0.1
    | 0.2
    | 0.5
    | 0.75
    | 1
    | 2
    | 5
    | 10
    | 15
    | 20
    | 25
    | 50
    | 75
    | 100
    | 150
    | 300;
  /**
   * Monthly inbound traffic
   * Monthly inbound traffic in GBs to add to the total price. The cheapest available inbound traffic price for the vendor is used.
   * @default 0
   */
  monthly_inbound_traffic?: number | null;
  /**
   * Monthly outbound traffic
   * Monthly outbound traffic in GBs to add to the total price. The cheapest available outbound traffic price for the vendor is used.
   * @default 0
   */
  monthly_outbound_traffic?: number | null;
  /**
   * Required storage size
   * Total storage needed in GBs, combining local (where applicable) and ondemand network storage. The server's built-in storage is subtracted from this amount, and only the difference is priced as additional external storage. Servers whose built-in storage already meets or exceeds this value incur no extra storage cost.
   * @default 0
   */
  extra_storage_size?: number | null;
  /**
   * Required storage type
   * Storage product type (e.g. HDD, SSD, NVMe) for the required storage price lookup. When omitted, the cheapest available type (usually HDD over network) is used.
   */
  extra_storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * GPU count
   * Required number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * Required GPU memory
   * Required amount of GPU memory (GB) in each GPU.
   */
  gpu_memory_min?: number | null;
  /**
   * Total GPU memory
   * Required amount of total GPU memory (GBs) in all GPUs.
   */
  gpu_memory_total?: number | null;
  /** GPU manufacturer */
  gpu_manufacturer?: "AMD" | "Habana" | "NVIDIA";
  /** GPU family */
  gpu_family?:
    | "Ada Lovelace"
    | "Ampere"
    | "Blackwell"
    | "CDNA3"
    | "CDNA4"
    | "Gaudi"
    | "Hopper"
    | "Pascal"
    | "Radeon Pro Navi"
    | "Turing"
    | "Volta";
  /** GPU model */
  gpu_model?:
    | "A10"
    | "A100"
    | "A100 PCIE"
    | "A100 SXM"
    | "A10G"
    | "A16"
    | "A40"
    | "B200"
    | "B300"
    | "G49"
    | "G49E"
    | "GH200"
    | "GPU H"
    | "H100"
    | "H200"
    | "HL-205"
    | "L20"
    | "L20N"
    | "L4"
    | "L40S"
    | "MI300X"
    | "MI325X"
    | "MI355X"
    | "P100"
    | "P4"
    | "RTX 5000"
    | "RTX Pro 6000"
    | "T4"
    | "T4G"
    | "V100"
    | "V100S"
    | "V520"
    | "V620"
    | "V710"
    | "nvidia-gb200"
    | "vGPU8";
  /**
   * Currency
   * Currency used for prices.
   * @default "USD"
   */
  currency?: string | null;
  /**
   * Best price allocation strategy
   * Controls how the server's "best price" is computed: use only spot prices, only on-demand prices, or the lowest available price from any allocation type.
   * @default "ANY"
   */
  best_price_allocation?: "ANY" | "SPOT_ONLY" | "ONDEMAND_ONLY" | "MONTHLY";
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
   * @default "min_price"
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
  cpu_manufacturer?:
    | "AMD"
    | "AWS"
    | "Alibaba"
    | "Ampere"
    | "Apple"
    | "Intel"
    | "Microsoft"
    | "NVIDIA";
  /** Processor family */
  cpu_family?:
    | "ARM"
    | "ARMv8"
    | "ARMv9"
    | "Ampere Altra"
    | "EPYC"
    | "Grace"
    | "Xeon"
    | "Yitian";
  /**
   * CPU allocation
   * Allocation of the CPU(s) to the server, e.g. shared, burstable or dedicated.
   */
  cpu_allocation?: "Shared" | "Burstable" | "Dedicated";
  /**
   * Hardware virtualization
   * Filter for servers with hardware virtualization.
   */
  hw_virt?: boolean | null;
  /**
   * Required SCore
   * Required stress-ng div16 CPU workload score.
   */
  benchmark_score_stressng_cpu_min?: number | null;
  /**
   * Required $Core
   * Required stress-ng div16 CPU workload score per USD/hr (using the best ondemand or spot price of all zones).
   */
  benchmark_score_per_price_stressng_cpu_min?: number | null;
  /**
   * Required memory
   * Required amount of memory in GBs.
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
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Region
   * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Compliance framework
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Required local storage size
   * Required amount of built-in local (SSD, HDD, NVMe) server storage in GBs.
   */
  storage_size?: number | null;
  /**
   * Local storage type
   * Storage type of the server's built-in local storage (e.g. HDD, SSD, NVMe).
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
    | "TW"
    | "US"
    | "ZA";
  /**
   * GPU count
   * Required number of GPUs.
   */
  gpu_min?: number | null;
  /**
   * Required GPU memory
   * Required amount of GPU memory (GB) in each GPU.
   */
  gpu_memory_min?: number | null;
  /**
   * Total GPU memory
   * Required amount of total GPU memory (GBs) in all GPUs.
   */
  gpu_memory_total?: number | null;
  /** GPU manufacturer */
  gpu_manufacturer?: "AMD" | "Habana" | "NVIDIA";
  /** GPU family */
  gpu_family?:
    | "Ada Lovelace"
    | "Ampere"
    | "Blackwell"
    | "CDNA3"
    | "CDNA4"
    | "Gaudi"
    | "Hopper"
    | "Pascal"
    | "Radeon Pro Navi"
    | "Turing"
    | "Volta";
  /** GPU model */
  gpu_model?:
    | "A10"
    | "A100"
    | "A100 PCIE"
    | "A100 SXM"
    | "A10G"
    | "A16"
    | "A40"
    | "B200"
    | "B300"
    | "G49"
    | "G49E"
    | "GH200"
    | "GPU H"
    | "H100"
    | "H200"
    | "HL-205"
    | "L20"
    | "L20N"
    | "L4"
    | "L40S"
    | "MI300X"
    | "MI325X"
    | "MI355X"
    | "P100"
    | "P4"
    | "RTX 5000"
    | "RTX Pro 6000"
    | "T4"
    | "T4G"
    | "V100"
    | "V100S"
    | "V520"
    | "V620"
    | "V710"
    | "nvidia-gb200"
    | "vGPU8";
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
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Green energy
   * Filter for regions that are 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Required local storage size
   * Required amount of built-in local (SSD, HDD, NVMe) server storage in GBs.
   */
  storage_min?: number | null;
  /**
   * Local storage type
   * Storage type of the server's built-in local storage (e.g. HDD, SSD, NVMe).
   */
  storage_type?: "hdd" | "ssd" | "nvme ssd" | "network";
  /**
   * Compliance framework
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Region
   * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
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
   * Vendor
   * Identifier of the cloud provider vendor.
   */
  vendor?:
    | "alicloud"
    | "aws"
    | "azure"
    | "gcp"
    | "hcloud"
    | "ovh"
    | "upcloud"
    | "vultr";
  /**
   * Green energy
   * Filter for regions that are 100% powered by renewable energy.
   */
  green_energy?: boolean | null;
  /**
   * Compliance framework
   * Compliance framework implemented at the vendor.
   */
  compliance_framework?: "hipaa" | "iso27001" | "soc2t2";
  /**
   * Region
   * Identifier of the region. Note that region ids are not vendor-specific, so when you select a region, you might get results from multiple vendors. For more precise filtering, use vendor_regions instead.
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
    | "1640"
    | "1650"
    | "1680"
    | "2"
    | "3"
    | "4"
    | "5"
    | "6"
    | "7"
    | "af-south-1"
    | "ams"
    | "ap-east-1"
    | "ap-east-2"
    | "ap-northeast-1"
    | "ap-northeast-2"
    | "ap-northeast-3"
    | "ap-south-1"
    | "ap-south-2"
    | "ap-southeast-1"
    | "ap-southeast-2"
    | "ap-southeast-3"
    | "ap-southeast-4"
    | "ap-southeast-5"
    | "ap-southeast-6"
    | "ap-southeast-7"
    | "ap-southeast-8"
    | "AP-SOUTHEAST-SYD"
    | "AP-SOUTHEAST-SYD-2"
    | "AP-SOUTH-MUM"
    | "AP-SOUTH-MUM-1"
    | "atl"
    | "australiacentral"
    | "australiacentral2"
    | "australiaeast"
    | "australiasoutheast"
    | "austriaeast"
    | "au-syd1"
    | "belgiumcentral"
    | "BHS"
    | "BHS5"
    | "blr"
    | "bom"
    | "brazilsouth"
    | "brazilsoutheast"
    | "brazilus"
    | "ca-central-1"
    | "CA-EAST-TOR"
    | "canadacentral"
    | "canadaeast"
    | "ca-west-1"
    | "cdg"
    | "centralindia"
    | "centralus"
    | "centraluseuap"
    | "chilecentral"
    | "cn-beijing"
    | "cn-chengdu"
    | "cn-fuzhou"
    | "cn-guangzhou"
    | "cn-hangzhou"
    | "cn-hangzhou-acdr-ut-3"
    | "cn-heyuan"
    | "cn-hongkong"
    | "cn-huhehaote"
    | "cn-nanjing"
    | "cn-north-1"
    | "cn-northwest-1"
    | "cn-qingdao"
    | "cn-shanghai"
    | "cn-shenzhen"
    | "cn-wuhan-lr"
    | "cn-wulanchabu"
    | "cn-zhangjiakou"
    | "cn-zhongwei"
    | "DE"
    | "DE1"
    | "de-fra1"
    | "del"
    | "denmarkeast"
    | "dfw"
    | "dk-cph1"
    | "eastasia"
    | "eastus"
    | "eastus2"
    | "eastus2euap"
    | "eastusstg"
    | "es-mad1"
    | "eu-central-1"
    | "eu-central-2"
    | "eu-north-1"
    | "eu-south-1"
    | "eu-south-2"
    | "EU-SOUTH-MIL"
    | "eu-west-1"
    | "eu-west-2"
    | "eu-west-3"
    | "EU-WEST-PAR"
    | "ewr"
    | "fi-hel1"
    | "fi-hel2"
    | "fra"
    | "francecentral"
    | "francesouth"
    | "germanynorth"
    | "germanywestcentral"
    | "GRA"
    | "GRA11"
    | "GRA7"
    | "GRA9"
    | "hnl"
    | "icn"
    | "il-central-1"
    | "indonesiacentral"
    | "israelcentral"
    | "italynorth"
    | "itm"
    | "japaneast"
    | "japanwest"
    | "jioindiacentral"
    | "jioindiawest"
    | "jnb"
    | "koreacentral"
    | "koreasouth"
    | "lax"
    | "lhr"
    | "mad"
    | "malaysiawest"
    | "man"
    | "me-central-1"
    | "me-east-1"
    | "mel"
    | "me-south-1"
    | "mex"
    | "mexicocentral"
    | "mia"
    | "mx-central-1"
    | "mxp"
    | "na-south-1"
    | "newzealandnorth"
    | "nl-ams1"
    | "northcentralus"
    | "northeurope"
    | "norwayeast"
    | "norwaywest"
    | "no-svg1"
    | "nrt"
    | "ord"
    | "pl-waw1"
    | "polandcentral"
    | "qatarcentral"
    | "RBX"
    | "RBX-A"
    | "RBX-ARCHIVE"
    | "sa-east-1"
    | "sao"
    | "SBG"
    | "SBG5"
    | "SBG7"
    | "scl"
    | "sea"
    | "se-sto1"
    | "sgp"
    | "SGP"
    | "SGP1"
    | "sg-sin1"
    | "sjc"
    | "southafricanorth"
    | "southafricawest"
    | "southcentralus"
    | "southcentralusstg"
    | "southeastasia"
    | "southindia"
    | "spaincentral"
    | "sto"
    | "swedencentral"
    | "switzerlandnorth"
    | "switzerlandwest"
    | "syd"
    | "SYD"
    | "SYD1"
    | "tlv"
    | "uaecentral"
    | "uaenorth"
    | "UK"
    | "UK1"
    | "uk-lon1"
    | "uksouth"
    | "ukwest"
    | "us-chi1"
    | "us-east-1"
    | "us-east-2"
    | "us-nyc1"
    | "us-sjo1"
    | "us-west-1"
    | "us-west-2"
    | "waw"
    | "WAW"
    | "WAW1"
    | "westcentralus"
    | "westeurope"
    | "westindia"
    | "westus"
    | "westus2"
    | "westus3"
    | "yto";
  /**
   * Vendor and region
   * Identifier of the vendor and region, separated by a tilde.
   */
  vendor_regions?:
    | "alicloud~ap-northeast-1"
    | "alicloud~ap-northeast-2"
    | "alicloud~ap-southeast-1"
    | "alicloud~ap-southeast-3"
    | "alicloud~ap-southeast-5"
    | "alicloud~ap-southeast-6"
    | "alicloud~ap-southeast-7"
    | "alicloud~ap-southeast-8"
    | "alicloud~cn-beijing"
    | "alicloud~cn-chengdu"
    | "alicloud~cn-fuzhou"
    | "alicloud~cn-guangzhou"
    | "alicloud~cn-hangzhou"
    | "alicloud~cn-hangzhou-acdr-ut-3"
    | "alicloud~cn-heyuan"
    | "alicloud~cn-hongkong"
    | "alicloud~cn-huhehaote"
    | "alicloud~cn-nanjing"
    | "alicloud~cn-qingdao"
    | "alicloud~cn-shanghai"
    | "alicloud~cn-shenzhen"
    | "alicloud~cn-wuhan-lr"
    | "alicloud~cn-wulanchabu"
    | "alicloud~cn-zhangjiakou"
    | "alicloud~cn-zhongwei"
    | "alicloud~eu-central-1"
    | "alicloud~eu-west-1"
    | "alicloud~eu-west-2"
    | "alicloud~me-central-1"
    | "alicloud~me-east-1"
    | "alicloud~na-south-1"
    | "alicloud~us-east-1"
    | "alicloud~us-west-1"
    | "aws~af-south-1"
    | "aws~ap-east-1"
    | "aws~ap-east-2"
    | "aws~ap-northeast-1"
    | "aws~ap-northeast-2"
    | "aws~ap-northeast-3"
    | "aws~ap-south-1"
    | "aws~ap-south-2"
    | "aws~ap-southeast-1"
    | "aws~ap-southeast-2"
    | "aws~ap-southeast-3"
    | "aws~ap-southeast-4"
    | "aws~ap-southeast-5"
    | "aws~ap-southeast-6"
    | "aws~ap-southeast-7"
    | "aws~ca-central-1"
    | "aws~ca-west-1"
    | "aws~cn-north-1"
    | "aws~cn-northwest-1"
    | "aws~eu-central-1"
    | "aws~eu-central-2"
    | "aws~eu-north-1"
    | "aws~eu-south-1"
    | "aws~eu-south-2"
    | "aws~eu-west-1"
    | "aws~eu-west-2"
    | "aws~eu-west-3"
    | "aws~il-central-1"
    | "aws~me-central-1"
    | "aws~me-south-1"
    | "aws~mx-central-1"
    | "aws~sa-east-1"
    | "aws~us-east-1"
    | "aws~us-east-2"
    | "aws~us-west-1"
    | "aws~us-west-2"
    | "azure~australiacentral"
    | "azure~australiacentral2"
    | "azure~australiaeast"
    | "azure~australiasoutheast"
    | "azure~austriaeast"
    | "azure~belgiumcentral"
    | "azure~brazilsouth"
    | "azure~brazilsoutheast"
    | "azure~brazilus"
    | "azure~canadacentral"
    | "azure~canadaeast"
    | "azure~centralindia"
    | "azure~centralus"
    | "azure~centraluseuap"
    | "azure~chilecentral"
    | "azure~denmarkeast"
    | "azure~eastasia"
    | "azure~eastus"
    | "azure~eastus2"
    | "azure~eastus2euap"
    | "azure~eastusstg"
    | "azure~francecentral"
    | "azure~francesouth"
    | "azure~germanynorth"
    | "azure~germanywestcentral"
    | "azure~indonesiacentral"
    | "azure~israelcentral"
    | "azure~italynorth"
    | "azure~japaneast"
    | "azure~japanwest"
    | "azure~jioindiacentral"
    | "azure~jioindiawest"
    | "azure~koreacentral"
    | "azure~koreasouth"
    | "azure~malaysiawest"
    | "azure~mexicocentral"
    | "azure~newzealandnorth"
    | "azure~northcentralus"
    | "azure~northeurope"
    | "azure~norwayeast"
    | "azure~norwaywest"
    | "azure~polandcentral"
    | "azure~qatarcentral"
    | "azure~southafricanorth"
    | "azure~southafricawest"
    | "azure~southcentralus"
    | "azure~southcentralusstg"
    | "azure~southeastasia"
    | "azure~southindia"
    | "azure~spaincentral"
    | "azure~swedencentral"
    | "azure~switzerlandnorth"
    | "azure~switzerlandwest"
    | "azure~uaecentral"
    | "azure~uaenorth"
    | "azure~uksouth"
    | "azure~ukwest"
    | "azure~westcentralus"
    | "azure~westeurope"
    | "azure~westindia"
    | "azure~westus"
    | "azure~westus2"
    | "azure~westus3"
    | "gcp~1000"
    | "gcp~1100"
    | "gcp~1210"
    | "gcp~1220"
    | "gcp~1230"
    | "gcp~1250"
    | "gcp~1260"
    | "gcp~1270"
    | "gcp~1280"
    | "gcp~1290"
    | "gcp~1300"
    | "gcp~1310"
    | "gcp~1320"
    | "gcp~1330"
    | "gcp~1340"
    | "gcp~1350"
    | "gcp~1360"
    | "gcp~1370"
    | "gcp~1380"
    | "gcp~1390"
    | "gcp~1410"
    | "gcp~1420"
    | "gcp~1430"
    | "gcp~1440"
    | "gcp~1450"
    | "gcp~1460"
    | "gcp~1470"
    | "gcp~1480"
    | "gcp~1490"
    | "gcp~1510"
    | "gcp~1520"
    | "gcp~1530"
    | "gcp~1540"
    | "gcp~1550"
    | "gcp~1560"
    | "gcp~1570"
    | "gcp~1580"
    | "gcp~1590"
    | "gcp~1600"
    | "gcp~1610"
    | "gcp~1640"
    | "gcp~1650"
    | "gcp~1680"
    | "hcloud~2"
    | "hcloud~3"
    | "hcloud~4"
    | "hcloud~5"
    | "hcloud~6"
    | "hcloud~7"
    | "ovh~AP-SOUTH-MUM"
    | "ovh~AP-SOUTH-MUM-1"
    | "ovh~AP-SOUTHEAST-SYD"
    | "ovh~AP-SOUTHEAST-SYD-2"
    | "ovh~BHS"
    | "ovh~BHS5"
    | "ovh~CA-EAST-TOR"
    | "ovh~DE"
    | "ovh~DE1"
    | "ovh~EU-SOUTH-MIL"
    | "ovh~EU-WEST-PAR"
    | "ovh~GRA"
    | "ovh~GRA11"
    | "ovh~GRA7"
    | "ovh~GRA9"
    | "ovh~RBX"
    | "ovh~RBX-A"
    | "ovh~RBX-ARCHIVE"
    | "ovh~SBG"
    | "ovh~SBG5"
    | "ovh~SBG7"
    | "ovh~SGP"
    | "ovh~SGP1"
    | "ovh~SYD"
    | "ovh~SYD1"
    | "ovh~UK"
    | "ovh~UK1"
    | "ovh~WAW"
    | "ovh~WAW1"
    | "upcloud~au-syd1"
    | "upcloud~de-fra1"
    | "upcloud~dk-cph1"
    | "upcloud~es-mad1"
    | "upcloud~fi-hel1"
    | "upcloud~fi-hel2"
    | "upcloud~nl-ams1"
    | "upcloud~no-svg1"
    | "upcloud~pl-waw1"
    | "upcloud~se-sto1"
    | "upcloud~sg-sin1"
    | "upcloud~uk-lon1"
    | "upcloud~us-chi1"
    | "upcloud~us-nyc1"
    | "upcloud~us-sjo1"
    | "vultr~ams"
    | "vultr~atl"
    | "vultr~blr"
    | "vultr~bom"
    | "vultr~cdg"
    | "vultr~del"
    | "vultr~dfw"
    | "vultr~ewr"
    | "vultr~fra"
    | "vultr~hnl"
    | "vultr~icn"
    | "vultr~itm"
    | "vultr~jnb"
    | "vultr~lax"
    | "vultr~lhr"
    | "vultr~mad"
    | "vultr~man"
    | "vultr~mel"
    | "vultr~mex"
    | "vultr~mia"
    | "vultr~mxp"
    | "vultr~nrt"
    | "vultr~ord"
    | "vultr~sao"
    | "vultr~scl"
    | "vultr~sea"
    | "vultr~sgp"
    | "vultr~sjc"
    | "vultr~sto"
    | "vultr~syd"
    | "vultr~tlv"
    | "vultr~waw"
    | "vultr~yto";
  /**
   * Countries
   * Filter for regions in the provided list of countries.
   */
  countries?:
    | "AE"
    | "AT"
    | "AU"
    | "BE"
    | "BH"
    | "BR"
    | "CA"
    | "CH"
    | "CL"
    | "CN"
    | "DE"
    | "DK"
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
    | "MX"
    | "MY"
    | "NL"
    | "NO"
    | "NZ"
    | "PH"
    | "PL"
    | "QA"
    | "SA"
    | "SE"
    | "SG"
    | "TH"
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
   * Monthly overall traffic
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
export type SearchTrafficPricesTrafficPricesGetData =
  TrafficPriceWithPKsWithMonthlyTraffic[];

/** Response Search Benchmark Configs Benchmark Configs Get */
export type SearchBenchmarkConfigsBenchmarkConfigsGetData = BenchmarkConfig[];
