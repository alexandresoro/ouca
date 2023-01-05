import cpy from "cpy";

await cpy(["../common/*.graphql"], "dist");
