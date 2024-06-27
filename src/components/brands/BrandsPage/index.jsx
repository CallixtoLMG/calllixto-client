import { LIST_BRANDS_QUERY_KEY, deleteBrand } from "@/api/brands";
import { ModalDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { BRAND_COLUMNS } from "../brands.common";
import { RULES } from "@/roles";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { Input } from "@/components/common/custom";

const EMPTY_FILTERS = { id: '', name: '' };

const BrandsPage = ({ brands = [], role, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset } = methods;

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
              render={({ field }) => (
                <Input
                  {...field}
                  height="35px"
                  margin="0"
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
                  height="35px"
                  margin="0"
                  placeholder="Nombre"
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
