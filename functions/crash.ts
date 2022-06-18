// Sentry proxy function
export const onRequestPost: PagesFunction = async ({ request, env }) => {
  try {
    const body = await request.text();
    const pieces = body.split("\n");

    // DSN is in the first JSON structure
    const header = JSON.parse(pieces[0]);

    const response = await fetch(header?.dsn, {
      method: "POST",
      body
    });

    return response;
  } catch (e) {
    return new Response(`Invalid request`, { status: 400 });
  }
};
