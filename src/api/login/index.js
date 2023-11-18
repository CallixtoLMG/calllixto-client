import { CLIENTID, PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function login(data) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    redirect: "follow",
    Headers: {
      'Content-type': 'application-json'
    },
    cache: "no-store"
  };

  const response = await fetch(`${URL}${CLIENTID}${PATHS.LOGIN}`, requestOptions);
  let res = await response.text()
  res = JSON.parse(res)
  if (res.statusOk) {
    toast.success("Ingreso exitoso");
  } else {
    toast.error(res.message);
  };
};