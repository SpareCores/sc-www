export type SlotMachineVendorItem = {
  name: string;
  logo?: string | null;
  vendorId?: string;
};

export type SlotMachineServerItem = {
  name: string;
  architecture?: string;
  vendorId?: string;
  apiReference?: string;
};

export type SlotMachineRegionItem = {
  name: string;
  city?: string;
  vendorId?: string;
  regionId?: string;
};

export type SlotMachineContents = [
  SlotMachineVendorItem[],
  SlotMachineServerItem[],
  SlotMachineRegionItem[],
];

export type SlotMachineServerListingQuery = {
  vendor?: string;
  vendor_regions?: string;
  vcpus_min: number;
  memory_min: number;
};
