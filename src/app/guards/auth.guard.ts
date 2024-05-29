import { CanActivateFn } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { inject } from '@angular/core';
import { map, take } from 'rxjs';

export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthenticationService);

  return authService.authedState.pipe(
    take(1),
    map((isAuthenticated) => {
      if (isAuthenticated) {
        return true
      } else {
        authService.authenticate();
        return authService.isLoggedIn();
      }
    })
  );

};
