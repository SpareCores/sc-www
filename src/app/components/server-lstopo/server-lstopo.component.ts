import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
  inject,
  PLATFORM_ID,
} from "@angular/core";
import { CommonModule, isPlatformBrowser, DOCUMENT } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { Modal, ModalOptions } from "flowbite";
import { Observable, Subscription, shareReplay, catchError, of } from "rxjs";
import { DragToPanDirective } from "../../directives/drag-to-pan.directive";

const LSTOPO_CDN_BASE =
  "https://cdn.statically.io/gh/SpareCores/sc-inspector-data@main/data";
const LSTOPO_PATH_SUFFIX = "lstopo/lstopo.svg";

const lstopoModalOptions: ModalOptions = {
  backdropClasses: "bg-gray-900/50 fixed inset-0 z-40",
  closable: true,
};

const svgCache = new Map<string, Observable<string | null>>();

@Component({
  selector: "app-server-lstopo",
  imports: [CommonModule, LucideAngularModule, DragToPanDirective],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
  encapsulation: ViewEncapsulation.None,
})
export class ServerLstopoComponent implements OnChanges, OnDestroy {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private platformId = inject(PLATFORM_ID);
  private document = inject<Document>(DOCUMENT);

  lstopoUrl: string = "";
  inlineSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;

  @ViewChild("lstopoModal") private lstopoModalRef?: ElementRef<HTMLElement>;

  private modal: Modal | null = null;
  private svgSub?: Subscription;

  ngOnChanges(): void {
    if (!this.vendorId || !this.apiReference) return;
    this.isLoading = true;
    this.hasError = false;
    this.inlineSvg = null;
    this.lstopoUrl = `${LSTOPO_CDN_BASE}/${this.vendorId}/${this.apiReference}/${LSTOPO_PATH_SUFFIX}`;

    if (!svgCache.has(this.lstopoUrl)) {
      svgCache.set(
        this.lstopoUrl,
        this.http
          .get(this.lstopoUrl, { responseType: "text" })
          .pipe(shareReplay(1)),
      );
    }

    const url = this.lstopoUrl;
    this.svgSub?.unsubscribe();
    this.svgSub = svgCache
      .get(url)!
      .pipe(
        catchError(() => {
          svgCache.delete(url);
          return of(null);
        }),
      )
      .subscribe((svg) => {
        if (!svg) {
          this.hasError = true;
        } else {
          this.inlineSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          if (isPlatformBrowser(this.platformId)) {
            setTimeout(() => {
              const el = this.lstopoModalRef?.nativeElement;
              if (el) {
                this.modal = new Modal(el, lstopoModalOptions);
              }
            }, 0);
          }
        }
        this.isLoading = false;
      });
  }

  openLstopoModal(): void {
    this.modal?.show();
  }

  closeLstopoModal(): void {
    this.modal?.hide();
  }

  ngOnDestroy(): void {
    this.svgSub?.unsubscribe();
    if (isPlatformBrowser(this.platformId) && this.modal) {
      this.modal.destroyAndRemoveInstance();
      this.modal = null;
    }
  }
}
