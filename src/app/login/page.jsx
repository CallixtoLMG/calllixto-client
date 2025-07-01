"use client";
import { login } from "@/api/login";
import LoginForm from "@/components/Login";
import { signOut } from "@aws-amplify/auth";
import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    signOut();
    localStorage.removeItem('token');
    sessionStorage.removeItem("userData");
  }, []);
  return <LoginForm onSubmit={login} />;
};

export default Login;
