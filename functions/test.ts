export async function onRequest(context) {
  const { request, env, next } = context;

  const url = new URL(request.url);

  const apiUrl = await env.API_URLS.get(url.hostname);

  if (!apiUrl) {
    const res = await next();
    return res;
  } else {
    return Response.redirect(`${apiUrl}${url.pathname}`, 302);
  }
}
