export const onRequestGet: PagesFunction = async ({ request }) => {
  const headersIt = request.headers.entries();

  let headers = {};

  let result = headersIt.next();
  while (!result.done) {
    const [key, value] = result.value;
    headers[key] = value;
    result = headersIt.next();
  }
  const cf = request.cf;
  return new Response(
    JSON.stringify({
      headers
    })
  );
};
