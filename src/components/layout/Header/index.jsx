import { useUserContext } from "@/User";
import { Flex, Icon, Label } from "@/common/components/custom";
import { KeyboardShortcuts } from "@/common/components/modals";
import { DEFAULT_SELECTED_CLIENT, ICONS, PAGES } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { Button, Menu } from "semantic-ui-react";
import UserMenu from "../UserMenu";
import { Container, MenuItem, ModLink, RigthHeaderDiv, Text } from "./styles";

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
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE, PAGES.RESTORE_PASSWORD.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);

  const shortcutMapping = {
    [PAGES.CUSTOMERS.SHORTKEYS]: () => push(PAGES.CUSTOMERS.BASE),
    [PAGES.SUPPLIERS.SHORTKEYS]: () => push(PAGES.SUPPLIERS.BASE),
    [PAGES.BRANDS.SHORTKEYS]: () => push(PAGES.BRANDS.BASE),
    [PAGES.PRODUCTS.SHORTKEYS]: () => push(PAGES.PRODUCTS.BASE),
    [PAGES.BUDGETS.SHORTKEYS]: () => push(PAGES.BUDGETS.BASE),
  };

  useKeyboardShortcuts(shortcutMapping);
  return (
    <>
      {showHeader && (
        <Menu fixed="top">
          <Container>
            {!userData?.isAuthorized ? (
              <Flex>
                <RigthHeaderDiv>
                  <MenuItem displayNone onClick={handleLogout}>
                    <Button icon>
                      <Icon name={ICONS.USER} /> Ingresar
                    </Button>
                  </MenuItem>
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
                      <ModLink key={page.BASE} href={page.BASE}>
                        <MenuItem backgroundColor $active={pathname.includes(page.BASE)}>
                          <Text $active={pathname.includes(page.BASE)}>{page.NAME}</Text>
                        </MenuItem>
                      </ModLink>
                    ))}
                </Flex>
                <Flex>
                  <RigthHeaderDiv>
                    <KeyboardShortcuts />
                  </RigthHeaderDiv>
                  {isCallixtoUser(role) && (
                    <RigthHeaderDiv>
                      <Label height="36px">{userData.selectedClientId || DEFAULT_SELECTED_CLIENT}</Label>
                    </RigthHeaderDiv>
                  )}
                  <RigthHeaderDiv>
                    <UserMenu
                      trigger={
                        <Button icon>
                          <Icon padding="0 20px 0 0" name={ICONS.USER} />{userData.name}
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
