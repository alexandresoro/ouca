import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/model/schema.graphql",
  documents: ["src/**/*.tsx"],
  ignoreNoDocuments: true,
  generates: {
    "src/gql/": {
      preset: "client",
      plugins: [],
      config: {
        useTypeImports: true,
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
