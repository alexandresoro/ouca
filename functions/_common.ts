export const onRequestCommon: PagesFunction<{ API_URLS?: KVNamespace }> = async ({ request, env, next }) => {
  const url = new URL(request.url);

  const apiUrl = await env.API_URLS?.get(url.hostname);

  if (!apiUrl) {
    const res = await next();
    return res;
  } else {
    return Response.redirect(`${apiUrl}${url.pathname}`, 308);
  }
};
