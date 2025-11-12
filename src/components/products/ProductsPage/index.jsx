import { useUserContext } from "@/User";
import { useBatchDeleteProducts, useDeleteProduct, useEditProduct } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { DropdownControlled, TextControlled } from "@/common/components/form";
import { ModalAction, ModalMultiDelete } from "@/common/components/modals";
import { Filters, Table } from "@/common/components/table";
import { COLORS, ENTITIES, ICONS, PAGES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { OnlyPrint } from "@/components/layout";
import { useFilters } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, PRODUCTS_FILTERS_KEY, PRODUCT_COLUMNS, PRODUCT_STATES, PRODUCT_STATES_OPTIONS } from "../products.constants";

const ProductsPage = ({ products = [], isLoading, onRefetch }) => {
  const { role } = useUserContext();
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
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: PRODUCTS_FILTERS_KEY });

  const onFilter = createFilter(filters, ['id', 'name']);

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

  const { mutate: mutateDelete, isPending } = useMutation({
    mutationFn: async () => {
      let response;
      if (selectedProduct.state === PRODUCT_STATES.DELETED.id) {
        response = await deleteProduct(selectedProduct?.id);
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
    const isSelected = !!selectedProducts[selected.id];
    if (isSelected) {
      const newProducts = { ...selectedProducts };
      delete newProducts[selected.id];
      setSelectedProducts(newProducts);
    } else {
      setSelectedProducts(prev => ({ ...prev, [selected.id]: selected }));
    }
  }, [selectedProducts]);

  const selectAllCurrentPageElements = (currentPageElements) => {
    const newSelectedProducts = {};
    currentPageElements.forEach(product => {
      newSelectedProducts[product.id] = product;
    });
    setSelectedProducts(newSelectedProducts);
  };

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const ids = Object.keys(selectedProducts);
      const response = await batchDeleteProducts(ids);
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
      <IconedButton
        key={2}
        text="Descargar Códigos"
        icon={ICONS.BARCODE}
        onClick={handlePrint}
      />
    ];

    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconedButton
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
      <Flex $flexDirection="column" $rowGap="15px">
        <FormProvider {...methods}>
          <Form onSubmit={onSubmit}>
            <Filters
              entity={ENTITIES.PRODUCTS}
              onRefetch={onRefetch}
              clearSelection={() => setSelectedProducts({})}
              onRestoreFilters={onRestoreFilters}
              appliedCount={appliedCount}
              hydrated={hydrated}
            >
              <DropdownControlled
                width="200px"
                name="state"
                options={PRODUCT_STATES_OPTIONS}
                defaultValue={EMPTY_FILTERS.state}
                afterChange={() => {
                  onSubmit();
                  setSelectedProducts({});
                }}
              />
              <TextControlled name="id" placeholder="Id" width="200px" />
              <TextControlled name="name" placeholder="Nombre" width="350px" />
            </Filters>
          </Form>
        </FormProvider>
        <Table
          isLoading={isLoading || deleteIsPending}
          headers={PRODUCT_COLUMNS}
          elements={products.map(p => ({ ...p, key: p.id }))}
          page={PAGES.PRODUCTS}
          actions={actions}
          selection={selectedProducts}
          onSelectionChange={onSelectionChange}
          selectionActions={selectionActions}
          clearSelection={() => setSelectedProducts({})}
          selectAllCurrentPageElements={selectAllCurrentPageElements}
          onFilter={onFilter}
          color={PRODUCT_STATES[filters.state]?.color}
          paginate
          filters={filters}
          setFilters={setFilters}
        />
        <ModalAction
          showModal={showModal}
          setShowModal={setShowModal}
          title={`¿Está seguro que desea eliminar ${selectedProduct?.state === PRODUCT_STATES.DELETED.id ? "PERMANENTEMENTE" : ""} el producto "${selectedProduct?.name}"?`}
          onConfirm={mutateDelete}
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
        title={`¿Estás seguro de que desea eliminar${Object.values(selectedProducts).some(
          p => p.state === PRODUCT_STATES.DELETED.id) ?
          " PERMANENTEMENTE" :
          ""} estos productos?`
        }
        isLoading={deleteIsPending}
        headers={PRODUCT_COLUMNS}
      />
    </>
  );
};

export default ProductsPage;
