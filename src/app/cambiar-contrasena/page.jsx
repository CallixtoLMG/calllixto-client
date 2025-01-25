"use client";
import { login } from "@/api/login";
import ChangePasswordForm from "../../components/changePassword";

const ChangePassword = () => {
  return (<ChangePasswordForm onSubmit={login} />)
};

export default ChangePassword;