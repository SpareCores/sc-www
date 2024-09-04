import { E2EEvent } from "../support/generics";

const BENCHMARKS_COUNT = 6;

describe('Server Compare', () => {

  it('Server with price', () => {
    E2EEvent.visitURL('/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYzZnbi5tZWRpdW0ifSx7InZlbmRvciI6ImF3cyIsInNlcnZlciI6ImM3Zy5tZWRpdW0ifV0%3D', 4000);

    E2EEvent.checkBreadcrumbs();

    E2EEvent.isVisible(`[id="main-table"]`);

    E2EEvent.countElements(`[id="main-table"]`, `[id="main-table-th"]`, 2);

    E2EEvent.countElements(`[id="main-table"]`, `[id="benchmark_line"]`, BENCHMARKS_COUNT);

  });


});
