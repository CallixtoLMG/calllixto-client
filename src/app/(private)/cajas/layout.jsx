"use client";
import { useUserContext } from "@/User";
import { PAGES } from "@/common/constants";
import { MainContainer, SubContainer } from "@/commonStyles";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import 'semantic-ui-css/semantic.min.css';

export default function RootLayout({ children }) {
  const { userData, role } = useUserContext();
  const { push } = useRouter();
  const canManageUsers = RULES.canManageUsers[role];

  useEffect(() => {
    if (userData?.isAuthorized && !canManageUsers) {
      push(PAGES.NOT_FOUND.BASE);
    }
  }, [canManageUsers, push, userData?.isAuthorized]);

  if (!canManageUsers) {
    return null;
  }

  return (
    <MainContainer>
      <SubContainer>
        {children}
      </SubContainer>
    </MainContainer>
  );
};
