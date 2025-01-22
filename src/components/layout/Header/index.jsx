import { useUserContext } from "@/User";
import { LIST_BRANDS_QUERY_KEY } from "@/api/brands";
import { LIST_BUDGETS_QUERY_KEY } from "@/api/budgets";
import { LIST_CUSTOMERS_QUERY_KEY } from "@/api/customers";
import { LIST_EXPENSES_QUERY_KEY } from "@/api/expenses";
import { LIST_PRODUCTS_QUERY_KEY } from "@/api/products";
import { LIST_SUPPLIERS_QUERY_KEY } from "@/api/suppliers";
import { Flex } from '@/components/common/custom';
import { KeyboardShortcuts } from "@/components/common/modals";
import OptionsDropdown from "@/components/layout/OptionsHeader";
import { COLORS, DEFAULT_SELECTED_CLIENT, ENTITIES, PAGES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from 'next/navigation';
import { Dropdown, Icon, Menu } from 'semantic-ui-react';
import { Container, LogDiv, ModLink, Text } from "./styles";

const Header = () => {
  const pathname = usePathname();
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const entityMapping = {
    [PAGES.CUSTOMERS.BASE]: { entity: ENTITIES.CUSTOMERS, queryKey: LIST_CUSTOMERS_QUERY_KEY, text: PAGES.CUSTOMERS.NAME },
    [PAGES.PRODUCTS.BASE]: { entity: ENTITIES.PRODUCTS, queryKey: LIST_PRODUCTS_QUERY_KEY, text: PAGES.PRODUCTS.NAME },
    [PAGES.BUDGETS.BASE]: { entity: ENTITIES.BUDGETS, queryKey: LIST_BUDGETS_QUERY_KEY, text: PAGES.BUDGETS.NAME },
    [PAGES.BRANDS.BASE]: { entity: ENTITIES.BRANDS, queryKey: LIST_BRANDS_QUERY_KEY, text: PAGES.BRANDS.NAME },
    [PAGES.SUPPLIERS.BASE]: { entity: ENTITIES.SUPPLIERS, queryKey: LIST_SUPPLIERS_QUERY_KEY, text: PAGES.SUPPLIERS.NAME },
    [PAGES.EXPENSES.BASE]: { entity: ENTITIES.EXPENSES, queryKey: LIST_EXPENSES_QUERY_KEY, text: PAGES.EXPENSES.NAME },
  };

  const currentEntity = Object.keys(entityMapping).find(key => pathname.includes(key))
    ? entityMapping[pathname]
    : null;

  const handleClientChange = (event, data) => {
    const userData = JSON.parse(sessionStorage.getItem("userData"));
    sessionStorage.setItem("userData", JSON.stringify({ ...userData, selectedClientId: data.value }));
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
                    <ModLink key={page.BASE} $active={pathname.includes(page.BASE)} href={page.BASE}>
                      <Menu.Item><Text $active={pathname.includes(page.BASE)}>{page.NAME}</Text></Menu.Item>
                    </ModLink>
                  ))}
                </Flex>
                <Flex>
                  <KeyboardShortcuts />
                  {currentEntity?.entity && currentEntity?.queryKey && (
                    <OptionsDropdown entity={currentEntity.entity} queryKey={currentEntity.queryKey} text={currentEntity.text} />
                  )}
                  {isCallixtoUser(role) && (
                    <LogDiv padding="8px">
                      <Dropdown
                        search
                        selection
                        defaultValue={userData.selectedClientId || DEFAULT_SELECTED_CLIENT}
                        options={userData.callixtoClients.map((client) => ({
                          key: client,
                          text: client,
                          value: client,
                        }))}
                        onChange={handleClientChange}
                      />
                    </LogDiv>
                  )}
                  <LogDiv>
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
                  </LogDiv>
                </Flex>
              </>
            )}
          </Container>
        </Menu>
      }
    </>
  );
};

export default Header;
