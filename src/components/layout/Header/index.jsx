'use client';
import { useUserContext } from "@/User";
import { Flex, Icon, Label } from "@/common/components/custom";
import { KeyboardShortcuts, ModalUpdates } from "@/common/components/modals";
import { DEFAULT_SELECTED_CLIENT, ICONS, PAGES } from "@/common/constants";
import { useKeyboardShortcuts } from "@/hooks";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Menu } from "semantic-ui-react";
import UserMenu from "../UserMenu";
import { Container, MenuBadge, MenuItem, ModLink, RigthHeaderDiv, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const [selectedClientId, setSelectedClientId] = useState(DEFAULT_SELECTED_CLIENT);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const client = localStorage.getItem("selectedClientId") ?? DEFAULT_SELECTED_CLIENT;
      localStorage.setItem("selectedClientId", client);
      setSelectedClientId(client);
    }
  }, []);

  const handleClientChange = (client) => {
    localStorage.setItem("selectedClientId", client);
    setSelectedClientId(client);
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
    [PAGES.EXPENSES.SHORTKEYS]: () => push(PAGES.EXPENSES.BASE),
    [PAGES.USERS.SHORTKEYS]: () => push(PAGES.USERS.BASE),
    [PAGES.SETTINGS.SHORTKEYS]: () => push(PAGES.SETTINGS.BASE),
    [PAGES.CASH_BALANCES.SHORTKEYS]: () => push(PAGES.CASH_BALANCES.BASE),
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
                  <MenuItem $displayNone onClick={handleLogout}>
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

                      if (page.NAME === PAGES.USERS.NAME) {
                        return isCallixtoUser(role);
                      }

                      if (page.NAME === PAGES.SETTINGS.NAME) {
                        return RULES.canUpdate[role];
                      }

                      return true;
                    })
                    .map((page) => (
                      <ModLink key={page.BASE} href={page.BASE}>
                        <MenuItem
                          $backgroundColor
                          $active={pathname.includes(page.BASE)}
                          $hasBadge={Boolean(page.BADGE)}
                        >
                          <Text padding="0px" $active={pathname.includes(page.BASE)}>
                            {page.NAME}
                          </Text>
                          {page.BADGE && (
                            <MenuBadge $variant={page.BADGE}>
                              {{
                                new: 'Nuevo',
                                trial: 'Prueba',
                                pro: 'Pro',
                              }[page.BADGE]}
                            </MenuBadge>
                          )}
                        </MenuItem>
                      </ModLink>
                    ))}
                </Flex>
                <Flex>
                  <RigthHeaderDiv>
                    <Flex $columnGap="10px">
                      <ModalUpdates />
                      <KeyboardShortcuts />
                    </Flex>
                  </RigthHeaderDiv>
                  {isCallixtoUser(role) && (
                    <RigthHeaderDiv>
                      <Label height="36px">{selectedClientId}</Label>
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
                      selectedClient={selectedClientId}
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
