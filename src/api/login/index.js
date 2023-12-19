import { PATHS, URL } from "@/fetchUrls";

const loginRequestOptions = {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  cache: "no-store"
};

export async function login(data) {
  const response = await fetch(`${URL}${PATHS.LOGIN}`, {
    ...loginRequestOptions,
    body: JSON.stringify(data),
  });
  const res = await response.json();
  if (res.$metadata?.httpStatusCode) {
    const accessToken = res.AuthenticationResult.AccessToken;
    localStorage.setItem("token", accessToken);
    return true;
  } else {
    return false;
  };
};

