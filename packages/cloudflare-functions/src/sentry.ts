// Sentry proxy function
export const onRequestPost: PagesFunction = async ({ request }) => {
  try {
    // https://developer.mozilla.org/en-US/docs/Web/API/Request/clone
    // https://stackoverflow.com/questions/40497859/reread-a-response-body-from-javascripts-fetch
    const clonedRequest = request.clone();
    const body = await clonedRequest.text();
    const pieces = body.split("\n");

    // DSN is in the first JSON structure
    const header = JSON.parse(pieces[0]) as { dsn?: string };
    const dsnUrl = new URL(header?.dsn);
    const { host, pathname } = dsnUrl;

    // Project id is the part after the URL
    const projectId = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    const response = await fetch(`https://${host}/api${projectId}/envelope/`, {
      method: "POST",
      headers: { ...request.headers, "Content-Type": "application/x-sentry-envelope" },
      body: request.body,
    });

    return response;
  } catch (e) {
    console.log(e);
    return new Response("Invalid request", { status: 400 });
  }
};
