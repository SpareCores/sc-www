import { CommonEngine } from "@angular/ssr/node";
import { render } from "@netlify/angular-runtime/common-engine";

/* 
  NOTE: We do NOT import 'app' or any Express logic here.
  Netlify's Angular 19 runtime handles the 'index.html' and 
  static assets automatically via its internal 'render' function.
*/

const commonEngine = new CommonEngine();

export async function netlifyCommonEngineHandler(): Promise<Response> {
  // This is the ONLY thing the Edge Function will execute
  return await render(commonEngine);
}
