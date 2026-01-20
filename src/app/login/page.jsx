"use client";
import { login } from "@/api/login";
import { USER_DATA_KEY } from "@/common/constants";
import LoginForm from "@/components/Login";
import { signOut } from "@aws-amplify/auth";
import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    signOut();
    localStorage.removeItem('token');
    localStorage.removeItem(USER_DATA_KEY);
  }, []);
  return <LoginForm onSubmit={login} />;
};

export default Login;
