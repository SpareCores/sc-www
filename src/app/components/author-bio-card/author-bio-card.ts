import { Component, computed, input } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  LucideArrowRight,
  LucideDynamicIcon,
  LucideGlobe,
} from "@lucide/angular";
import { TeamMember } from "../../services/team-members";

@Component({
  selector: "sc-author-bio-card",
  imports: [RouterLink, LucideArrowRight, LucideDynamicIcon, LucideGlobe],
  templateUrl: "./author-bio-card.html",
  styleUrl: "./author-bio-card.css",
})
export class AuthorBioCard {
  member = input.required<TeamMember>();
  firstName = computed(() => this.member().name.split(" ")[0]);
}
