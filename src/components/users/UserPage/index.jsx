import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useListPageSideActions } from "@/components/layout";
import { useFilters } from "@/hooks";
import { useCallback, useMemo } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, LIST_USERS_QUERY_KEY, USERS_FILTERS_KEY, USER_COLUMNS, USER_STATE_OPTIONS } from "../users.constants";

const UsersPage = ({ users = [], isLoading, onRefetch, onDownloadExcel, sideActions = [] }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: USERS_FILTERS_KEY });

  const onFilter = useMemo(() => createFilter(filters, { username: {}, firstName: {}, lastName: {}, state: { fullMatch: true } }), [filters]);
  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.USERS,
    queryKey: LIST_USERS_QUERY_KEY,
    pageName: PAGES.USERS.NAME,
    updateTooltip: "Actualizar usuarios",
    downloadTooltip: "Descargar usuarios en Excel",
  });
  const handleFilteredUsersChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.USERS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label="Estado"
              options={USER_STATE_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled
              name="username"
              label="Usuario"
              placeholder="Martinb@hotmail.com"
              width="15vw"
              minWidth="150px"
            />
            <TextControlled
              name="firstName"
              label="Nombre"
              placeholder="Martín"
              width="13vw"
              minWidth="130px"
            />
            <TextControlled
              name="lastName"
              label="Apellido"
              placeholder="Bueno"
              width="13vw"
              minWidth="130px"
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={USER_COLUMNS}
        elements={users}
        page={PAGES.USERS}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        mainKey="username"
        onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredUsersChange : undefined}
      />
    </>
  )
};

export default UsersPage;
