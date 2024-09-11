import { deleteBrand, LIST_BRANDS_QUERY_KEY } from "@/api/brands";
import { Input } from "@/components/common/custom";
import { ModalAction } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { BRAND_COLUMNS } from "../brands.common";

const EMPTY_FILTERS = { id: '', name: '' };

const BrandsPage = ({ brands = [], role, isLoading }) => {
  const { handleSubmit, control, reset } = useForm();
  const queryClient = useQueryClient();

  const [showModal, setShowModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar la marca "${name}"?`, []);

  const onFilter = useCallback((brand) => {
    if (filters.name && !brand.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.id && !brand.id.toLowerCase().includes(filters.id.toLowerCase())) {
      return false;
    }

    return true;
  }, [filters]);

  const onRestoreFilters = () => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
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
      const response = await deleteBrand(selectedBrand?.id);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Marca eliminada!');
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY], refetchType: 'all' });
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

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
        headers={BRAND_COLUMNS}
        elements={brands}
        page={PAGES.BRANDS}
        actions={actions}
        onFilter={onFilter}
        paginate
      />
      <ModalAction
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedBrand?.name)}
        onConfirm={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default BrandsPage;
