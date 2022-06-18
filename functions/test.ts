export const onRequestGet: PagesFunction = async ({ request }) => {
  const headers = request.headers;
  const cf = request.cf;
  return new Response(
    JSON.stringify({
      headers
    })
  );
};
