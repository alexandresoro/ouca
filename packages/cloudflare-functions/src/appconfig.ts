type AppConfig = {
  apiUrl: string;
};

// biome-ignore lint/style/useNamingConvention: <explanation>
export const onRequestGet: PagesFunction<{ API_URLS?: KVNamespace }> = async ({ request, env }) => {
  const url = new URL(request.url);

  const appConfig =
    (await env.API_URLS?.get<AppConfig>(url.hostname, "json")) ??
    (await env.API_URLS?.get<AppConfig>("default", "json"));

  const response = new Response(JSON.stringify(appConfig));
  response.headers.set("Content-Type", "application/json");

  return response;
};
