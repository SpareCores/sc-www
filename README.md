# Spare Cores web interface and public homepage

This is an Angular 20 project to provide the public homepage of
the Spare Cores project and ecosystem at sparecores.com.

## Prerequisites

To compile the project, you need to set up the below environment variables at build time:

- NG_APP_BACKEND_BASE_URI: [Keeper API](https://github.com/SpareCores/sc-keeper)
  endpoint to be used on the client-side
- NG_APP_BACKEND_BASE_URI_SSR: [Keeper API](https://github.com/SpareCores/sc-keeper)
  endpoint to be used on the server-side

This can also be done via defining an `.env` file based on the provided `.env.example` template file.

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

You can configure Sentry by setting the following environment variable(s).
Note that NG_APP_SENTRY_DSN must be defined (though it can be left empty to disable Sentry):
You can configure Sentry by setting the following environment variable(s).
Note that NG_APP_SENTRY_DSN must be defined (though it can be left empty to disable Sentry):

- NG_APP_SENTRY_DSN (key is mandatory but you can leave the value empty)
- NG_APP_SENTRY_DSN (key is mandatory but you can leave the value empty)
- NG_APP_SENTRY_TRACE_SAMPLE_RATE (default to 0)
- NG_APP_SENTRY_PROFILE_SAMPLE_RATE (default to 0)
- NG_APP_SENTRY_ENVIRONMENT (default to "development")
- NG_APP_SENTRY_RELEASE

The server-side (runtime) environment variables for sending emails (e.g. on the contact form) are:

- SMTP_HOST
- SMTP_PORT
- SMTP_USER
- SMTP_PASS
- CONTACT_FORM_TO
- CONTACT_FORM_FROM
- POW_SECRET_KEY: the secret key for signing the the Proof of Work (POW) challenges to deterrent spam bots

If you need to update the Keeper SDK, use the `generate-api(-prod)` script.

## Development server

Run `ng serve` for a dev server, which listens on `http://localhost:4200/` by default.
The application will automatically reload if you change any of the source files.

You might also want to run the [Keeper API](https://github.com/SpareCores/sc-keeper)
locally to modify the backend for searching cloud compute resources.

## Production site and server

Run `ng build` to build the project. The build artifacts will be
stored in the `dist/` directory.

Note that the project heavily relies on SSR, so you will need a
node.js backend running to serve requests. You can set the
`ENABLE_PERFORMANCE_PROFILER` env var to `true` to get performance
metrics on the SSR steps.

## Linting tools

Run `ng lint` to check code formatting on all `ts` and `html` files.

## Formatting tools

Run `npm run prettier:check` to check code style on all required files.

Run `npm run prettier:fix` to fix code style on all required files.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

End-to-end tests are implemented using Cypress.

## License

Please see the bundled `LICENSE.md` file.

## Further help

Please open a [GitHub ticket](https://github.com/SpareCores/sc-www/issues/new)
in case of any questions or problems.
