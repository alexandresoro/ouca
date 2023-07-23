import camelcase from "camelcase";
import type { Field, Interceptor, QueryResultRow } from "slonik";

// From https://github.com/gajus/slonik-interceptor-field-name-transformation/blob/master/src/factories/createFieldNameTransformationInterceptor.ts
const underscoreFieldRegex = /^[a-z0-9_]+$/u;

const underscoreFieldTest = (field: Field) => {
  return underscoreFieldRegex.test(field.name);
};

type SandboxFormattedField = {
  formatted: string;
  original: string;
};

export const createFieldNameTransformationToCamelcaseInterceptor = (): Interceptor => {
  return {
    transformRow: (context, query, row, fields) => {
      if (!context.sandbox.formattedFields) {
        context.sandbox.formattedFields = [];

        for (const field of fields) {
          (context.sandbox.formattedFields as SandboxFormattedField[]).push({
            formatted: underscoreFieldTest(field) ? camelcase(field.name) : field.name,
            original: field.name,
          });
        }
      }

      const { formattedFields } = context.sandbox;

      const transformedRow: QueryResultRow = {};

      for (const field of formattedFields as SandboxFormattedField[]) {
        if (typeof field.formatted !== "string") {
          throw new TypeError("Unexpected field name type.");
        }

        transformedRow[field.formatted] = row[field.original];
      }

      return transformedRow;
    },
  };
};
