import { onRequestCommon } from "./_common";

export const onRequestPost = onRequestCommon;

export const onRequestGet: PagesFunction<{ API_URLS?: KVNamespace }> = async ({ request, env, next }) => {
  return Response.redirect(`https://www.google.com`, 308);
};
