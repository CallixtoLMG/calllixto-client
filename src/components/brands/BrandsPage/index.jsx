import { LIST_BRANDS_QUERY_KEY, deleteBrand } from "@/api/brands";
import { Input } from "@/components/common/custom";
import { ModalDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { BRAND_COLUMNS } from "../brands.common";

const EMPTY_FILTERS = { id: '', name: '' };

const BrandsPage = ({ brands = [], role, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset, setValue } = methods;

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar la marca "${name}"?`, []);

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.id) {
      filters.sort = "id";
    }
    if (data.name) {
      filters.sort = "name";
    }
    resetFilters(filters);
  };

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    onFilter(EMPTY_FILTERS);
  }

  const actions = RULES.canRemove[role] ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (brand) => {
        setSelectedBrand(brand);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteBrand(selectedBrand?.id);
      return data
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY] });
        toast.success('Marca eliminada!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(onFilter)}>
          <Filters onRestoreFilters={onRestoreFilters}>
            <Controller
              name="id"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Input
                  {...rest}
                  $marginBottom
                  maxWidth
                  height="35px"
                  placeholder="Id"
                  onChange={(e) => {
                    setValue('name', '');
                    onChange(e.target.value);
                  }}
                />
              )}
            />
            <Controller
              name="name"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Input
                  {...rest}
                  $marginBottom
                  maxWidth
                  height="35px"
                  placeholder="Nombre"
                  onChange={(e) => {
                    setValue('id', '');
                    onChange(e.target.value);
                  }}
                />
              )}
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        actions={actions}
        showPagination
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedBrand?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default BrandsPage;
