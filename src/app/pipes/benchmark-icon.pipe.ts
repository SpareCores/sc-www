import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
  name: "benchmarkIcon",
  standalone: true,
})
export class BenchmarkIconPipe implements PipeTransform {
  transform(
    value: string | undefined | null,
    fallback: string = "gauge",
  ): string {
    if (!value) return fallback;

    const lowerCase = value.toLowerCase().replace(/-/g, "_").replace(/ /g, "_");

    switch (true) {
      case lowerCase.includes("bogomips"):
        return "refresh-ccw-dot";
      case lowerCase.includes("bw_mem"):
      case lowerCase.includes("bwmem"):
      case lowerCase.includes("memory_bandwidth"):
      case lowerCase.startsWith("memory_"):
      case lowerCase.includes("membench"):
        return "memory-stick";
      case lowerCase.includes("compression"):
        return "package-open";
      case lowerCase.includes("llm_speed"):
      case lowerCase.includes("llm_inference"):
        return "bot";
      case lowerCase.includes("geekbench"):
      case lowerCase.includes("passmark"):
        return "boxes";
      case lowerCase.includes("openssl"):
        return "earth-lock";
      case lowerCase.includes("redis"):
        return "database-zap";
      case lowerCase.includes("static_web"):
        return "image-up";
      case lowerCase.includes("stress_ng"):
        return "cpu";
      default:
        return fallback;
    }
  }
}
