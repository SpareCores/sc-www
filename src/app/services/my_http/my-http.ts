import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, PLATFORM_ID } from "@angular/core";
import { FullRequestParams, HttpClient as HttpClientSDK, HttpResponse} from "../../../../sdk/http-client";
import { firstValueFrom } from "rxjs";

const RETRY_INTERVALS = [200, 500, 1000, 2000, 5000, 10000]; // in milliseconds
const RETRY_INTERVALS_SSR = [100, 200]; // in milliseconds

const BACKEND_BASE_URI = import.meta.env['NG_APP_BACKEND_BASE_URI'];
const BACKEND_BASE_URI_SSR = import.meta.env['NG_APP_BACKEND_BASE_URI_SSR'];

 // swagger-typescript-api
 export class MYHTTPClient extends HttpClientSDK {

    constructor(
        private httpClient: HttpClient,
        @Inject(PLATFORM_ID) private platformId: object) {
        super();
    }

    public override request = async <T = any, E = any>({ method, body, path, type, query }: FullRequestParams): Promise<HttpResponse<T, E>> => {
        const url = new URL((isPlatformBrowser(this.platformId) ? BACKEND_BASE_URI : BACKEND_BASE_URI_SSR) + path);

        if(query) {
          const queryStr = this.addQueryParams(query);
          url.search = queryStr;
        }

        const headers = new HttpHeaders({
            'Content-Type': type || 'application/json'
        });

        const response: any = await this._requestWithRetries(method, url, body, headers);

        return response;
    }

    private async _requestWithRetries(method: string | undefined, url: URL, body: any, headers: HttpHeaders, retry: number = 0): Promise<any> {
      let response: any;
      const observe = 'response';
      try {
          // Setting a body is forbidden on GET requests
          if (method === 'GET') {
              response = await firstValueFrom(this.httpClient.get(url.toString(), { headers, observe }));
          } else if (method === 'POST') {
              response = await firstValueFrom(this.httpClient.post(url.toString(), body, { headers, observe }));
          } else if (method === 'PATCH') {
              response = await firstValueFrom(this.httpClient.patch(url.toString(), body, { headers, observe }));
          } else if (method === 'DELETE') {
              response = await firstValueFrom(this.httpClient.delete(url.toString(), { headers, observe }));
          }

          return response;
      } catch (err: any) {
          if(err.status && err.status !== 500 && err.status !== 501 && err.status !== 502 && err.status !== 503 && err.status !== 504) {
            console.log('API exception');
            console.log(err.message);
            console.log(err.status);
            throw err;
          }

          if (retry < (isPlatformBrowser(this.platformId) ? RETRY_INTERVALS.length : RETRY_INTERVALS_SSR.length)) {
              console.log('Retrying request...');
              await new Promise(resolve => setTimeout(resolve, isPlatformBrowser(this.platformId) ? RETRY_INTERVALS[retry] : RETRY_INTERVALS_SSR[retry]));
              return this._requestWithRetries(method, url, body, headers, retry + 1);
          } else {
            console.log('API exception');
            console.log(err.message);
            console.log(err.status);
            throw err;
          }
      }
    }
}
