import { PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";
import { CALLIXTO } from "../../fetchUrls";

export async function login(data) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    cache: "no-store"
  };

  const response = await fetch(`${URL}${CALLIXTO}${PATHS.LOGIN}`, requestOptions);
  let res = await response.text();
  res = JSON.parse(res);
  if (res.$metadata.httpStatusCode) {
    toast.success("Ingreso exitoso");
    const accessToken = res.AuthenticationResult.AccessToken;
    localStorage.setItem("token", accessToken);
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      cache: "no-store",
      headers: {
        authorization: `Bearer ${accessToken}`
      },
    };
  } else {
    toast.error(res.message);
  };
};

