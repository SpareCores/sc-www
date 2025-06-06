import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, EventEmitter, Inject, Input, OnChanges, OnDestroy, OnInit, Output, PLATFORM_ID, SimpleChanges, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Modal, ModalOptions } from 'flowbite';
import { LucideAngularModule } from 'lucide-angular';
import { KeeperAPIService } from '../../services/keeper-api.service';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { CountryMetadata, ContinentMetadata, RegionMetadata, RegionVendorMetadata } from '../../pages/server-listing/server-listing.component';
import { CountryIdtoNamePipe } from '../../pipes/country-idto-name.pipe';


const optionsModal: ModalOptions = {
  backdropClasses:
      'bg-gray-900/50 fixed inset-0 z-40',
  closable: true,
};

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, LucideAngularModule, CountryIdtoNamePipe],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss'
})
export class SearchBarComponent implements OnInit, OnChanges, OnDestroy {

  @Input() query: any = {};
  @Input() searchParameters: any[] = [];
  @Input() extraParameters: any = {};
  @Input() filterCategories: any[] = [];
  @Input() selectedCurrency: any | null = null;
  @Input() AIAssistantType = 'servers';

  @Output() searchChanged = new EventEmitter<any>();

  @ViewChild('tooltipDefault') tooltip!: ElementRef;
  clipboardIcon = 'clipboard';
  tooltipContent = '';

  complianceFrameworks: any[] = [];
  vendors: any[] = [];
  storageIds: any[] = [];

  countryMetadata: CountryMetadata[] = [];
  continentMetadata: ContinentMetadata[] = [];
  regionMetadata: RegionMetadata[] = [];
  regionVendorMetadata: RegionVendorMetadata[] = [];
  selectedCountries: string[] = [];
  selectedRegions: string[] = [];

  vendorMetadata: any[] = [];

  modalSearch: any;
  freetextSearchInput: string | null = null;
  modalSubmitted = false;
  modalResponse: any;
  modalResponseStr: string[] = [];

  valueChangeDebouncer: Subject<number> = new Subject<number>();
  private subscription = new Subscription();

  constructor(@Inject(PLATFORM_ID) private platformId: object,
    private keeperAPI: KeeperAPIService) { }

