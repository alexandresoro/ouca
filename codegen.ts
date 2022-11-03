import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/model/schema.graphql",
  documents: [
    "src/**/*.tsx",
    "!src/components/SettingsPage.tsx",
    "!src/components/manage/classe/*.tsx",
    "!src/components/manage/commune/*.tsx",
    "!src/components/manage/comportement/*.tsx",
    "!src/components/manage/departement/*.tsx",
    "!src/components/manage/espece/*.tsx",
    "!src/components/manage/estimation-distance/*.tsx",
    "!src/components/manage/estimation-nombre/*.tsx",
    "!src/components/manage/lieu-dit/*.tsx",
    "!src/components/manage/meteo/*.tsx",
    "!src/components/manage/milieu/*.tsx",
    "!src/components/manage/sexe/*.tsx",
    "!src/components/view/DonneeTable.tsx",
    "!src/components/view/DonneesByEspeceTable.tsx",
  ],
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
