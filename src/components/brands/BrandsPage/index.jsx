import { Dropdown, Flex, Input } from "@/components/common/custom";
import { Filters, Table } from "@/components/common/table";
import { BRANDS_STATES, PAGES } from "@/constants";
import { createFilter } from "@/utils";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Label } from "semantic-ui-react";
import { BRAND_COLUMNS } from "../brands.common";

const EMPTY_FILTERS = { id: '', name: '', state: BRANDS_STATES.ACTIVE.id };
const STATE_OPTIONS = [
  ...Object.entries(BRANDS_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

const BrandsPage = ({ brands = [], isLoading, onRefetch }) => {
  const { handleSubmit, control, reset } = useForm();
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const onFilter = useCallback(
    createFilter(filters, ['name', 'id']),
    [filters]
  );

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(setFilters)}>
        <Filters onRefetch={onRefetch} onRestoreFilters={onRestoreFilters}>
          <Controller
            name="state"
            control={control}
            render={({ field: { onChange, ...rest } }) => (
              <Dropdown
                {...rest}
                $maxWidth
                top="10px"
                height="35px"
                minHeight="35px"
                selection
                options={STATE_OPTIONS}
                defaultValue={STATE_OPTIONS[0].key}
                onChange={(e, { value }) => {
                  onChange(value);
                  setFilters({ ...filters, state: value });
                }}
              />
            )}
          />
          <Controller
            name="id"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                $marginBottom
                $maxWidth
                height="35px"
                placeholder="Id"
              />
            )}
          />
          <Controller
            name="name"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                $marginBottom
                $maxWidth
                height="35px"
                placeholder="Nombre"
              />
            )}
          />
        </Filters>
      </Form>
      <Table
        isLoading={isLoading}
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        onFilter={onFilter}
        paginate
      />
    </>
  )
};

export default BrandsPage;
