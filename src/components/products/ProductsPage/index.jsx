import { useDeleteProduct, useEditProduct } from "@/api/products";
import { IconnedButton } from "@/components/common/buttons";
import { Dropdown, Flex, Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction, ModalMultiDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { OnlyPrint } from "@/components/layout";
import { COLORS, ICONS, PAGES, PRODUCT_STATES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form, Label } from "semantic-ui-react";
import { PRODUCT_COLUMNS } from "../products.common";

const EMPTY_FILTERS = { code: '', name: '', state: PRODUCT_STATES.ACTIVE.id };
const STATE_OPTIONS = [
  ...Object.entries(PRODUCT_STATES).map(([key, value]) => ({
    key,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {value.title}&nbsp;<Label color={value.color} circular empty />
      </Flex>
    ),
    value: key
  }))
];

const ProductsPage = ({ products = [], role, isLoading }) => {
  const methods = useForm();
  const { handleSubmit, control, reset, watch } = methods;
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const watchState = watch('state', PRODUCT_STATES.ACTIVE.id);
  const printRef = useRef();
  const deleteProduct = useDeleteProduct();
  const editProduct = useEditProduct();

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  const onFilter = useCallback(product => {
    if (filters.name && !product.name?.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }

    if (filters.code && !product.code.toLowerCase().includes(filters.code.toLowerCase())) {
      return false;
    }

    if (filters.state && filters.state !== product.state) {
      return false;
    }

    return true;
  }, [filters]);

  const actions = RULES.canRemove[role] ? [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (product) => {
        setSelectedProduct(product);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      let response;
      if (selectedProduct.state === PRODUCT_STATES.DELETED.id) {
        response = await deleteProduct(selectedProduct?.code);
      } else {
        response = await editProduct({ ...selectedProduct, state: PRODUCT_STATES.DELETED.id });
      }
      return response;
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

  const selectAllCurrentPageElements = (currentPageElements) => {
    const newSelectedProducts = {};
    currentPageElements.forEach(product => {
      newSelectedProducts[product.code] = product;
    });
    setSelectedProducts(newSelectedProducts);
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
        icon={ICONS.BARCODE}
        onClick={handlePrint}
      />
    ];
    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconnedButton
          key={1}
          text="Eliminar Productos"
          icon={ICONS.TRASH}
          color={COLORS.RED}
          onClick={() => setShowConfirmDeleteModal(true)}
        />
      );
    }
    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  return (
    <>
      <Flex flexDirection="column" rowGap="15px">
        <FormProvider {...methods}>
          <Form onSubmit={handleSubmit(setFilters)}>
            <Filters clearSelection={clearSelection} onRestoreFilters={onRestoreFilters}>
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
          selectAllCurrentPageElements={selectAllCurrentPageElements}
          onFilter={onFilter}
          color={PRODUCT_STATES[watchState]?.color}
          paginate
        />
        <ModalAction
          showModal={showModal}
          setShowModal={setShowModal}
          title={`¿Está seguro que desea eliminar ${selectedProduct?.state === PRODUCT_STATES.DELETED.id ? "PERMANENTEMENTE" : ""} el producto "${selectedProduct?.name}"?`}
          onConfirm={mutate}
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
        icon={ICONS.TRASH}
        title="Estás seguro de que desea eliminar estos productos PERMANENTEMENTE?"
        isLoading={deleteIsPending}
        headers={PRODUCT_COLUMNS}
      />
    </>
  );
};

export default ProductsPage;
