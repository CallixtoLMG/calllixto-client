import { useUserContext } from "@/User";
import { Flex } from "@/components/common/custom";
import { KeyboardShortcuts } from "@/components/common/modals";
import { DEFAULT_SELECTED_CLIENT, PAGES } from "@/constants";
import { isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { Button, Icon, Label, Menu } from "semantic-ui-react";
import UserMenu from "../UserMenu";
import { Container, LogDiv, ModLink, Text } from "./styles";

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
                <LogDiv>
                  <Menu.Item onClick={handleLogout}>
                    <Text>Ingresar</Text>
                  </Menu.Item>
                </LogDiv>
              </Flex>
            ) : (
              <>
                <Flex>
                  {Object.values(PAGES)
                    .filter((page) => !!page.NAME)
                    .map((page) => (
                      <ModLink key={page.BASE} $active={pathname.includes(page.BASE)} href={page.BASE}>
                        <Menu.Item>
                          <Text $active={pathname.includes(page.BASE)}>{page.NAME}</Text>
                        </Menu.Item>
                      </ModLink>
                    ))}
                </Flex>
                <Flex>
                  <KeyboardShortcuts />
                  {isCallixtoUser(role) && (
                    <LogDiv>
                      <Label>{userData.selectedClientId || DEFAULT_SELECTED_CLIENT}</Label>
                    </LogDiv>
                  )}
                  <LogDiv>
                    <UserMenu
                      trigger={
                        <Button icon>
                          <Icon name="bars" /> Menu
                        </Button>
                      }
                      onLogout={handleLogout}
                      onClientChange={handleClientChange}
                      userData={userData}
                    />
                  </LogDiv>
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
