import { LIST_SUPPLIERS_QUERY_KEY, deleteSupplier } from "@/api/suppliers";
import { ModalDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { SUPPLIERS_COLUMNS } from "../suppliers.common";
import { RULES } from "@/roles";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { Input } from "@/components/common/custom";

const EMPTY_FILTERS = { id: '', name: '' };

const SuppliersPage = ({ suppliers = [], role, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
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

  const actions = RULES.canRemove[role] ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (supplier) => {
        setSelectedSupplier(supplier);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteSupplier(selectedSupplier?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY] });
        toast.success('Marca eliminada!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    onFilter(EMPTY_FILTERS);
  }

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
                  placeholder="Nombre"
                />
              )}
            />
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={SUPPLIERS_COLUMNS}
        elements={suppliers}
        page={PAGES.SUPPLIERS}
        actions={actions}
        showPagination
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedSupplier?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default SuppliersPage;
