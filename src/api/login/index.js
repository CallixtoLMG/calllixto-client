import { PATHS, URL } from "@/fetchUrls";
import { toast } from "react-hot-toast";

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
    toast.success("Ingreso exitoso");
    const accessToken = res.AuthenticationResult.AccessToken;
    localStorage.setItem("token", accessToken);
    return true;
 } else {
    toast.error(res.message);
    return false;
 };
};

