"use client";
import { login } from "@/api/login";
import LoginForm from "@/components/Login";

const Login = () => {
  return (<LoginForm onSubmit={login} />)
};

export default Login;
