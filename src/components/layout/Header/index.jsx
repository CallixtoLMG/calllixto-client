import { useUserContext } from "@/User";
import { Flex, Icon } from "@/components/common/custom";
import { KeyboardShortcuts } from "@/components/common/modals";
import { DEFAULT_SELECTED_CLIENT, ICONS, PAGES } from "@/constants";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { Button, Label, Menu } from "semantic-ui-react";
import UserMenu from "../UserMenu";
import { Container, ModLink, RigthHeaderDiv, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData, role } = useUserContext();

  const handleClientChange = (client) => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    sessionStorage.setItem("userData", JSON.stringify({ ...userData, selectedClientId: client }));
    location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);

  return (
    <>
      {showHeader && (
        <Menu fixed="top">
          <Container>
            {!userData?.isAuthorized ? (
              <Flex>
                <RigthHeaderDiv>
                  <Menu.Item onClick={handleLogout}>
                    <Text>Ingresar</Text>
                  </Menu.Item>
                </RigthHeaderDiv>
              </Flex>
            ) : (
              <>
                <Flex>
                  {Object.values(PAGES)
                    .filter((page) => {
                      if (!page.NAME) return false;
                      if (page.NAME === PAGES.SETTINGS.NAME) {
                        return RULES.canUpdate[role];
                      }
                      return true;
                    })
                    .map((page) => (
                      <ModLink key={page.BASE} $active={pathname.includes(page.BASE)} href={page.BASE}>
                        <Menu.Item>
                          <Text $active={pathname.includes(page.BASE)}>{page.NAME}</Text>
                        </Menu.Item>
                      </ModLink>
                    ))}
                </Flex>
                <Flex>
                  <RigthHeaderDiv>
                    <KeyboardShortcuts />
                  </RigthHeaderDiv>
                  {isCallixtoUser(role) && (
                    <RigthHeaderDiv>
                      <Label>{userData.selectedClientId || DEFAULT_SELECTED_CLIENT}</Label>
                    </RigthHeaderDiv>
                  )}
                  <RigthHeaderDiv>
                    <UserMenu
                      trigger={
                        <Button icon>
                          <Icon name={ICONS.USER} /> {userData.firstName}
                        </Button>
                      }
                      onLogout={handleLogout}
                      onClientChange={handleClientChange}
                      userData={userData}
                    />
                  </RigthHeaderDiv>
                </Flex>
              </>
            )}
          </Container>
        </Menu>
      )}
    </>
  );
};

export default Header;
