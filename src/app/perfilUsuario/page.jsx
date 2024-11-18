"use client";
import { login } from "@/api/login";
import ChangePasswordForm from "../../components/userProfile";

const userProfile = () => {
  return (<ChangePasswordForm onSubmit={login} />)
};

export default userProfile;