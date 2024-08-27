# Spare Cores web interface and public homepage

This is  an Angular 17.2.3 project to provide the public homepage of
the Spare Cores project and ecosystem at sparecores.com.

## Prerequisites

To compile the project, you need to set up the below environment variables:

- NG_APP_BACKEND_BASE_URI: [Keeper API](https://github.com/SpareCores/sc-keeper)
  endpoint to be used on the client-side
- NG_APP_BACKEND_BASE_URI_SSR: [Keeper API](https://github.com/SpareCores/sc-keeper)
  endpoint to be used on the server-side

This can also be done via defining an `.env` file based on the
provided `.env.example` template file.

You also need to provide your own Terms of Service and Privacy Policy
documents as markdown files with YAML front matter (title, date,
priority) under the `src/assets/legal` path.

Blog posts are written as markdown files with YAML front matter
(title, date, teaser, image, image_alt, author, tags) under the
`src/assets/articles` path.

Survey.js JSON files can be placed under `src/assets/surveys` for
serving under the `/survey/{filename}` path. Note that you might need
to adjust how the results are being stored.

Optionally, you can also link a Posthog project to anonymously track
page visits, clicks etc via the following environment variables:

- NG_APP_POSTHOG_KEY: The Posthog project token
- NG_APP_POSTHOG_HOST: The Posthog tracking API endpoint,
  e.g. https://us.i.posthog.com

Optionally, you can also use and configure Sentry by setting the
following environment variable(s):

- NG_APP_SENTRY_DSN
- NG_APP_SENTRY_TRACE_SAMPLE_RATE (default to 0)
- NG_APP_SENTRY_PROFILE_SAMPLE_RATE (default to 0)
- NG_APP_SENTRY_ENVIRONMENT (default to "development")

## Development server

Run `ng serve` for a dev server, which listens on `http://localhost:4200/` by default.
The application will automatically reload if you change any of the source files.

You might also want to run the [Keeper API](https://github.com/SpareCores/sc-keeper)
locally to modify the backend for searching cloud compute resources.

## Production site and server

Run `ng build` to build the project. The build artifacts will be
stored in the `dist/` directory.

Note that the project heavily relies on SSR, so you will need a
node.js backend running to serve requests.

## Linting tools

Run `ng lint` to check code formatting on all `ts` and `html` files.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your
choice. To use this command, you need to first add a package that
implements end-to-end testing capabilities.

## License

Please see the bundled `LICENSE.md` file.

## Further help

Please open a [GitHub ticket](https://github.com/SpareCores/sc-www/issues/new)
in case of any questions or problems.
