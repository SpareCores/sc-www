import { E2EEvent } from "../support/generics";


describe('Visit main pages', () => {

  it('Visit pages', () => {
    E2EEvent.visitURL('');
    E2EEvent.visitURL('/servers');
    E2EEvent.visitURL('/server_prices');
    E2EEvent.visitURL('/vendors');
    E2EEvent.visitURL('/regions');
    E2EEvent.visitURL('/articles');
    E2EEvent.visitURL('/article/berlin-buzzwords-2024');
    E2EEvent.visitURL('/server/gcp/t2d-standard-1');
    E2EEvent.visitURL('/compare?instances=W3sidmVuZG9yIjoiYXdzIiwic2VydmVyIjoiYTEubWVkaXVtIn0seyJ2ZW5kb3IiOiJhd3MiLCJzZXJ2ZXIiOiJjNmdkLm1lZGl1bSJ9XQ%3D%3D');
  });
});
