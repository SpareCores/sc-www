import {
  ChangeDetectionStrategy,
  Component,
  inject,
  output,
  signal,
} from "@angular/core";
import { LucideX } from "@lucide/angular";
import { Auth } from "../../../services/auth/auth";
import { Button } from "../../button/button";
import { GUEST_COMPARE_LIMIT } from "../../../collections/collections.utils";

@Component({
  selector: "sc-guest-collections-banner",
  imports: [Button, LucideX],
  templateUrl: "./guest-collections-banner.html",
  styleUrl: "./guest-collections-banner.scss",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuestCollectionsBannerComponent {
  private auth = inject(Auth);

  dismissed = output<void>();
  protected visible = signal(true);

  protected readonly compareLimit = GUEST_COMPARE_LIMIT;

  protected dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }

  protected register(): void {
    this.auth.signUp();
  }
}
