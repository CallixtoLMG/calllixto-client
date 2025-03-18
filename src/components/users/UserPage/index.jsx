import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from "@/common/components/table";
import { ENTITIES, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks/useFilters";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, USER_COLUMNS, USER_STATE_OPTIONS } from "../users.constants";

const UsersPage = ({ users = [], isLoading, onRefetch }) => {
  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['username', 'firstName', 'lastName']);

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit(() => { })}>
          <Filters
            entity={ENTITIES.USERS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
          >
            <DropdownControlled
              width="200px"
              name="state"
              options={USER_STATE_OPTIONS}
              defaultValue={EMPTY_FILTERS.state}
              afterChange={() => {
                onSubmit(() => { })();
              }}
            />
            <TextControlled name="username" placeholder="Usuario" width="180px" />
            <TextControlled name="firstName" placeholder="Nombre" width="180px" />
            <TextControlled name="lastName" placeholder="Apellido" width="180px" />
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
        mainKey="username"
      />
    </>
  )
};

export default UsersPage;