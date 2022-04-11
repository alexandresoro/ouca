export const onRequestGet: PagesFunction<{ API_URLS?: KVNamespace }> = async ({ request, env }) => {
  const url = new URL(request.url);

  const apiUrl = await env.API_URLS?.get(url.hostname);

  const appConfig = {
    apiUrl: apiUrl ?? ""
  };

  const response = new Response(JSON.stringify(appConfig));
  response.headers.set("Content-Type", "application/json");

  return response;
};
