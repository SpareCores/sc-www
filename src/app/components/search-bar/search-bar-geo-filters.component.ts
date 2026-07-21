import { Component, input, output } from "@angular/core";
import { FormsModule } from "@angular/forms";
import {
  LucideChevronDown,
  LucideDynamicIcon,
  LucideInfo,
  LucideLeaf,
} from "@lucide/angular";
import { CountryIdtoNamePipe } from "../../pipes/country-idto-name.pipe";
import { BenchmarkIconPipe } from "../../pipes/benchmark-icon.pipe";
import type {
  ContinentMetadata,
  CountryMetadata,
  RegionMetadata,
  SearchBarParameter,
  SearchBarParameterType,
  SearchBarTooltipEvent,
  VendorMetadata,
} from "./search-bar.types";
import { getParameterType } from "./search-bar.utils";

@Component({
  selector: "app-search-bar-geo-filters",
  imports: [
    FormsModule,
    LucideChevronDown,
    LucideDynamicIcon,
    LucideInfo,
    LucideLeaf,
    CountryIdtoNamePipe,
    BenchmarkIconPipe,
  ],
  templateUrl: "./search-bar-geo-filters.component.html",
})
export class SearchBarGeoFiltersComponent {
  parameter = input.required<SearchBarParameter>();
  filterCategoryId = input.required<string>();
  showParameterTitles = input(true);
  countryMetadata = input<CountryMetadata[]>([]);
  continentMetadata = input<ContinentMetadata[]>([]);
  regionMetadata = input<RegionMetadata[]>([]);
  vendorMetadata = input<VendorMetadata[]>([]);
  isAuthenticated = input(true);
  disabled = input(false);
  vendorRegionCollapsedVendors = input<Record<string, boolean>>({});
  maxVendorRegions = input(3);

  countryMetadataChanged = output<CountryMetadata[]>();
  continentMetadataChanged = output<ContinentMetadata[]>();
  vendorRegionCollapsedVendorsChanged = output<Record<string, boolean>>();
  valueChanged = output<void>();
  filterServers = output<void>();
  showTooltip = output<SearchBarTooltipEvent>();
  hideTooltip = output<void>();

  getParameterType(parameter: SearchBarParameter): SearchBarParameterType {
    return getParameterType(parameter);
  }

  countriesByContinent(continent: string): CountryMetadata[] {
    return this.countryMetadata().filter(
      (country) => country.continent === continent,
    );
  }

  isCountryCheckboxDisabled(country: CountryMetadata): boolean {
    if (this.isAuthenticated()) {
      return false;
    }

    return !country.selected && this.selectedCountriesCount() >= 1;
  }

  isContinentCheckboxDisabled(continent: ContinentMetadata): boolean {
    if (this.disabled()) {
      return true;
    }

    if (this.isAuthenticated()) {
      return false;
    }

    return !continent.selected && this.selectedCountriesCount() >= 1;
  }

  selectContinent(continent: ContinentMetadata) {
    const countries = this.countryMetadata();
    const shouldSelect = !continent.selected;
    const maxCountries = this.isAuthenticated() ? Infinity : 1;
    let nextCountries: CountryMetadata[];

    if (!shouldSelect) {
      nextCountries = countries.map((country) =>
        country.continent === continent.continent
          ? { ...country, selected: false }
          : country,
      );
    } else {
      let remainingSlots = maxCountries - this.selectedCountriesCount();

      if (remainingSlots <= 0) {
        return;
      }

      nextCountries = countries.map((country) => {
        if (country.continent !== continent.continent || country.selected) {
          return country;
        }

        if (remainingSlots > 0) {
          remainingSlots--;
          return { ...country, selected: true };
        }

        return country;
      });
    }

    this.emitCountryState(nextCountries);
    this.valueChanged.emit();
  }

  toggleCountry(country: CountryMetadata) {
    if (
      !this.isAuthenticated() &&
      !country.selected &&
      this.selectedCountriesCount() >= 1
    ) {
      return;
    }

    const nextCountries = this.countryMetadata().map((item) =>
      item.country_id === country.country_id
        ? { ...item, selected: !item.selected }
        : item,
    );

    this.emitCountryState(nextCountries);
    this.filterServers.emit();
  }

  collapseItem(continent: ContinentMetadata) {
    this.continentMetadataChanged.emit(
      this.continentMetadata().map((item) =>
        item.continent === continent.continent
          ? { ...item, collapsed: !item.collapsed }
          : item,
      ),
    );
  }

  getVendorRegionVendorIds(parameter: SearchBarParameter): string[] {
    const vendors: string[] = [];

    (parameter.schema.enum || []).forEach((value) => {
      const vendorId = (typeof value === "string" ? value : "").split("~")[0];

      if (vendorId && !vendors.includes(vendorId)) {
        vendors.push(vendorId);
      }
    });

    return vendors.sort((left, right) =>
      this.getVendorDisplayNameById(left).localeCompare(
        this.getVendorDisplayNameById(right),
      ),
    );
  }

  getVendorRegionsForVendor(
    parameter: SearchBarParameter,
    vendorId: string,
  ): string[] {
    return (parameter.schema.enum || [])
      .filter(
        (value): value is string =>
          typeof value === "string" && value.startsWith(`${vendorId}~`),
      )
      .sort((left, right) =>
        this.getVendorRegionDisplayName(left).localeCompare(
          this.getVendorRegionDisplayName(right),
        ),
      );
  }

