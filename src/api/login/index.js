import { PATHS, URL, USERS } from "@/fetchUrls";
import { toast } from "react-hot-toast";

export async function login(data) {
  var requestOptions = {
    method: 'POST',
    body: JSON.stringify(data),
    cache: "no-store"
  };

  const response = await fetch(`${URL}${USERS}${PATHS.LOGIN}`, requestOptions);
  let res = await response.text()
  res = JSON.parse(res)
  console.log(res)
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
    try {
      const info = await fetch(`${URL}validate`, requestOptions);

    } catch (error) {
      console.log(error)
      console.log(`${URL}validate`)
    }
  } else {
    toast.error(res.message);
  };
};

// export async function validateToken() {

//   const tokenValidated = sessionStorage.getItem("tokenValidated")
//   if (tokenValidated) {
//     return [true, ["admin", "users"]]
//   };

//   const requestOptions = {
//     method: 'POST',
//     cache: "no-store",
//     headers: {
//       authorization: `Bearer ${accessToken}`
//     },
//   };

//   const response = await fetch(`${URL}validate`, requestOptions);
//   let res = await response.text()
//   if (true) {
//     sessionStorage.setItem("tokenValidated", true)
//     sessionStorage.setItem("roles", ["admin", "users"])
//     return [true, ["admin", "users"]]
//   }
// };