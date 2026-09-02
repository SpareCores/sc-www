import { isPlatformBrowser } from "@angular/common";
import { HttpInterceptorFn } from "@angular/common/http";
import { PLATFORM_ID, inject } from "@angular/core";
import { from, switchMap } from "rxjs";
import { Auth } from "../../services/auth/auth";

const WWW_API_BASE_URI =
  import.meta?.env?.NG_APP_WWW_API_BASE_URI?.replace(/\/$/, "") || "";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const platformId = inject(PLATFORM_ID);

  if (!isPlatformBrowser(platformId)) {
    return next(req);
  }

  if (!WWW_API_BASE_URI || !req.url.startsWith(WWW_API_BASE_URI)) {
    return next(req);
  }

  const auth = inject(Auth);

  return from(auth.getToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      return next(
        req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      );
    }),
  );
};
