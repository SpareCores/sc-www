export type PartnerLogo = {
  name: string;
  alt: string;
  href: string;
  src: string;
  styleVariant?: "compact";
};

export type PartnerSection = {
  id: string;
  heading?: string;
  description: readonly string[];
  logos: readonly PartnerLogo[];
  bulletItems?: readonly string[];
  dividerAfter?: boolean;
  logoRowVariant?: "compact";
};

export type PartnerCategory = {
  id: string;
  heading: string;
  intro: readonly string[];
  sections: readonly PartnerSection[];
};

export type PartnerInterestSection = {
  id: string;
  heading: string;
  intro: readonly string[];
  areasHeading: string;
  areas: readonly string[];
  outro: {
    linkLabel: string;
    linkHref: string;
    afterLink: string;
  };
};
