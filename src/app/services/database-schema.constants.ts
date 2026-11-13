import openApiSpec from "../../../sdk/openapi.json";

export type OpenApiProperty = {
  description?: string;
};

export const DATABASE_SCHEMA_PROPERTIES: Record<string, OpenApiProperty> =
  (
    openApiSpec as {
      components?: {
        schemas?: {
          Database?: {
            properties?: Record<string, OpenApiProperty>;
          };
        };
      };
    }
  ).components?.schemas?.Database?.properties ?? {};
