export const onRequestGet: PagesFunction = async ({ request }) => {
  const headers = request.headers.entries();
  const cf = request.cf;
  return new Response(
    JSON.stringify({
      headers,
      cf
    })
  );
};
