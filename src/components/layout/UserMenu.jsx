import { COLORS, PAGES } from "@/constants";
import { isCallixtoUser } from "@/roles";
import { useUserContext } from "@/User";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Accordion, Dropdown, Icon, Menu, Popup } from "semantic-ui-react";

const UserMenu = ({ trigger, onLogout, onClientChange }) => {
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const [activeIndex, setActiveIndex] = useState(-1); // Controla el estado del acordeón
  const [searchTerm, setSearchTerm] = useState(""); // Estado para la búsqueda

  const handleAccordionClick = (index) => {
    setActiveIndex(activeIndex === index ? -1 : index);
  };

  // Filtrar clientes según el término de búsqueda
  const filteredClients = useMemo(() => {
    return userData.callixtoClients?.filter((client) =>
      client.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, userData.callixtoClients]);

  // Opciones para el Dropdown
  const clientOptions = useMemo(() => {
    return filteredClients.map((client) => ({
      key: client,
      value: client,
      text: client,
    }));
  }, [filteredClients]);

  return (
    <Popup
      trigger={trigger}
      on="click"
      position="bottom right"
      wide="very"
      style={{ padding: 0 }}
    >
      <Menu vertical style={{ minWidth: "250px" }}>
        <Menu.Item onClick={onLogout}>
          <Icon color={COLORS.RED} name="sign-out" /> Cerrar sesión
        </Menu.Item>
        <Menu.Item
          onClick={() => {
            push("/change-password");
          }}
        >
          <Icon color={COLORS.YELLOW} name="lock" /> Cambiar contraseña
        </Menu.Item>
        {isCallixtoUser(role) && (
          <Accordion as={Menu}>
            <Menu.Item>
              <Accordion.Title
                active={activeIndex === 0}
                index={0}
                onClick={() => handleAccordionClick(0)}
              >
                <Icon name="dropdown" /> Clientes
              </Accordion.Title>
              <Accordion.Content active={activeIndex === 0}>
                <Dropdown
                  placeholder="Selecciona un cliente"
                  search
                  selection
                  clearable
                  fluid
                  minCharacters={2}
                  noResultsMessage="No se han encontrado resultados."
                  options={clientOptions}
                  value={userData.selectedClientId || null}
                  onSearchChange={(e, { searchQuery }) => setSearchTerm(searchQuery)}
                  onChange={(e, { value }) => {
                    onClientChange(value);
                  }}
                  style={{ marginTop: "10px" }}
                />
              </Accordion.Content>
            </Menu.Item>
          </Accordion>
        )}
        <Menu.Item
          onClick={() => {
            push(PAGES.CONFIG.BASE);
          }}
        >
          <Icon color={COLORS.ORANGE} name="settings" /> Configuración
        </Menu.Item>
      </Menu>
    </Popup>
  );
};

export default UserMenu;
