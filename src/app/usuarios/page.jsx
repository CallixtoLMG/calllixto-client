"use client";
import { useUserContext } from "@/User";
import { useListUsers } from "@/api/users";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UsersPage from "@/components/users/UserPage";
import { USER_STATES } from "@/components/users/users.constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Users = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListUsers();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.USERS.NAME]);
    refetch();
  }, [setLabels, refetch]);

  const users = useMemo(() => data?.users, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback(() => {
    if (!users) return;
    const headers = ['Usuario', 'Nombre', 'Apellido', 'Dirección', 'Telefono', 'Estado', 'Comentarios'];
    const mappedUsers = users.map(user => {
      const usersState = USER_STATES[user.state]?.singularTitle || user.state;
      return [
        user.username,
        user.firstname,
        user.lastname,
        user.address,
        user.phoneNumber,
        usersState,
        user.comments,
      ];
    });
    downloadExcel([headers, ...mappedUsers], "Lista de Usuarios");
  }, [users]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.USERS.CREATE) },
        text: 'Crear'
      }
    ] : [];
    actions.push({
      id: 3,
      icon: ICONS.FILE_EXCEL,
      color: COLORS.SOFT_GREY,
      onClick: handleDownloadExcel,
      text: 'Usuarios',
      disabled: loading
    });
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.USERS.CREATE), SHORTKEYS.ENTER);

  return (
    <UsersPage
      onRefetch={refetch}
      isLoading={loading}
      users={loading ? [] : users}
      role={role}
    />
  );
};

export default Users;