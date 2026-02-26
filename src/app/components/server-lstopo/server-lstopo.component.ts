import { Component, Input, OnChanges, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClient } from "@angular/common/http";
import { DomSanitizer, SafeHtml } from "@angular/platform-browser";
import { LucideAngularModule } from "lucide-angular";
import { LoadingSpinnerComponent } from "../loading-spinner/loading-spinner.component";

@Component({
  selector: "app-server-lstopo",
  imports: [CommonModule, LucideAngularModule, LoadingSpinnerComponent],
  templateUrl: "./server-lstopo.component.html",
  styleUrl: "./server-lstopo.component.scss",
})
export class ServerLstopoComponent implements OnChanges {
  @Input() vendorId: string = "";
  @Input() apiReference: string = "";

  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);

  inlineSvg: SafeHtml | null = null;
  isLoading: boolean = false;
  hasError: boolean = false;

  ngOnChanges(): void {
    if (this.vendorId && this.apiReference) {
      this.isLoading = true;
      this.hasError = false;
      this.inlineSvg = null;
      const url = `https://cdn.statically.io/gh/SpareCores/sc-inspector-data@main/data/${this.vendorId}/${this.apiReference}/lstopo/lstopo.svg`;
      this.http.get(url, { responseType: "text" }).subscribe({
        next: (svg) => {
          this.inlineSvg = this.sanitizer.bypassSecurityTrustHtml(svg);
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
          this.hasError = true;
        },
      });
    }
  }
}
