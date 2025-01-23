import { useUserContext } from "@/User";
import { Dropdown, Flex, Icon } from "@/components/common/custom";
import { KeyboardShortcuts } from "@/components/common/modals";
import { DEFAULT_SELECTED_CLIENT, ICONS, PAGES } from "@/constants";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { Button, Label, Menu } from "semantic-ui-react";
import UserMenu from "../UserMenu";
import { Container, LeftHeaderDiv, ModLink, RigthHeaderDiv, Text } from "./styles";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";

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

  const handleUserManagement = () => {
    push(PAGES.CHANGE_PASSWORD.BASE);
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
                <LeftHeaderDiv>
                  <Menu.Item onClick={handleLogout}>
                    <Text>Ingresar</Text>
                  </Menu.Item>
                </LeftHeaderDiv>
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
                          <Icon name={ICONS.USER} /> Usuario
                        </Button>
                      }
                      onLogout={handleLogout}
                      onClientChange={handleClientChange}
                      userData={userData}
                    />
                  </RigthHeaderDiv>
                  <Dropdown
                    text={(
                      <>
                        <Icon color={COLORS.GREY} name="user" />
                        {`${userData.name}` || 'Usuario'}
                      </>
                    )}
                    pointing="top right"
                    className="link item"
                  >
                    <Dropdown.Menu>
                      <Dropdown.Item onClick={handleLogout}>
                        <Icon color={COLORS.RED} name="log out" />
                        Cerrar sesión
                      </Dropdown.Item>
                      {RULES.canUpdate[role] &&
                        <Dropdown.Item onClick={handleUserManagement}>
                          <Icon color={COLORS.ORANGE} name="settings" />
                          Cambiar contraseña
                        </Dropdown.Item>}
                    </Dropdown.Menu>
                  </Dropdown>
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
