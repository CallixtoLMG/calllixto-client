"use client";
import { login } from "@/api/login";
import LoginForm from "@/components/Login";
import { clearSession, consumeSessionEndedNotification } from "@/services/session";
import { signOut } from "@aws-amplify/auth";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const Login = () => {
  useEffect(() => {
    if (consumeSessionEndedNotification()) {
      toast.error("Tu sesión finalizó. Volvé a ingresar para continuar.");
    }

    signOut();
    clearSession();
  }, []);
  return <LoginForm onSubmit={login} />;
};

export default Login;
