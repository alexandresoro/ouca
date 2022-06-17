type AppConfig = {
  apiUrl: string;
};

export const onRequestGet: PagesFunction<{ API_URLS?: KVNamespace }> = async ({ request, env }) => {
  const url = new URL(request.url);

  const appConfig = await env.API_URLS?.get<AppConfig>(url.hostname, "json");

  const response = new Response(JSON.stringify(appConfig));
  response.headers.set("Content-Type", "application/json");

  return response;
};
