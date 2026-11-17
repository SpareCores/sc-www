export interface FundingProject {
  title: string;
  id: string;
  location: string;
  amount: string;
  period: string;
  summary: string;
  pressReleaseUrl?: string;
}

export const FUNDING_PROJECTS: Record<string, FundingProject> = {
  bnl: {
    title: "Spare Cores Sentinel",
    id: "2023-1.1.3-STARTUP/BNL-011",
    location: "1037 Budapest, Montevideo utca 9.",
    amount: "20.440.182.- Ft",
    period: "2025.11.10. – 2026.04.30.",
    summary:
      "A Spare Cores egy nyílt forráskódú, adatalapú kezdeményezés, amely a felhő-infrastruktúra teljesítményének és költséghatékonyságának mérésével és publikálásával támogatja a modern data science, gépi tanulás és AI-munkafolyamatok infrastruktúra-döntéseit. A pályázat keretében tervezett fejlesztés célja a korábban létrehozott Resource Tracker továbbfejlesztése egy skálázható, felhőalapú, menedzselt szolgáltatás irányába: a mért erőforrás-használati adatok valós idejű streamelése központi Spare Cores infrastruktúrába, ezek biztonságos, token alapú azonosítással történő tárolása, valamint egy interaktív webes dashboard kialakítása, amely automatikus riportokkal és vizualizációkkal támogatja a felhasználók munkáját. A rendszer alapot teremt egy jövőbeli, nemzetközi piacra szánt SaaS termékhez, amely a data science, machine learning és generatív AI feladatok erőforrás-allokációját és költséghatékonyságát optimalizáló ajánlásokat nyújt.",
    pressReleaseUrl: "/assets/images/funding/sentinel-sajtokozlemeny-2026.pdf",
  },
  fpi: {
    title: "Spare Cores",
    id: "FPI_03",
    location: "1037 Budapest, Montevideo utca 9.",
    amount: "23 399 400 Ft",
    period: "2026. május 1. – 2026. november 30.",
    summary:
      "A Spare Cores Kft. olyan szolgáltatást és nyílt forráskódú eszközöket fejleszt, amelyek automatikusan mérik a gépi tanulási és adatfeldolgozási feladatok valós erőforrásigényét, és javaslatot tesznek a legköltséghatékonyabb felhős virtuális gépre. Így a data science csapatok gyorsabban és olcsóbban futtathatják a munkáikat, extra DevOps-teher nélkül. A projekt (2026. május 1. – november 30.) a szolgáltatás termékfejlesztését, a benchmark- és árazási adatbázis bővítését, az üzleti validációt és a nemzetközi szakmai megjelenést finanszírozta.",
  },
};
