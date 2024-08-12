import { deleteSupplier } from "@/api/suppliers";
import { Input } from "@/components/common/custom";
import { ModalDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { SUPPLIERS_COLUMNS } from "../suppliers.common";

const EMPTY_FILTERS = { id: '', name: '' };

const SuppliersPage = ({ suppliers = [], role, isLoading }) => {
  const { handleSubmit, control, reset } = useForm();

  const [showModal, setShowModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar la marca "${name}"?`, []);

  const onFilter = useCallback((supplier) => {
    if (filters.name && !supplier.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.id && !supplier.id.toLowerCase().includes(filters.id.toLowerCase())) {
      return false;
    }

    return true;
  }, [filters]);

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
        toast.success('Marca eliminada!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }

  return (
    <>
      <Form onSubmit={handleSubmit(setFilters)}>
        <Filters onRestoreFilters={onRestoreFilters}>
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
        headers={SUPPLIERS_COLUMNS}
        elements={suppliers}
        page={PAGES.SUPPLIERS}
        actions={actions}
        onFilter={onFilter}
        paginate
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
