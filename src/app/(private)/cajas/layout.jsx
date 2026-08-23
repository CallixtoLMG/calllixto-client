"use client";
import { useUserContext } from "@/User";
import { PAGES } from "@/common/constants";
import { MainContainer, SubContainer } from "@/commonStyles";
import { Loader } from "@/components/layout";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import 'semantic-ui-css/semantic.min.css';

export default function RootLayout({ children }) {
  const { userData } = useUserContext();
  const { push } = useRouter();
  const resolvedRole = userData?.roles?.[0] ?? userData?.role;
  const isUserResolved = userData?.isAuthorized === false || (userData?.isAuthorized && !!resolvedRole);
  const canManageUsers = !!RULES.canManageUsers[resolvedRole];

  useEffect(() => {
    if (isUserResolved && !canManageUsers) {
      push(PAGES.NOT_FOUND.BASE);
    }
  }, [canManageUsers, isUserResolved, push]);

  if (!isUserResolved) {
    return <Loader active />;
  }

  if (!canManageUsers) {
    return null;
  }

  return (
    <MainContainer>
      <SubContainer $embeddedInWorkspace>
        {children}
      </SubContainer>
    </MainContainer>
  );
};