  isVendorRegionSelected(
    parameter: SearchBarParameter,
    vendorRegion: string,
  ): boolean {
    return this.getSelectedVendorRegions(parameter).includes(vendorRegion);
  }

  areAllVendorRegionsSelected(
    parameter: SearchBarParameter,
    vendorId: string,
  ): boolean {
    const vendorRegions = this.getVendorRegionsForVendor(parameter, vendorId);

    return (
      vendorRegions.length > 0 &&
      vendorRegions.every((vendorRegion) =>
        this.isVendorRegionSelected(parameter, vendorRegion),
      )
    );
  }

  isVendorRegionCheckboxDisabled(
    parameter: SearchBarParameter,
    vendorRegion: string,
  ): boolean {
    if (this.disabled()) {
      return true;
    }

    if (this.isAuthenticated()) {
      return false;
    }

    return (
      !this.isVendorRegionSelected(parameter, vendorRegion) &&
      this.getSelectedVendorRegions(parameter).length >= this.maxVendorRegions()
    );
  }

  isVendorSelectAllDisabled(
    parameter: SearchBarParameter,
    vendorId: string,
  ): boolean {
    if (this.disabled()) {
      return true;
    }

    if (this.isAuthenticated()) {
      return false;
    }

    if (this.areAllVendorRegionsSelected(parameter, vendorId)) {
      return false;
    }

    return (
      this.getSelectedVendorRegions(parameter).length >= this.maxVendorRegions()
    );
  }

  toggleVendorRegion(parameter: SearchBarParameter, vendorRegion: string) {
    const selectedValues = this.getSelectedVendorRegions(parameter);

    if (selectedValues.includes(vendorRegion)) {
      parameter.modelValue = selectedValues.filter(
        (value) => value !== vendorRegion,
      );
    } else {
      if (
        !this.isAuthenticated() &&
        selectedValues.length >= this.maxVendorRegions()
      ) {
        return;
      }

      parameter.modelValue = [...selectedValues, vendorRegion];
    }

    this.valueChanged.emit();
  }

  toggleAllVendorRegions(parameter: SearchBarParameter, vendorId: string) {
    const selectedValues = this.getSelectedVendorRegions(parameter);
    const vendorRegions = this.getVendorRegionsForVendor(parameter, vendorId);

    if (this.areAllVendorRegionsSelected(parameter, vendorId)) {
      parameter.modelValue = selectedValues.filter(
        (value) => !vendorRegions.includes(value),
      );
    } else {
      const newValues = vendorRegions.filter(
        (vendorRegion) => !this.isVendorRegionSelected(parameter, vendorRegion),
      );
      const remaining = this.isAuthenticated()
        ? newValues
        : newValues.slice(
            0,
            Math.max(0, this.maxVendorRegions() - selectedValues.length),
          );
      parameter.modelValue = [...selectedValues, ...remaining];
    }

    this.valueChanged.emit();
  }

  getVendorRegionDisplayName(vendorRegion: string): string {
    const tilde = vendorRegion.indexOf("~");

    if (tilde === -1) {
      return vendorRegion;
    }

    const vendorId = vendorRegion.substring(0, tilde);
    const regionId = vendorRegion.substring(tilde + 1);
    const region = this.regionMetadata().find(
      (item) => item.vendor_id === vendorId && item.region_id === regionId,
    );

    return region?.name || regionId;
  }

  getVendorDisplayNameById(vendorId: string): string {
    return (
      this.vendorMetadata().find((vendor) => vendor.vendor_id === vendorId)
        ?.name || vendorId
    );
  }

  isVendorRegionGreenEnergy(vendorRegion: string): boolean {
    const tilde = vendorRegion.indexOf("~");

    if (tilde === -1) {
      return false;
    }

    const vendorId = vendorRegion.substring(0, tilde);
    const regionId = vendorRegion.substring(tilde + 1);

    return (
      this.regionMetadata().find(
        (region) =>
          region.vendor_id === vendorId && region.region_id === regionId,
      )?.green_energy || false
    );
  }

  toggleVendorRegionCollapse(vendorId: string) {
    const collapsedVendors = this.vendorRegionCollapsedVendors();
    const current = collapsedVendors[vendorId] !== false;

    this.vendorRegionCollapsedVendorsChanged.emit({
      ...collapsedVendors,
      [vendorId]: !current,
    });
  }

  isVendorRegionCollapsed(vendorId: string): boolean {
    return this.vendorRegionCollapsedVendors()[vendorId] !== false;
  }

  emitTooltip(event: MouseEvent | FocusEvent, content: string | undefined) {
    if (content) {
      this.showTooltip.emit({ event, content });
    }
  }

  private selectedCountriesCount(): number {
    return this.countryMetadata().filter((country) => country.selected).length;
  }

  private emitCountryState(countries: CountryMetadata[]) {
    this.countryMetadataChanged.emit(countries);
    this.continentMetadataChanged.emit(
      this.continentMetadata().map((continent) => {
        const countriesInContinent = countries.filter(
          (country) => country.continent === continent.continent,
        );

        return {
          ...continent,
          selected: countriesInContinent.every((country) => country.selected),
          collapsed: countriesInContinent.every((country) => !country.selected),
        };
      }),
    );
  }

  private getSelectedVendorRegions(parameter: SearchBarParameter): string[] {
    if (!Array.isArray(parameter.modelValue)) {
      return [];
    }

    return parameter.modelValue.filter(
      (value): value is string => typeof value === "string",
    );
  }
}
