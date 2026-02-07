import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, USERS_FILTERS_KEY, USER_COLUMNS, USER_STATE_OPTIONS } from "../users.constants";

const UsersPage = ({ users = [], isLoading, onRefetch, onDownloadExcel }) => {
  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: USERS_FILTERS_KEY });

  const onFilter = createFilter(filters, { username: {}, firstName: {}, lastName: {}, state: { fullMatch: true } });

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
          >
            <DropdownControlled
              width="200px"
              name="state"
              label="Estado"
              options={USER_STATE_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={onSubmit}
            />
            <TextControlled name="username" label="Usuario" placeholder="Martinb@hotmail.com" width="180px" />
            <TextControlled name="firstName" label="Nombre" placeholder="Martín" width="180px" />
            <TextControlled name="lastName" label="Apellido" placeholder="Bueno" width="180px" />
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
        onDownloadExcel={onDownloadExcel}
      />
    </>
  )
};

export default UsersPage;