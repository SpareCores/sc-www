import { PartnerCategory, PartnerInterestSection } from "./partners.types";

export const PARTNERS_PAGE_TITLE = "Partners";

export const PARTNERS_PAGE_DESCRIPTION =
  "Spare Cores works with cloud providers, research institutions, and ecosystem partners to help organizations make better decisions about compute infrastructure for AI, data, and other workloads.";

export const PARTNERS_PAGE_INTRO = [
  "Spare Cores works with a growing network of cloud providers, research institutions, and ecosystem partners to help organizations make better decisions about compute infrastructure for AI, data, and other workloads.",
  "Through our benchmarking platform and compute intelligence datasets, we provide partners with deep visibility into infrastructure performance, pricing, and efficiency across providers.",
  "Our partners support our mission to bring transparency, efficiency, and better economics to the rapidly evolving cloud and AI infrastructure landscape.",
] as const;

export const PARTNERS_PAGE_KEYWORDS =
  "Spare Cores partners, cloud partners, infrastructure partners, FinOps partners, ML infrastructure partners";

export const PARTNER_CATEGORIES: readonly PartnerCategory[] = [
  {
    id: "strategic-ecosystem",
    heading: "Strategic & Ecosystem Partners",
    intro: [
      "We collaborate with leading organizations across cloud infrastructure, FinOps, and DS/ML/AI platforms to bring best-in-class capabilities to our customers.",
      "These partnerships help expand the reach of the Spare Cores platform while ensuring customers benefit from deep integrations, shared expertise, and joint innovation.",
    ],
    sections: [
      {
        id: "finops-cloud-economics",
        heading: "FinOps & Cloud Economics",
        description: [
          "We work closely with the innovation teams of leading cloud service providers, such as Crayon & SoftwareOne, providing them with detailed cloud server performance and cost-efficiency metrics and data interfaces. By collaborating directly with their technical architects, we empower their consultants to deliver more granular insights, helping their enterprise customers better understand infrastructure cost dynamics and optimize cloud spend with surgical precision.",
        ],
        logos: [
          {
            name: "SoftwareOne",
            alt: "SoftwareOne wordmark",
            href: "https://www.softwareone.com/",
            src: "/assets/images/partners/software_one_logo.png",
          },
          {
            name: "Crayon",
            alt: "Crayon wordmark",
            href: "https://www.crayon.com/",
            src: "/assets/images/partners/crayon_logo.png",
          },
        ],
      },
      {
        id: "data-science-ml-infrastructure",
        heading: "Data Science & ML Infrastructure",
        description: [
          "We collaborate with the creators of Metaflow, including code exchanges with Outerbounds and Netflix, to develop specialized extensions that enable data scientists to seamlessly track resource utilization directly within their workflows and receive automated recommendations for server allocations, ensuring models are trained and deployed on the most cost-effective infrastructure available.",
        ],
        dividerAfter: true,
        logoRowVariant: "compact",
        logos: [
          {
            name: "Metaflow",
            alt: "Metaflow wordmark",
            href: "https://metaflow.org/",
            src: "/assets/images/partners/metaflow_logo.svg",
          },
          {
            name: "Outerbounds",
            alt: "Outerbounds wordmark",
            href: "https://outerbounds.com/",
            src: "/assets/images/partners/outerbounds_logo.png",
            styleVariant: "compact",
          },
          {
            name: "Netflix",
            alt: "Netflix wordmark",
            href: "https://netflixtechblog.com/tagged/metaflow",
            src: "/assets/images/partners/netflix_logo.png",
          },
        ],
      },
    ],
  },
  {
    id: "technology-cloud",
    heading: "Technology & Cloud Partners",
    intro: [
      "Spare Cores works closely with a wide range of global cloud and infrastructure providers to ensure accurate benchmarking, cost transparency, and reliable data for our customers evaluating compute resources. These partnerships ensure that Spare Cores maintains one of the most comprehensive and continuously updated datasets of cloud and GPU infrastructure performance and pricing available.",
    ],
    sections: [
      {
        id: "technology-cloud-logos",
        description: [
          "We are proud participants in various Startup and Partner Programs across these ecosystems. These collaborations include deep technical integrations, access to infrastructure credits, and participation in joint ecosystem initiatives, all of which allow us to provide the most up-to-date compute intelligence on the market.",
        ],
        dividerAfter: true,
        logos: [
          {
            name: "Alibaba Cloud",
            alt: "Alibaba Cloud logo",
            href: "https://www.alibabacloud.com/",
            src: "/assets/images/vendors/alicloud.svg",
          },
          {
            name: "Amazon Web Services",
            alt: "Amazon Web Services logo",
            href: "https://aws.amazon.com/",
            src: "/assets/images/vendors/aws-white-text.svg",
          },
          {
            name: "Microsoft Azure",
            alt: "Microsoft Azure logo",
            href: "https://azure.microsoft.com/",
            src: "/assets/images/vendors/azure.svg",
          },
          {
            name: "Google Cloud",
            alt: "Google Cloud logo",
            href: "https://cloud.google.com/",
            src: "/assets/images/vendors/gcp.svg",
          },
          {
            name: "Hetzner",
            alt: "Hetzner logo",
            href: "https://www.hetzner.com/cloud",
            src: "/assets/images/vendors/hcloud.svg",
          },
          {
            name: "OVHcloud",
            alt: "OVHcloud logo",
            href: "https://www.ovhcloud.com/",
            src: "/assets/images/vendors/ovh.svg",
          },
          {
            name: "UpCloud",
            alt: "UpCloud logo",
            href: "https://upcloud.com/",
            src: "/assets/images/vendors/upcloud.svg",
          },
        ],
      },
    ],
  },
  {
    id: "research-academic-collaboration",
    heading: "Research & Academic Collaboration",
    intro: [
      "Spare Cores bridges the gap between industry and academia to advance the field of cloud economics and distributed systems. These collaborations ensure our models and benchmarks remain grounded in both real-world usage and cutting-edge research.",
    ],
    sections: [
      {
        id: "research-academic-collaboration-content",
        description: [
          'Beyond active research collaboration on cloud cost driving factors, Spare Cores provides a highly scalable dashboarding solution for the CEU Business Analytics curriculum as part of <a href="https://gabors-data-analysis.com/lab" target="_blank" rel="noopener noreferrer">Gabors Data Analysis and AI Lab</a>. This live deployment allows students and researchers to interact with real-world data, proving the platform\'s utility in high-concurrency educational and analytical environments.',
        ],
        dividerAfter: true,
        logos: [
          {
            name: "Central European University",
            alt: "Central European University logo",
            href: "https://www.ceu.edu/",
            src: "/assets/images/partners/ceu_logo.svg",
          },
        ],
      },
    ],
  },
  {
    id: "funding-innovation-programs",
    heading: "Funding & Innovation Programs",
    intro: [
      "Spare Cores is supported by a combination of highly technical and product-led angel capital and prestigious public innovation grants, providing a robust foundation for our platform.",
    ],
    sections: [
      {
        id: "funding-innovation-programs-content",
        description: [],
        bulletItems: [
          'Innovation Programs: We are proud to have been accepted into the <a href="https://sparecores.com/article/nvidia-inception" target="_blank" rel="noopener noreferrer">NVIDIA Inception Program</a>, which empowers us to expand our benchmarking data with cutting-edge GPU performance.',
          'Public Innovation Funding: We were selected for the <a href="https://sparecores.com/article/ngi-search-grant" target="_blank" rel="noopener noreferrer">NGI (Next Generation Internet) Search initiative</a>, a European Commission program, for building open, transparent, and sovereign infrastructure for the future of the internet and AI.',
          "Venture Supported: We are backed by a pre-seed investment round led by BNL Start Partners and First Principle Innovation (FPI).",
        ],
        dividerAfter: true,
        logos: [
          {
            name: "NVIDIA Inception Program",
            alt: "NVIDIA Inception Program logo",
            href: "https://sparecores.com/article/nvidia-inception",
            src: "/assets/images/partners/nvidia_ip_logo.png",
          },
          {
            name: "NGI Search",
            alt: "NGI Search logo",
            href: "https://sparecores.com/article/ngi-search-grant",
            src: "/assets/images/partners/ngi_search_logo.png",
          },
          {
            name: "BNL Start Partners",
            alt: "BNL Start Partners logo",
            href: "http://bnlstart.com/startup-factory-2023",
            src: "/assets/images/partners/bnl_logo.png",
          },
          {
            name: "First Principle Innovation",
            alt: "First Principle Innovation logo",
            href: "https://www.first-principle.cc",
            src: "/assets/images/partners/first_principle_logo.png",
          },
        ],
      },
    ],
  },
];

export const PARTNER_INTEREST_SECTION: PartnerInterestSection = {
  id: "interested-in-partnering",
  heading: "Interested in Partnering?",
  intro: [
    "We are always interested in working with organizations that share our mission of improving transparency and efficiency in AI and cloud infrastructure.",
  ],
  areasHeading: "Potential partnership areas include:",
  areas: [
    "Cloud providers and infrastructure platforms",
    "FinOps and cost-optimization consultancies",
    "AI platform providers",
    "Research institutions",
    "Systems integrators and consulting firms",
  ],
  outro: {
    linkLabel: "Contact us",
    linkHref: "/contact",
    afterLink:
      " to explore how we can work together to improve infrastructure efficiency and transparency.",
  },
};
