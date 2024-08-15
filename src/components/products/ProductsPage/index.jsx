import { deleteProduct } from "@/api/products";
import { Flex, Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/BarCode";
import { ModalDelete, ModalMultiDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { OnlyPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form } from "semantic-ui-react";
import { PRODUCT_COLUMNS } from "../products.common";
import { IconnedButton } from "@/components/common/buttons";

const EMPTY_FILTERS = { code: '', name: '' };

const ProductsPage = ({ products = [], role, isLoading }) => {
  const methods = useForm();
  const { handleSubmit, control, reset } = methods;

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  const printRef = useRef();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const onFilter = useCallback(product => {
    if (filters.name && !product.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.code && !product.code.toLowerCase().includes(filters.code.toLowerCase())) {
      return false;
    }

    return true;
  }, [filters]);

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
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Producto eliminado!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  const onRestoreFilters = useCallback(() => {
    reset(EMPTY_FILTERS);
    setFilters(EMPTY_FILTERS);
  }, [reset]);

  const onSelectionChange = useCallback(selected => {
    const isSelected = !!selectedProducts[selected.code];
    if (isSelected) {
      const newProducts = { ...selectedProducts };
      delete newProducts[selected.code];
      setSelectedProducts(newProducts);
    } else {
      setSelectedProducts(prev => ({ ...prev, [selected.code]: selected }));
    }
  }, [selectedProducts]);

  const clearSelection = () => {
    setSelectedProducts({});
  };

  const selectAll = () => {
    const newProducts = products.reduce((acc, product) => acc[product.code] ? acc : { ...acc, [product.code]: product }, {});
    setSelectedProducts(newProducts);
  };

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const deletePromises = Object.keys(selectedProducts).map(code => deleteProduct(code));
      await Promise.all(deletePromises);
      return deletePromises.length;
    },
    onSuccess: (deletedCount) => {
      toast.success(`${deletedCount} productos eliminados!`);
      setSelectedProducts({});
      setShowConfirmDeleteModal(false);
    },
    onError: (error) => {
      toast.error(`Error al eliminar productos: ${error.message}`);
    }
  });

  const selectionActions = useMemo(() => {
    const actions = [
      <IconnedButton
        key={2}
        text="Descargar Códigos"
        icon="barcode"
        onClick={handlePrint}
      />
    ];
    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconnedButton
          key={1}
          text="Eliminar Productos"
          icon="trash"
          color="red"
          onClick={() => setShowConfirmDeleteModal(true)}
        />
      );
    };
    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <>
      <Flex flexDirection="column" rowGap="15px">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(onFilter)}>
            <Filters clearSelection={clearSelection} onRestoreFilters={onRestoreFilters}>
              <Controller
                name="code"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    $marginBottom
                    $maxWidth
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
                    $marginBottom
                    $maxWidth
                    height="35px"
                    placeholder="Nombre"
                  />
                )}
              />
            </Filters>
          </Form>
        </FormProvider>
        <Table
          isLoading={isLoading || deleteIsPending}
          mainKey="code"
          headers={PRODUCT_COLUMNS}
          elements={products.map(p => ({ ...p, key: p.code }))}
          page={PAGES.PRODUCTS}
          actions={actions}
          selection={selectedProducts}
          onSelectionChange={onSelectionChange}
          selectionActions={selectionActions}
          clearSelection={clearSelection}
          selectAll={selectAll}
          onFilter={onFilter}
          paginate
        />
        <ModalDelete
          showModal={showModal}
          setShowModal={setShowModal}
          title={`¿Está seguro que desea eliminar el producto "${selectedProduct?.name}"?`}
          onDelete={mutate}
          isLoading={isPending}
        />
      </Flex>
      <OnlyPrint >
        <PrintBarCodes ref={printRef} products={Object.values(selectedProducts)} />
      </OnlyPrint>
      <ModalMultiDelete
        open={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={deleteSelectedProducts}
        elements={Object.values(selectedProducts)}
        icon="trash"
        title="Estás seguro de que desea eliminar estos productos PERMANENTEMENTE?"
        isLoading={deleteIsPending}
        headers={PRODUCT_COLUMNS}
      />
    </>
  );
};

export default ProductsPage;
