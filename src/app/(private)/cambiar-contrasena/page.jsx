"use client";
import { PAGES } from "@/common/constants";
import ChangePasswordForm from "@/components/changePassword";
import { useBreadcrumContext } from "@/components/layout";
import { useEffect } from "react";

const ChangePassword = () => {
  const { setLabels } = useBreadcrumContext();

  useEffect(() => {
    setLabels([{ name: PAGES.CHANGE_PASSWORD.NAME }]);
  }, [setLabels]);

  return (<ChangePasswordForm />)
};

export default ChangePassword;
