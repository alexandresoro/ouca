import type { CodegenConfig } from "@graphql-codegen/cli";

const config: CodegenConfig = {
  overwrite: true,
  schema: "src/model/schema.graphql",
  documents: [
    "src/**/*.tsx",
    "!src/components/SettingsPage.tsx",
    "!src/components/manage/classe/ClasseTable.tsx",
    "!src/components/manage/commune/*Table.tsx",
    "!src/components/manage/comportement/*Table.tsx",
    "!src/components/manage/departement/*Table.tsx",
    "!src/components/manage/espece/*Table.tsx",
    "!src/components/manage/estimation-distance/*Table.tsx",
    "!src/components/manage/estimation-nombre/*Table.tsx",
    "!src/components/manage/lieu-dit/*Table.tsx",
    "!src/components/manage/meteo/*Table.tsx",
    "!src/components/manage/milieu/*Table.tsx",
    "!src/components/manage/sexe/*Table.tsx",
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
