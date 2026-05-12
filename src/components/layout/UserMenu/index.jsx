'use client';

import { useUserContext } from "@/User";
import { Icon } from "@/common/components/custom";
import { COLORS, ICONS, PAGES } from "@/common/constants";
import { isCallixtoUser } from "@/roles";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackButton,
  AccountItem,
  AccountList,
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
  SelectedAccountText,
  UserMeta,
  UserName
} from "./styles";

const UserMenu = ({ trigger, onLogout, onAccountChange, selectedAccount }) => {
  const { push } = useRouter();
  const { userData, role } = useUserContext();
  const containerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState("main");
  const [searchTerm, setSearchTerm] = useState("");

  const accountItems = userData?.accounts?.items;

  const accounts = useMemo(() => accountItems ?? [], [accountItems]);

  const filteredAccounts = useMemo(() => {
    if (!searchTerm.trim()) return accounts;

    return accounts.filter((account) =>
      account.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

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

  const handleSelectAccount = (accountId) => {
    onAccountChange(accountId);
    setIsOpen(false);
  };

  const selectedAccountName = useMemo(() => {
    return accounts.find((account) => account.id === selectedAccount)?.name || selectedAccount;
  }, [accounts, selectedAccount]);

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
                {selectedAccountName ? (
                  <>
                    Local activo
                    <SelectedAccountText>{selectedAccountName}</SelectedAccountText>
                  </>
                ) : (
                  "Cuenta"
                )}
              </UserMeta>
            </MenuHeader>
            <MenuBody >
              <MenuActions>
                {isCallixtoUser(role) && (
                  <MenuAction type="button" onClick={() => setView("accounts")}>
                    <span>
                      <Icon $tooltip color={COLORS.BLUE} name={ICONS.USER} />
                      Cambiar cuenta
                    </span>
                    <Icon name={ICONS.CARET_RIGHT} />
                  </MenuAction>
                )}
                <MenuAction type="button" onClick={handleGoToChangePassword}>
                  <span>
                    <Icon $tooltip color={COLORS.YELLOW} name={ICONS.LOCK} />
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
                    <Icon $tooltip color={COLORS.RED} name={ICONS.SIGN_OUT} />
                    Cerrar sesión
                  </span>
                </MenuAction>
              </MenuActions>
            </MenuBody>
          </>
        )}

        {view === "accounts" && (
          <>
            <MenuHeader>
              <BackButton type="button" onClick={() => setView("main")}>
                <Icon $tooltip name={ICONS.ARROW_LEFT} />
                Atrás
              </BackButton>
              <UserName>Cambiar cuenta</UserName>
              <UserMeta>Selecciona una cuenta disponible</UserMeta>
            </MenuHeader>
            <MenuBody $view>
              <MenuSectionLabel>Buscar cuenta</MenuSectionLabel>
              <SearchWrapper>
                <SearchInput
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Callixto"
                />
              </SearchWrapper>
              <AccountList>
                {!filteredAccounts.length ? (
                  <EmptyState>No se encontraron cuentas.</EmptyState>
                ) : (
                  filteredAccounts.map((account) => {
                    const isActive = String(selectedAccount) === String(account.id);

                    return (
                      <AccountItem
                        key={account.id}
                        type="button"
                        $active={isActive}
                        onClick={() => handleSelectAccount(account.id)}
                      >
                        <span>{account.name}</span>
                        {isActive && <Icon name={ICONS.CHECK} />}
                      </AccountItem>
                    );
                  })
                )}
              </AccountList>
            </MenuBody>
          </>
        )}
      </MenuCard>
    </MenuContainer>
  );
};

export default UserMenu;
