# SC-www

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.2.3.

## Prerequisites

To compile the project, you need to set up the below environment variables:

- NG_APP_BACKEND_BASE_URI: [Keeper API](https://github.com/SpareCores/sc-keeper) endpoint to be used on the client-side
- NG_APP_BACKEND_BASE_URI_SSR: [Keeper API](https://github.com/SpareCores/sc-keeper) endpoint to be used on the server-side

This can also be done via defining an `.env` file based on the provided `.env.example` template file.

You also need to provide your own Terms of Service and Privacy Policy documents as a markdown file at the `src/assets/TOS.md` path.

## Development server

Run `ng serve` for a dev server, which listens on `http://localhost:4200/` by default.
The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component.
You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
