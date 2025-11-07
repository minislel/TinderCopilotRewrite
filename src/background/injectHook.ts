const { fetch: origFetch } = window;
window.fetch = async (...args) => {
  console.log("fetch called with args:", args);
  const response = await origFetch(...args);

  response
    .clone()
    .json()
    .then((data) => console.log("intercepted response data:", data))
    .then((data) => {
      window.postMessage({ type: "FETCH_INTERCEPT", payload: data }, "*");
    })
    .catch((err) => console.error(err));

  return response;
};
