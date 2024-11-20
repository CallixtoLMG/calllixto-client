"use client";
import { login } from "@/api/login";
import RecoverPasswordForm from "../../components/recoverPassword";

const RecoverPassword = () => {
  return (<RecoverPasswordForm onSubmit={login} />)
};

export default RecoverPassword;