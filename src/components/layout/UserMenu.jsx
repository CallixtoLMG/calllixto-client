import { useUserContext } from "@/User";
import { COLORS, PAGES } from "@/common/constants";
import { isCallixtoUser } from "@/roles";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Accordion, Dropdown, Icon, Menu, Popup } from "semantic-ui-react";
import styled from "styled-components";
const AccordionMenu = styled(Menu)`
  border-radius: 0!important;
  border: 0!important;
  border-top: 0.8px solid rgba(34, 36, 38, .15) !important;
`;

const AccordionItem = styled(Menu.Item)`
  width: 100%;
  align-content: center;
  padding-top: 0.8rem!important;
  padding-bottom: 0.7rem!important;
  border-radius: 0!important;
`;

const AccordionTitle = styled(Accordion.Title)`
  font-size:14px!important;
  i.dropdown.icon{
    margin: 0!important;
  }
`;

const UserMenu = ({ trigger, onLogout, onClientChange, selectedClient }) => {
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchTerm, setSearchTerm] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const handleAccordionClick = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  const clientOptions = useMemo(() => {
    const clients = userData.callixtoClients.items || [];
    const filteredClients = searchTerm
      ? clients.filter(client => client.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : clients;

    return filteredClients.map(client => ({
      key: client.id,
      value: client.id,
      text: client.name,
    }));
  }, [searchTerm, userData]);

  return (
    <Popup
      trigger={trigger}
      on="click"
      position="bottom right"
      wide="very"
      style={{ padding: 0 }}
      open={isPopupOpen}
      onClose={() => setIsPopupOpen(false)}
      onOpen={() => setIsPopupOpen(true)}
    >
      <Menu vertical style={{ minWidth: "250px" }}>
        <Menu.Item onClick={onLogout}>
          <Icon color={COLORS.RED} name="sign-out" /> Cerrar sesión
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            setIsPopupOpen(false);
            push(PAGES.CHANGE_PASSWORD.BASE);
          }}
        >
          <Icon color={COLORS.YELLOW} name="lock" /> Cambiar contraseña
        </Menu.Item>
        {isCallixtoUser(role) && (
          <Accordion as={AccordionMenu}>
            <AccordionItem>
              <AccordionTitle
                active={activeIndex === 0}
                index={0}
                onClick={() => handleAccordionClick(0)}
              >
                <Icon name="dropdown" /> Clientes
              </AccordionTitle>
              <Accordion.Content active={activeIndex === 0}>
                <Dropdown
                  placeholder="Selecciona un cliente"
                  search
                  selection
                  fluid
                  minCharacters={2}
                  noResultsMessage="No se han encontrado resultados."
                  options={clientOptions}
                  value={selectedClient || null}
                  onSearchChange={(e, { searchQuery }) => setSearchTerm(searchQuery)}
                  onChange={(e, { value }) => {
                    onClientChange(value);
                  }}
                  style={{ marginTop: "10px" }}
                />
              </Accordion.Content>
            </AccordionItem>
          </Accordion>
        )}

      </Menu>
    </Popup>
  );
};

export default UserMenu;
