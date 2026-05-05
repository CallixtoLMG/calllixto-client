"use client";
import { login } from "@/api/login";
import LoginForm from "@/components/Login";
import { clearSession } from "@/services/session";
import { signOut } from "@aws-amplify/auth";
import { useEffect } from "react";

const Login = () => {
  useEffect(() => {
    signOut();
    clearSession();
  }, []);
  return <LoginForm onSubmit={login} />;
};

export default Login;
