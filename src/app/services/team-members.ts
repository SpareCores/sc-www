import { HttpClient } from "@angular/common/http";
import { Injectable, inject } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { MarkdownService } from "ngx-markdown";

export type TeamMember = {
  name: string;
  role: string;
  bio: string;
  bioHtml: string;
  linkedin?: string;
  github?: string;
  x?: string;
  homepage?: string;
};

type TeamMemberData = Omit<TeamMember, "bioHtml">;

export type Authors = string | string[] | null | undefined;

export function authorNames(author: Authors): string[] {
  if (Array.isArray(author)) {
    return author.filter((name) => !!name);
  }
  return author ? [author] : [];
}

export function joinAuthorNames(names: string[]): string {
  if (names.length < 2) {
    return names.join("");
  }
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

@Injectable({
  providedIn: "root",
})
export class TeamMembers {
  private http = inject(HttpClient);
  private markdownService = inject(MarkdownService);
  private team?: Promise<TeamMember[]>;

  getTeam(): Promise<TeamMember[]> {
    if (!this.team) {
      this.team = firstValueFrom(
        this.http.get<TeamMemberData[]>(`./assets/images/team/team.json`),
      )
        .then((members) =>
          Promise.all(
            members.map(async (member) => ({
              ...member,
              bioHtml: await this.renderBio(member.bio),
            })),
          ),
        )
        .catch((error) => {
          this.team = undefined;
          throw error;
        });
    }
    return this.team;
  }

  private async renderBio(bio: string): Promise<string> {
    const html = await this.markdownService.parse(bio, { inline: true });
    return html.replace(
      /<a href="(https?:)/g,
      '<a target="_blank" rel="noopener" href="$1',
    );
  }

  async getMembers(author: Authors): Promise<TeamMember[]> {
    const team = await this.getTeam();
    return authorNames(author)
      .map((name) => team.find((member) => member.name === name))
      .filter((member): member is TeamMember => !!member);
  }
}
