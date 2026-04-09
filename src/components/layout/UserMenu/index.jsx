'use client';

import { useUserContext } from "@/User";
import { Icon } from "@/common/components/custom";
import { COLORS, ICONS, PAGES } from "@/common/constants";
import { isCallixtoUser } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackButton,
  ClientItem,
  ClientList,
  EmptyState,
  MenuAction,
  MenuActions,
  MenuBody,
  MenuCard,
  MenuContainer,
  MenuHeader,
  MenuSectionLabel,
  SearchInput,
  SearchWrapper,
  SelectedClientText,
  UserMeta,
  UserName
} from "./styles";

const UserMenu = ({ trigger, onLogout, onClientChange, selectedClient }) => {
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("main"); 
  const [searchTerm, setSearchTerm] = useState("");

  const clients = userData?.callixtoClients?.items || [];

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients;

    return clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clients, searchTerm]);

  useEffect(() => {
    if (!isOpen) {
      setView("main");
      setSearchTerm("");
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleGoToChangePassword = () => {
    setIsOpen(false);
    push(PAGES.CHANGE_PASSWORD.BASE);
  };

  const handleSelectClient = (clientId) => {
    onClientChange(clientId);
    setIsOpen(false);
  };

  const selectedClientName = useMemo(() => {
    return clients.find((client) => client.id === selectedClient)?.name || selectedClient;
  }, [clients, selectedClient]);

  return (
    <MenuContainer ref={containerRef}>
      <div onClick={() => setIsOpen((prev) => !prev)}>
        {trigger}
      </div>
      <MenuCard $open={isOpen}>
        {view === "main" && (
          <>
            <MenuHeader>
              <UserName>{userData?.name}</UserName>
              <UserMeta>
                {selectedClientName ? (
                  <>
                    Local activo
                    <SelectedClientText>{selectedClientName}</SelectedClientText>
                  </>
                ) : (
                  "Cuenta"
                )}
              </UserMeta>
            </MenuHeader>

            <MenuBody >
              <MenuActions>
                {isCallixtoUser(role) && (
                  <MenuAction type="button" onClick={() => setView("clients")}>
                    <span>
                      <Icon tooltip color={COLORS.BLUE} name={ICONS.USER} />
                      Cambiar cliente
                    </span>
                    <Icon name={ICONS.CARET_RIGHT} />
                  </MenuAction>
                )}

                <MenuAction type="button" onClick={handleGoToChangePassword}>
                  <span>
                    <Icon tooltip color={COLORS.YELLOW} name={ICONS.LOCK} />
                    Cambiar contraseña
                  </span>
                </MenuAction>

                <MenuAction
                  type="button"
                  $danger
                  onClick={() => {
                    setIsOpen(false);
                    onLogout?.();
                  }}
                >
                  <span>
                    <Icon tooltip color={COLORS.RED} name={ICONS.SIGN_OUT} />
                    Cerrar sesión
                  </span>
                </MenuAction>
              </MenuActions>
            </MenuBody>
          </>
        )}

        {view === "clients" && (
          <>
            <MenuHeader>
              <BackButton type="button" onClick={() => setView("main")}>
                <Icon tooltip name={ICONS.ARROW_LEFT} />
                Atrás
              </BackButton>
              <UserName>Cambiar cliente</UserName>
              <UserMeta>Seleccioná un cliente disponible</UserMeta>
            </MenuHeader>

            <MenuBody view>
              <MenuSectionLabel>Buscar cliente</MenuSectionLabel>
              <SearchWrapper>
                <SearchInput
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Callixto"
                />
              </SearchWrapper>

              <ClientList>
                {!filteredClients.length ? (
                  <EmptyState>No se encontraron clientes.</EmptyState>
                ) : (
                  filteredClients.map((client) => {
                    const isActive = String(selectedClient) === String(client.id);

                    return (
                      <ClientItem
                        key={client.id}
                        type="button"
                        $active={isActive}
                        onClick={() => handleSelectClient(client.id)}
                      >
                        <span>{client.name}</span>
                        {isActive && <Icon name={ICONS.CHECK} />}
                      </ClientItem>
                    );
                  })
                )}
              </ClientList>
            </MenuBody>
          </>
        )}
      </MenuCard>
    </MenuContainer>
  );
};

export default UserMenu;