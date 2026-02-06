import { Component, Input } from "@angular/core";

@Component({
  selector: "app-loading-spinner",
  templateUrl: "./loading-spinner.component.html",
})
export class LoadingSpinnerComponent {
  @Input() size: "sm" | "md" | "lg" = "md";
  @Input() text?: string;
  @Input() textClasses = "text-2xl";

  get sizeClasses(): string {
    switch (this.size) {
      case "sm":
        return "w-6 h-6 text-gray-200";
      case "lg":
        return "w-12 h-12 text-gray-200";
      default:
        return "w-8 h-8 text-gray-200";
    }
  }
}
