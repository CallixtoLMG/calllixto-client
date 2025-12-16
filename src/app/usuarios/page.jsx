"use client";
import { useUserContext } from "@/User";
import { useListUsers } from "@/api/users";
import { COLORS, DATE_FORMATS, ENTITIES, ICONS, INFO, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, getFormatedPhone } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import UsersPage from "@/components/users/UserPage";
import { USERS_ROLE_OPTIONS, USER_STATES } from "@/components/users/users.constants";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Users = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListUsers();
  const { role } = useUserContext();
  const { setLabels } = useBreadcrumContext();
  const { setActions, setInfo } = useNavActionsContext();
  const { push } = useRouter();
  useEffect(() => {
    setLabels([{ name: PAGES.USERS.NAME }]);
    refetch();
  }, [setLabels, refetch]);

  const users = useMemo(() => data?.users, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    const headers = ['Usuario', 'Nombre', 'Apellido', 'Rol', 'Dirección', 'Telefono', 'Estado', 'Nacimiento', 'Comentarios'];
    const mappedUsers = elements.map(user => {
      const usersState = USER_STATES[user.state]?.singularTitle || user.state;
      const roleText = USERS_ROLE_OPTIONS.find(option => option.value === user.role)?.text || user.role;
      return [
        user.username,
        user.firstName,
        user.lastName,
        roleText,
        user.address,
        getFormatedPhone(user.phoneNumber),
        usersState,
        getFormatedDate(user.birthDate, DATE_FORMATS.ONLY_DATE),
        user.comments,
      ];
    });
    downloadExcel([headers, ...mappedUsers], "Lista de Usuarios");
  }, []);

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
    setActions(actions);
    setInfo(INFO.HELP.SECTIONS[ENTITIES.USER])
  }, [push, role, setActions, loading, setInfo]);

  useKeyboardShortcuts(() => push(PAGES.USERS.CREATE), SHORTKEYS.ENTER);

  return (
    <UsersPage
      onRefetch={refetch}
      isLoading={loading}
      users={loading ? [] : users}
      role={role}
      onDownloadExcel={handleDownloadExcel}
    />
  );
};

export default Users;