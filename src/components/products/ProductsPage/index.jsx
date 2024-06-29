import { LIST_PRODUCTS_QUERY_KEY, deleteProduct } from "@/api/products";
import { ModalDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { PRODUCT_COLUMNS } from "../products.common";
import { RULES } from "@/roles";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { Input } from "@/components/common/custom";

const EMPTY_FILTERS = { code: '', name: '' };

const ProductsPage = ({ products = [], role, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset } = methods;

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.code) {
      filters.sort = "code";
    }
    if (data.name) {
      filters.sort = "name";
    }
    resetFilters(filters);
  };

  const deleteQuestion = useCallback((name) => `¿Está seguro que desea eliminar el producto "${name}"?`, []);

  const mapProductsForTable = useCallback((c) => {
    return c.map(customer => ({ ...customer, key: customer.code }));
  }, []);

  const actions = RULES.canRemove[role] ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (product) => {
        setSelectedProduct(product);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteProduct(selectedProduct?.code);
      return data
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Producto eliminado!');
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
              name="code"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  height="35px"
                  placeholder="Código"
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
        mainKey="code"
        headers={PRODUCT_COLUMNS}
        elements={mapProductsForTable(products)}
        page={PAGES.PRODUCTS}
        actions={actions}
        showPagination
      />
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedProduct?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default ProductsPage;
