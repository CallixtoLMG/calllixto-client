import { useUserContext } from "@/User";
import { NoPrint } from "@/components/layout";
import { DEFAULT_SELECTED_CLIENT, PAGES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from 'next/navigation';
import { Flex } from "rebass";
import { Dropdown, Menu } from 'semantic-ui-react';
import { Container, LogDiv, ModLink, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData, role } = useUserContext();

  const handleClientChange = (event, data) => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    sessionStorage.setItem("userData", JSON.stringify({ ...userData, selectedClientId: data.value }));
    location.reload();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    sessionStorage.removeItem("userData");
    push(PAGES.LOGIN.BASE);
  };

  const routesWithoutHeader = [PAGES.LOGIN.BASE];
  const showHeader = !routesWithoutHeader.includes(pathname);
  const shortcutMapping = {
    [PAGES.CUSTOMERS.SHORTKEY]: () => push(PAGES.CUSTOMERS.BASE),
    [PAGES.SUPPLIERS.SHORTKEY]: () => push(PAGES.SUPPLIERS.BASE),
    [PAGES.BRANDS.SHORTKEY]: () => push(PAGES.BRANDS.BASE),
    [PAGES.PRODUCTS.SHORTKEY]: () => push(PAGES.PRODUCTS.BASE),
    [PAGES.BUDGETS.SHORTKEY]: () => push(PAGES.BUDGETS.BASE),
  };
  useKeyboardShortcuts(shortcutMapping);

  return (
    <NoPrint>
      {showHeader &&
        <Menu fixed='top'>
          <Container>
            {!userData?.isAuthorized ? (
              <Flex>
                <LogDiv>
                  <Menu.Item onClick={handleLogout}><Text>Ingresar</Text></Menu.Item>
                </LogDiv>
              </Flex>
            ) : (
              <>
                <Flex>
                  {Object.values(PAGES).filter(page => !!page.NAME).map(page => (
                    <ModLink key={page.BASE} destacar={pathname.includes(page.BASE)} href={page.BASE}>
                      <Menu.Item><Text destacar={pathname.includes(page.BASE)}>{page.NAME}</Text></Menu.Item>
                    </ModLink>
                  ))}
                </Flex>
                <Flex>
                  {isCallixtoUser(role) &&
                    <LogDiv padding="8px">
                      <Dropdown
                        search
                        selection
                        defaultValue={userData.selectedClientId || DEFAULT_SELECTED_CLIENT}
                        options={userData.callixtoClients.map((client) =>
                        ({
                          key: client,
                          text: client,
                          value: client,
                        }))}
                        onChange={handleClientChange}
                      />
                    </LogDiv>
                  }
                  <LogDiv>
                    <Menu.Item onClick={handleLogout}><Text>Cerrar sesión</Text></Menu.Item>
                  </LogDiv>
                </Flex>
              </>
            )}
          </Container>

        </Menu>
      }
    </NoPrint>
  );
};

export default Header;
