const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  //console.log("fetch called with args:", args);
  const response = await origFetch(...args);
  const clonedEndpoint = args[0];

  response
    .clone()
    .json()
    .then((data) => console.log("intercepted response data:", data))
    .catch((err) => console.error(err));
  window.postMessage(
    {
      type: "FETCH_INTERCEPT",
      payload: await response.clone().json(),
      endpoint: clonedEndpoint,
    },
    "*"
  );

  return response;
};