  ngOnInit() {

    this.keeperAPI.getComplianceFrameworks().then((response: any) => {
      this.complianceFrameworks = response.body;
    });

    this.keeperAPI.getVendors().then((response: any) => {
      this.vendors = response.body;
    });

    this.keeperAPI.getStorages().then((response: any) => {
      this.storageIds = response.body;
    });

    this.subscription.add(
      this.valueChangeDebouncer.pipe(debounceTime(500)).subscribe(() => {

        let vcpu_max = this.searchParameters.find((param: any) => param.name === 'vcpus_max');
        let vcpu_min = this.searchParameters.find((param: any) => param.name === 'vcpus_min');
        if(vcpu_min?.modelValue > 0 && vcpu_max?.modelValue > 0 && vcpu_min.modelValue > vcpu_max.modelValue) {
          vcpu_max.modelValue = vcpu_min.modelValue;
        }

        // fix min-max range values
        this.searchParameters.forEach((param: any) => {
          if(param.schema.range_min && param.schema.range_max) {
            if(param.modelValue < param.schema.range_min) {
              param.modelValue = param.schema.range_min;
            }

            if(param.modelValue > param.schema.range_max) {
              param.modelValue = param.schema.range_max;
            }
          }
        });

        this.filterServers();
      })
    );

    if(isPlatformBrowser(this.platformId)) {

      const targetElModal = document.getElementById('search-prompt-modal');

      this.modalSearch = new Modal(targetElModal, optionsModal,  {
        id: 'search-prompt-modal',
        override: true
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    for(let change of Object.keys(changes)) {
      if(change === 'query') {
        this.selectedCountries = this.query.countries ? this.query.countries : [];
        this.selectedRegions = this.query.regions ? this.query.regions : [];
        this.loadCountries(this.selectedCountries);
        this.loadRegions(this.selectedRegions);
        if(this.selectedCountries?.length || this.selectedRegions?.length) {
          if(this.filterCategories.find((column) => column.category_id === 'region')) {
            this.filterCategories.find((column) => column.category_id === 'region')!.collapsed = false;
          }
        }
      }
    }

    this.searchParameters?.forEach((item: any) => {

      // init modelValue as empty array for enumArray types if not already set
      if (this.getParameterType(item) === 'enumArray' && !item.modelValue) {
        item.modelValue = [];
      }

      let value = this.extraParameters[item.name] || this.query[item.name] || item.schema.default || null;

      // if type is a string try split by ,
      if(typeof this.query[item.name] === 'string') {
        value = this.query[item.name].indexOf(',') !== -1 ? this.query[item.name].split(',') : this.query[item.name];
      }

      // if only one value is selected as query parameter, it is parsed as string, so we need to convert it to array
      if(this.query[item.name] &&
        (this.getParameterType(item) === 'enumArray' || this.getParameterType(item) === 'compliance_framework' || this.getParameterType(item) === 'vendor' ) &&
        !Array.isArray(this.query[item.name])) {
        value = [this.query[item.name]];
      }

      if(this.query[item.name]) {
        if(this.filterCategories.find((column) => column.category_id === item.schema.category_id)) {
          this.filterCategories.find((column) => column.category_id === item.schema.category_id)!.collapsed = false;
        }
      }

      if(this.extraParameters[item.name]) {
        if(typeof this.extraParameters[item.name] === 'string') {
          value = this.extraParameters[item.name].indexOf(',') !== -1 ? this.extraParameters[item.name].split(',') : this.extraParameters[item.name];
        }

        // if only one value is selected as query parameter, it is parsed as string, so we need to convert it to array
        if(this.extraParameters[item.name] &&
          (this.getParameterType(item) === 'enumArray' || this.getParameterType(item) === 'compliance_framework' || this.getParameterType(item) === 'vendor' ) &&
          !Array.isArray(this.extraParameters[item.name])) {
          value = [this.extraParameters[item.name]];
        }
      }

      if(value === 'true' || value === 'false') {
        value = value === 'true';
      }

      if(!value && item.schema.null_value) {
        value = item.schema.null_value;
      }

      item.modelValue = value;
    });

  }

  filterServers() {
    const queryObject: any = this.getQueryObject() || {};

    if(this.countryMetadata.find((country) => country.selected)) {
      queryObject.countries = [];
      this.countryMetadata.forEach((country) => {
        if(country.selected) {
          queryObject.countries.push(country.country_id);
        }
      });
    } else {
      if(queryObject.countries) delete queryObject.countries;
    }

    if(this.regionMetadata.find((region) => region.selected)) {
      queryObject.regions = [];
      this.regionMetadata.forEach((region) => {
        if(region.selected) {
          queryObject.regions.push(region.region_id);
        }
      });
    } else {
      if(queryObject.datacregionsenters) delete queryObject.regions;
    }

    this.searchChanged.emit(queryObject);
  }

  getQueryObject() {
    const paramObject = this.searchParameters?.filter(item => !this.isParameterDisabled(item.name)).map((param: any) => {
      return ((param.modelValue || param.modelValue === false) &&
              param.schema.category_id &&
              param.schema.default !== param.modelValue &&
              param.schema.null_value !== param.modelValue) ?
              {[param.name]: param.modelValue} :
              {};
    }).reduce((acc: any, curr: any) => {  return {...acc, ...curr}; }, {});

    return paramObject || {};
  }

  getComplianceFrameworkName(id: string) {
    return this.complianceFrameworks.find((item) => item.compliance_framework_id === id)?.abbreviation || id;
  }

  getVendorName(id: string) {
    return this.vendors.find((item) => item.vendor_id === id)?.name || id;
  }

  getStorageName(id: string) {
    return this.storageIds.find((item) => item.storage_id === id)?.name || id;
  }

  getStep(parameter: any) {
    return parameter.schema.step || 1;
  }

  toggleCategory(category: any) {
    category.collapsed = !category.collapsed;
  }

  getParametersByCategory(category: string) {
    if(!this.searchParameters) return [];

    return this.searchParameters?.filter((param: any) => param.schema?.category_id === category);
  }

  isParameterDisabled(parameterName: string): boolean {
    return this.extraParameters?.[parameterName] != null;
  }

  getParameterType(parameter: any) {
    const type = parameter.schema.type || parameter.schema.anyOf?.find((item: any)  => item.type !== 'null')?.type || 'text';
    const name = parameter.name;

    if(name === 'countries') {
      return 'country';
    }

    if(name === 'regions') {
      return 'regions';
    }

    if(name === 'compliance_framework') {
      return 'compliance_framework';
    }

    if(name === 'vendor') {
      return 'vendor';
    }

    if(name === 'vendor') {
      return 'vendor';
    }

    if(name === 'storage_id') {
      return 'storage_id';
    }

    if((type === 'integer' || type === 'number') && (parameter.schema.range_min || parameter.schema.range_min === 0) && parameter.schema.range_max) {
      return 'range';
    }

    if(type === 'integer' || type === 'number') {
      if(parameter.schema.category_id === 'price')
        return 'price';
      else
        return 'number';
    }

    if(type === 'boolean') {
      return 'checkbox';
    }

    if(type === 'array' && parameter.schema.enum) {
      return 'enumArray';
    }

    return 'text';
  }

  valueChanged() {
    this.valueChangeDebouncer.next(0);
  }

  isEnumSelected(param: any, valueOrObj: any) {
    const value = typeof valueOrObj === 'string' ? valueOrObj : valueOrObj.key;
    return Array.isArray(param.modelValue) && param.modelValue.includes(value);
  }

  selectEnumItem(param: any, valueOrObj: any) {
    if (!Array.isArray(param.modelValue)) {
      param.modelValue = [];
    }

    const value = typeof valueOrObj === 'string' ? valueOrObj : valueOrObj.key;
    const index = param.modelValue.indexOf(value);

    if (index !== -1) {
      param.modelValue = param.modelValue.filter((v: any) => v !== value);
    } else {
      param.modelValue = [...param.modelValue, value];
    }

    this.valueChanged();
  }


  loadCountries(selectedCountries: string | string[] | undefined) {
    let selectedCountryIds = selectedCountries ? selectedCountries : [];

    if(typeof selectedCountries === 'string') {
      selectedCountryIds = selectedCountries.split(',');
    }

    this.keeperAPI.getCountries().then((response) => {
      if(response?.body) {

        this.countryMetadata = response.body.map((item: any) => {
          return {...item, selected: selectedCountryIds.indexOf(item.country_id) !== -1};
        }).sort((a: any, b: any) => {
          const regionNamesInEnglish = new Intl.DisplayNames(['en'], { type: 'region' });
          return regionNamesInEnglish.of(a.country_id)?.localeCompare(regionNamesInEnglish.of(b.country_id) || '') || 0;
        });

        this.continentMetadata = [];
        this.countryMetadata.forEach((country) => {
          const continent = this.continentMetadata.find((item) => item.continent === country.continent);
          if(!continent) {
            this.continentMetadata.push({continent: country.continent, selected: false, collapsed: true});
          }
        });

        this.continentMetadata.forEach((continent) => {
          continent.selected = this.countryMetadata.find((country) => country.continent === continent.continent && !country.selected) === undefined;
          continent.collapsed = this.countryMetadata.find((country) => country.continent === continent.continent && country.selected) === undefined;
        });
      }
    });
  }

  countriesByContinent(continent: string) {
    return this.countryMetadata.filter((country) => country.continent === continent);
  }

  selectContinent(continent: ContinentMetadata) {
    continent.selected = !continent.selected;
    this.countryMetadata.forEach((country) => {
      if(country.continent === continent.continent) {
        country.selected = continent.selected;
      }
    });

    this.valueChanged();
  }

  collapseItem(continent: ContinentMetadata | RegionVendorMetadata) {
    continent.collapsed = !continent.collapsed;
  }

  loadRegions(selectedRegions: string | string[] | undefined) {
    let selectedRegionIds = selectedRegions ? selectedRegions : [];

    if(typeof selectedRegions === 'string') {
      selectedRegionIds = selectedRegions.split(',');
    }

    Promise.all([
      this.keeperAPI.getVendors(),
      this.keeperAPI.getRegions()]).then((responses) => {

      if(responses[0]?.body) {
        this.vendorMetadata = responses[0].body;
      }
      if(responses[1]?.body) {
        this.regionMetadata = responses[1].body.map((item: any) => {
          return {...item, selected: selectedRegionIds.indexOf(item.region_id) !== -1};
        }).sort((a: any, b: any) => a.name.localeCompare(b.name));

        this.regionVendorMetadata = [];
        this.regionMetadata.forEach((region) => {
          const vendor = this.regionVendorMetadata.find((item) => item.vendor_id === region.vendor_id);
          if(!vendor) {
            this.regionVendorMetadata.push(
              {
                vendor_id: region.vendor_id,
                name: this.vendorMetadata.find((vendor) => vendor.vendor_id === region.vendor_id)?.name,
                selected: false,
                collapsed: true
              });
          }
        });

        this.regionVendorMetadata.forEach((vendor) => {
          vendor.selected = this.regionMetadata.find((region) => region.vendor_id === vendor.vendor_id && !region.selected) === undefined;
          vendor.collapsed = this.regionMetadata.find((region) => region.vendor_id === vendor.vendor_id && region.selected) === undefined;
        });
      }
    });
  }

  regionsByVendor(vendor_id: string) {
    return this.regionMetadata.filter((region) => region.vendor_id === vendor_id);
  }

  selectRegionrVendor(vendor: RegionVendorMetadata) {
    vendor.selected = !vendor.selected;
    this.regionMetadata.forEach((region) => {
      if(region.vendor_id === vendor.vendor_id) {
        region.selected = vendor.selected;
      }
    });

    this.valueChanged();
  }

  openSearchPrompt() {
    this.modalSearch?.show();
  }

  closeModal(confirm: boolean) {
    if(confirm) {

      this.searchParameters.forEach((param: any) => {
        param.modelValue = param.schema.default;
      });

      Object.keys(this.modalResponse).forEach((key) => {
        const param = this.searchParameters.find((param: any) => param.name === key);
        if(param) {
          param.modelValue = this.modalResponse[key];
        }
      });

      this.filterServers();

      this.freetextSearchInput = '';
      this.modalResponse = null;
    }

    this.modalSearch?.hide();
  }

  async submitFreetextSearch() {
    this.modalSubmitted = true;
    this.modalResponse = null;

    if(this.freetextSearchInput) {
      try {
        let response = await this.keeperAPI.parsePromptFor(this.AIAssistantType, {text:this.freetextSearchInput});

        this.modalResponse = response.body;
        this.modalResponseStr = [];
        Object.keys(response.body).forEach((key) => {
          this.modalResponseStr.push(key + ': ' + response.body[key]);
        });
      } catch(err) {
        console.error(err);
      } finally {
        this.modalSubmitted = false;
      }
    }
  }

  showTooltip(el: any, content: string, autoHide = false) {
    this.tooltipContent = content;
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.left = `${el.target.getBoundingClientRect().right + 5}px`;
    tooltip.style.top = `${el.target.getBoundingClientRect().top - 5}px`;

    tooltip.style.display = 'block';
    tooltip.style.opacity = '1';

    if(autoHide) {
      setTimeout(() => {
        this.hideTooltip();
      }, 3000);
    }
  }

  hideTooltip() {
    const tooltip = this.tooltip.nativeElement;
    tooltip.style.display = 'none';
    tooltip.style.opacity = '0';
  }

  getInputStyle(parameter: any) {
    if(!parameter.modelValue) {
      return { 'max-width': '3ch' };
    }

    return { 'max-width': `${parameter.modelValue.toString().length + 2}ch` };
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.valueChangeDebouncer.complete();
  }

}
