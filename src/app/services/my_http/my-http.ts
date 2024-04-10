import { isPlatformBrowser } from "@angular/common";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Inject, PLATFORM_ID } from "@angular/core";
import { FullRequestParams, HttpClient as HttpClientSDK, HttpResponse} from "../../../../sdk/http-client";
import { firstValueFrom } from "rxjs";


const BACKEND_BASE_URI = 'http://localhost:8000';
const BACKEND_BASE_URI_SSR = 'http://localhost:8000';
const RETRY_INTERVALS = [200, 500, 1000, 2000, 5000, 10000]; // in milliseconds

 // swagger-typescript-api
 export class MYHTTPClient<Data> extends HttpClientSDK {

    constructor(
        private httpClient: HttpClient,
        @Inject(PLATFORM_ID) private platformId: object) {
        super();
    }

    public override request = async <T = any, E = any>({ method, body, secure, path, type, query, format, baseUrl, cancelToken, ...params }: FullRequestParams): Promise<HttpResponse<T, E>> => {
        const url = new URL((isPlatformBrowser(this.platformId) ? BACKEND_BASE_URI : BACKEND_BASE_URI_SSR) + path);

        if(query) {
          const queryStr = this.addQueryParams(query);
          console.log('Query string:', queryStr);

          url.search = queryStr;
        }

        let headers = new HttpHeaders({
            'Content-Type': type || 'application/json',
        });

        let response: any = await this._requestWithRetries(method, url, body, headers);

        try {
            // Setting a body is forbidden on GET requests
            if (method === 'GET') {
                response = await firstValueFrom(this.httpClient.get(url.toString(), { headers }));
            } else if (method === 'POST') {
                response = await firstValueFrom(this.httpClient.post(url.toString(), body, { headers }));
            } else if (method === 'PATCH') {
                response = await firstValueFrom(this.httpClient.patch(url.toString(), body, { headers }));
            } else if (method === 'DELETE') {
                response = await firstValueFrom(this.httpClient.delete(url.toString(), { headers }));
            }

            return response;
        } catch (err: any) {
            console.log('API exception');
            console.log(err.message);
            console.log(err.status);
            throw err;
        }
    }

    private async _requestWithRetries(method: string | undefined, url: URL, body: any, headers: HttpHeaders, retry: number = 0): Promise<any> {
      let response: any;

      try {
          // Setting a body is forbidden on GET requests
          if (method === 'GET') {
              response = await firstValueFrom(this.httpClient.get(url.toString(), { headers }));
          } else if (method === 'POST') {
              response = await firstValueFrom(this.httpClient.post(url.toString(), body, { headers }));
          } else if (method === 'PATCH') {
              response = await firstValueFrom(this.httpClient.patch(url.toString(), body, { headers }));
          } else if (method === 'DELETE') {
              response = await firstValueFrom(this.httpClient.delete(url.toString(), { headers }));
          }

          return response;
      } catch (err: any) {
          if (retry < RETRY_INTERVALS.length) {
              console.log('Retrying request...');
              await new Promise(resolve => setTimeout(resolve, RETRY_INTERVALS[retry]));
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
