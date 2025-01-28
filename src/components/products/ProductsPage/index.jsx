import { useBatchDeleteProducts, useDeleteProduct, useEditProduct } from "@/api/products";
import { IconnedButton } from "@/components/common/buttons";
import { Dropdown, Flex, Input } from "@/components/common/custom";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { ModalAction, ModalMultiDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { OnlyPrint } from "@/components/layout";
import { COLORS, ICONS, PAGES, PRODUCT_STATES } from "@/constants";
import { useFilters } from "@/hooks/useFilters";
import { RULES } from "@/roles";
import { createFilter } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form, Label } from "semantic-ui-react";
import { PRODUCT_COLUMNS } from "../products.common";
import { ControlledText } from "@/components/common/form";

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

const ProductsPage = ({ products = [], role, isLoading, onRefetch }) => {
  const printRef = useRef();
  const deleteProduct = useDeleteProduct();
  const batchDeleteProducts = useBatchDeleteProducts();
  const editProduct = useEditProduct();

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});

  const {
    onRestoreFilters,
    onSubmit,
    appliedFilters,
    methods
  } = useFilters(EMPTY_FILTERS);

  const onFilter = createFilter(appliedFilters, ['code', 'name']);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

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
        toast.error(response.error.message);
      }
    },
  });

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

  useEffect(() => {
    clearSelection();
  }, [appliedFilters.state]);

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const codes = Object.keys(selectedProducts);
      const response = await batchDeleteProducts(codes);
      return response.deletedCount;
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
          <Form onSubmit={onSubmit(() => {})}>
            <Filters onRefetch={onRefetch} clearSelection={clearSelection} onRestoreFilters={onRestoreFilters}>
              <Controller
                name="state"
                render={({ field: { onChange, ...rest } }) => (
                  <Dropdown
                    {...rest}
                    $maxWidth
                    top="10px"
                    height="35px"
                    minHeight="35px"
                    selection
                    options={STATE_OPTIONS}
                    defaultValue={EMPTY_FILTERS.state}
                    onChange={(e, { value }) => {
                      onChange(value);
                      onSubmit(() => {})();
                    }}
                  />
                )}
              />
              <ControlledText name="code" placeholder="Código" width="200px" />
              <ControlledText name="name" placeholder="Nombre" width="350px" />
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
          color={PRODUCT_STATES[appliedFilters.state]?.color}
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
      <OnlyPrint>
        <PrintBarCodes ref={printRef} products={Object.values(selectedProducts)} />
      </OnlyPrint>
      <ModalMultiDelete
        open={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={deleteSelectedProducts}
        elements={Object.values(selectedProducts)}
        icon={ICONS.TRASH}
        title="Estás seguro de que desea eliminar estos productos?"
        isLoading={deleteIsPending}
        headers={PRODUCT_COLUMNS}
      />
    </>
  );
};

export default ProductsPage;
