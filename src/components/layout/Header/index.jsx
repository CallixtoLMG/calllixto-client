import { useUserContext } from "@/User";
import { LIST_BRANDS_QUERY_KEY } from "@/api/brands";
import { LIST_BUDGETS_QUERY_KEY } from "@/api/budgets";
import { LIST_CUSTOMERS_QUERY_KEY } from "@/api/customers";
import { LIST_PRODUCTS_QUERY_KEY } from "@/api/products";
import { LIST_SETTINGS_QUERY_KEY } from "@/api/settings";
import { LIST_SUPPLIERS_QUERY_KEY } from "@/api/suppliers";
import { Flex, Icon } from "@/components/common/custom";
import { KeyboardShortcuts } from "@/components/common/modals";
import { DEFAULT_SELECTED_CLIENT, ENTITIES, ICONS, PAGES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { RULES, isCallixtoUser } from "@/roles";
import { usePathname, useRouter } from "next/navigation";
import { Button, Label, Menu } from "semantic-ui-react";
import OptionsDropdown from "../HeaderDropdownOptions";
import UserMenu from "../UserMenu";
import { Container, ModLink, RigthHeaderDiv, Text } from "./styles";

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
    [PAGES.SETTINGS.BASE]: { entity: ENTITIES.SETTINGS, queryKey: LIST_SETTINGS_QUERY_KEY, text: PAGES.SETTINGS.NAME },
  };

  const currentEntity = Object.keys(entityMapping).find(key => pathname.includes(key))
    ? entityMapping[pathname]
    : null;

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

  const shortcutMapping = {
    [PAGES.CUSTOMERS.SHORTKEYS]: () => push(PAGES.CUSTOMERS.BASE),
    [PAGES.SUPPLIERS.SHORTKEYS]: () => push(PAGES.SUPPLIERS.BASE),
    [PAGES.BRANDS.SHORTKEYS]: () => push(PAGES.BRANDS.BASE),
    [PAGES.PRODUCTS.SHORTKEYS]: () => push(PAGES.PRODUCTS.BASE),
    [PAGES.BUDGETS.SHORTKEYS]: () => push(PAGES.BUDGETS.BASE),
    [PAGES.SETTINGS.SHORTKEYS]: () => push(PAGES.SETTINGS.BASE),
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
                    {currentEntity?.entity && currentEntity?.queryKey && (
                      <OptionsDropdown entity={currentEntity.entity} queryKey={currentEntity.queryKey} text={currentEntity.text} />
                    )}
                  </RigthHeaderDiv>
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
