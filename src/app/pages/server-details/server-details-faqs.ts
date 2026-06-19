import { AccordionItem } from "../../components/accordion/accordion.component";
import { formatStorageSize } from "../../pipes/pipe-utils";
import {
  BenchmarkScore,
  ServerPKs,
  ServerPrice,
} from "../../../../sdk/data-contracts";

export type ServerDetailsForFaqs = {
  display_name: string;
  vcpus?: number | null;
  cpu_cores?: number | null;
  cpu_manufacturer?: string | null;
  cpu_family?: string | null;
  cpu_model?: string | null;
  memory_speed?: number | null;
  cpu_speed?: number | null;
  memory_generation?: string | null;
  storage_size?: number | null;
  storage_type?: string | null;
  gpu_count?: number | null;
  gpu_manufacturer?: string | null;
  gpu_family?: string | null;
  gpu_model?: string | null;
  benchmark_scores: BenchmarkScore[];
  prices: Pick<ServerPrice, "price" | "currency">[];
  family?: string | null;
  vendor: {
    name: string;
    founding_year?: number | null;
    state?: string | null;
    country_id: string;
    homepage?: string | null;
  };
};

export type BuildServerFaqsInput = {
  serverDetails: ServerDetailsForFaqs;
  description: string;
  formattedMemory: string;
  countryName: string;
  serverRegions?: string[];
  serverZoneCount?: number;
  similarByFamily?: ServerPKs[];
  similarBySpecs?: ServerPKs[];
};

export function formatServerLinkHtml(
  server: ServerPKs,
  appendVendor: boolean = false,
): string {
  return `<a class="underline decoration-dotted hover:text-gray-500"
      href="/server/${server.vendor_id}/${server.api_reference}">
      ${server.display_name}${appendVendor ? " (" + server.vendor_id + ")" : ""}</a>`;
}

function buildBenchmarkSpeedAnswer(
  displayName: string,
  benchmarkScores: BenchmarkScore[],
): string {
  const benchmarkFrameworks = new Set<string>();
  for (const item of benchmarkScores) {
    benchmarkFrameworks.add(item["benchmark_id"]);
  }
  let answer = `We have run ${benchmarkFrameworks.size} frameworks on the ${displayName} server, and collected ${benchmarkScores.length} performance metrics. Depending on your use case, you might want to look at our Memory bandwidth, Compression algo, or OpenSSL speed benchmarks, among others.`;
  for (const item of benchmarkScores) {
    if (
      item.benchmark_id === "geekbench:score" &&
      (item.config as any)?.cores === "Multi-Core Performance"
    ) {
      answer += ` As a baseline example, the multi-core Geekbench6 compound score suggests that the ${displayName} server is ${item.score / 2500}x ${item.score > 2500 ? "faster" : "slower"} than the baseline Dell Precision 3460 with a Core i7-12700 processor.`;
    }
  }
  return answer;
}

function buildSpecsAnswer(
  serverDetails: ServerDetailsForFaqs,
  formattedMemory: string,
): string {
  return `The ${serverDetails.display_name} server is equipped with ${serverDetails.vcpus} logical CPU core${serverDetails.vcpus! > 1 ? "s" : ""} on ${serverDetails.cpu_cores || "unknown number of"} ${serverDetails.cpu_manufacturer || ""} ${serverDetails.cpu_family || ""} ${serverDetails.cpu_model || ""} physical CPU core${serverDetails.cpu_cores ? (serverDetails.cpu_cores! > 1 ? "s" : "") : "(s)"}${serverDetails.memory_speed ? " running at max. " + serverDetails.cpu_speed + " Ghz" : ""}, ${formattedMemory} of ${serverDetails.memory_generation || ""} memory${serverDetails.memory_speed ? " with " + serverDetails.memory_speed + " Mhz clock rate" : ""}, ${formatStorageSize(serverDetails.storage_size ?? 0)} of ${serverDetails.storage_type || ""} storage, and ${serverDetails.gpu_count! > 0 ? serverDetails.gpu_count : "no"} ${serverDetails.gpu_manufacturer || ""} ${serverDetails.gpu_family || ""} ${serverDetails.gpu_model || ""} GPU${serverDetails.gpu_count! > 1 ? "s" : ""}. Additional block storage can be attached as needed.`;
}

export function buildServerFaqs(input: BuildServerFaqsInput): AccordionItem[] {
  const {
    serverDetails,
    description,
    formattedMemory,
    countryName,
    serverRegions,
    serverZoneCount,
    similarByFamily,
    similarBySpecs,
  } = input;
  const displayName = serverDetails.display_name;

  const faqs: AccordionItem[] = [
    {
      title: `What is ${displayName}?`,
      content: description,
    },
    {
      title: `What are the specs of the ${displayName} server?`,
      content: buildSpecsAnswer(serverDetails, formattedMemory),
    },
  ];

  if (serverDetails.benchmark_scores.length > 0) {
    faqs.push({
      title: `How fast is the ${displayName} server?`,
      content: buildBenchmarkSpeedAnswer(
        displayName,
        serverDetails.benchmark_scores,
      ),
    });
  }

  if (serverDetails.prices[0]) {
    faqs.push({
      title: `How much does the ${displayName} server cost?`,
      content: `The pricing for ${displayName} servers starts at ${serverDetails.prices[0].price} ${serverDetails.prices[0].currency} per hour, but the actual price depends on the selected region, zone and server allocation method (e.g. on-demand versus spot pricing options): currently, we track the prices in ${serverDetails.prices.length} regions and zones every 5 minutes, and the maximum price stands at ${serverDetails.prices.slice(-1)[0].price} ${serverDetails.prices.slice(-1)[0].currency}.`,
    });
  }

  faqs.push({
    title: `Who is the provider of the ${displayName} server?`,
    content: "",
    html: `The ${displayName} server is offered by ${serverDetails.vendor.name}, founded in ${serverDetails.vendor.founding_year}, headquartered in ${serverDetails.vendor.state}, ${countryName}. For more information, visit the <a href="${serverDetails.vendor.homepage}" target="_blank" rel="noopener" class="underline decoration-dotted hover:text-gray-500">${serverDetails.vendor.name} homepage</a>.`,
  });

  if (serverRegions) {
    faqs.push({
      title: `Where is the ${displayName} server available?`,
      content: "",
      html: `The ${displayName} server is available in ${serverZoneCount} availability zones of the following ${serverRegions.length} regions: ${serverRegions.join(", ")}.`,
    });
  }

  if (similarByFamily?.length) {
    faqs.push({
      title: `Are there any other sized servers in the ${serverDetails.family} server family?`,
      content: "",
      html: `Yes! In addition to the ${displayName} server, the ${serverDetails.family} server family includes ${similarByFamily.length} other sizes: ${similarByFamily.map((s) => formatServerLinkHtml(s, true)).join(", ")}.`,
    });
  }

  if (similarBySpecs?.length) {
    faqs.push({
      title: `What other servers offer similar performance to ${displayName}?`,
      content: "",
      html: `Looking at the number of GPU, vCPUs, and memory amount, the following top 10 servers come with similar specs: ${similarBySpecs.map((s) => formatServerLinkHtml(s, true)).join(", ")}.`,
    });
  }

  return faqs;
}
