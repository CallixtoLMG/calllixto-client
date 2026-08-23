import { useUserContext } from "@/User";
import { useBatchDeleteProducts, useDeleteProduct, useEditProduct, useRecoverProduct } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { Flex } from "@/common/components/custom";
import PrintBarCodes from "@/common/components/custom/PrintBarCodes";
import { DropdownControlled, TextControlled } from "@/common/components/form";
import { ModalAction, ModalMultiDelete } from "@/common/components/modals";
import { Filters, Table } from "@/common/components/table";
import { CONTENT_SIZES, COLORS, ENTITIES, FIELD_LABELS, ICONS, PAGES, TOOLTIPS } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { formatCount, pluralize } from "@/common/utils/pluralization";
import { OnlyPrint, useListPageSideActions } from "@/components/layout";
import { useFilters } from "@/hooks";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import { Form } from "semantic-ui-react";
import { EMPTY_FILTERS, LIST_PRODUCTS_QUERY_KEY, PRODUCTS_FILTERS_KEY, PRODUCT_COLUMNS, PRODUCT_STATES, PRODUCT_STATES_OPTIONS } from "../products.constants";

const ProductsPage = ({ products = [], isLoading, onRefetch, onDownloadExcel, sideActions = [] }) => {
  const { role } = useUserContext();
  const printRef = useRef();
  const deleteProduct = useDeleteProduct();
  const batchDeleteProducts = useBatchDeleteProducts();
  const editProduct = useEditProduct();
  const recoverProduct = useRecoverProduct();
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [showConfirmRecoverModal, setShowConfirmRecoverModal] = useState(false);
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

  const onFilter = useMemo(() => createFilter(filters, { id: {}, name: {}, state: { skipAll: true, fullMatch: true } }), [filters]);
  const tableProducts = useMemo(() => products.map(p => ({ ...p, key: p.id })), [products]);
  const { useSideActions, handleFilteredElementsChange } = useListPageSideActions({
    sideActions,
    onRefetch,
    onDownloadExcel,
    entity: ENTITIES.PRODUCTS,
    queryKey: LIST_PRODUCTS_QUERY_KEY,
    pageName: PAGES.PRODUCTS.NAME,
    updateTooltip: "Actualizar productos",
    downloadTooltip: "Descargar productos en Excel",
    downloadParentId: 2,
  });
  const handleFilteredProductsChange = useCallback(handleFilteredElementsChange, [handleFilteredElementsChange]);

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
      tooltip: TOOLTIPS.DELETE
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
        toast.error(`${response?.message} (${response?.error?.message})`);
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

  const selectedProductsList = useMemo(() => Object.values(selectedProducts), [selectedProducts]);
  const selectedProductsCount = selectedProductsList.length;
  const allSelectedProductsAreDeleted = useMemo(() => (
    !!selectedProductsCount &&
    selectedProductsList.every(product => product.state === PRODUCT_STATES.DELETED.id)
  ), [selectedProductsCount, selectedProductsList]);

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const ids = Object.keys(selectedProducts);
      const response = await batchDeleteProducts(ids);
      return response.deletedCount;
    },
    onSuccess: (deletedCount) => {
      toast.success(`${formatCount(deletedCount, "product")} ${pluralize(deletedCount, "eliminado", "eliminados")}!`);
      setSelectedProducts({});
      setShowConfirmDeleteModal(false);
    },
    onError: (error) => {
      toast.error(`Error al eliminar productos: ${error.message}`);
    }
  });

  const { mutate: recoverSelectedProducts, isPending: recoverIsPending } = useMutation({
    mutationFn: async () => {
      const productsToRecover = Object.values(selectedProducts);

      if (!productsToRecover.length) {
        return { recoveredCount: 0, failedCount: 0, invalidSelection: true };
      }

      const hasInvalidProducts = productsToRecover.some(product => product.state !== PRODUCT_STATES.DELETED.id);
      if (hasInvalidProducts) {
        return { recoveredCount: 0, failedCount: productsToRecover.length, invalidSelection: true };
      }

      let recoveredCount = 0;
      let failedCount = 0;
      let errorMessage;

      for (const product of productsToRecover) {
        try {
          const response = await recoverProduct({ id: product.id });
          if (response?.statusOk) {
            recoveredCount++;
          } else {
            failedCount++;
            errorMessage = errorMessage || response?.message || response?.error?.message;
          }
        } catch (error) {
          failedCount++;
          errorMessage = errorMessage || error?.message;
        }
      }

      return { recoveredCount, failedCount, errorMessage };
    },
    onSuccess: ({ recoveredCount, failedCount, invalidSelection, errorMessage }) => {
      if (invalidSelection) {
        toast.error("La selección ya no es válida para recuperar productos.");
      } else if (recoveredCount && !failedCount) {
        toast.success(recoveredCount === 1 ? "Producto recuperado." : `${recoveredCount} productos recuperados.`);
      } else if (recoveredCount && failedCount) {
        toast.error(`Se recuperaron ${formatCount(recoveredCount, "product")}. ${formatCount(failedCount, "product")} no pudieron recuperarse.`);
      } else {
        toast.error(`No se pudo recuperar ${formatCount(failedCount, "product")}.${errorMessage ? ` ${errorMessage}` : ""}`);
      }
    },
    onError: (error) => {
      toast.error(`Error al recuperar productos: ${error.message}`);
    },
    onSettled: () => {
      setSelectedProducts({});
      setShowConfirmRecoverModal(false);
    }
  });

  const selectionActions = useMemo(() => {
    const actions = [
      <IconedButton
        key={2}
        text="Descargar códigos"
        icon={ICONS.BARCODE}
        onClick={handlePrint}
        disabled={deleteIsPending || recoverIsPending}
      />
    ];

    if (allSelectedProductsAreDeleted && RULES.canRemove[role]) {
      actions.unshift(
        <IconedButton
          key={3}
          text={`Recuperar ${pluralize(selectedProductsCount, "producto", "productos")}`}
          icon={ICONS.UNDO}
          color={COLORS.GREEN}
          onClick={() => setShowConfirmRecoverModal(true)}
          disabled={deleteIsPending || recoverIsPending}
          loading={recoverIsPending}
        />
      );
    }

    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconedButton
          key={1}
          text={`Eliminar ${pluralize(selectedProductsCount, "producto", "productos")}`}
          icon={ICONS.TRASH}
          color={COLORS.RED}
          onClick={() => setShowConfirmDeleteModal(true)}
          disabled={deleteIsPending || recoverIsPending}
          loading={deleteIsPending}
        />
      );
    }

    return actions;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, selectedProductsCount, allSelectedProductsAreDeleted, deleteIsPending, recoverIsPending]);

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
              showRefetchAction={!useSideActions}
            >
              <DropdownControlled
                minWidth="150px"
                width={CONTENT_SIZES.MIN}
                name="state"
                label={FIELD_LABELS.STATE}
                options={PRODUCT_STATES_OPTIONS}
                defaultValue={EMPTY_FILTERS.state}
                afterChange={() => {
                  onSubmit();
                  setSelectedProducts({});
                }}
              />
              <TextControlled
                name="id"
                label={FIELD_LABELS.ID}
                placeholder="SECG001"
                width="12vw"
                minWidth="100px"
              />
              <TextControlled
                name="name"
                label={FIELD_LABELS.NAME}
                placeholder="Caramelito"
                width="20vw"
                minWidth="200px"
              />
            </Filters>
          </Form>
        </FormProvider>
        <Table
          isLoading={isLoading || deleteIsPending || recoverIsPending}
          headers={PRODUCT_COLUMNS}
          elements={tableProducts}
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
          onDownloadExcel={useSideActions ? undefined : onDownloadExcel}
          onFilteredElementsChange={useSideActions ? handleFilteredProductsChange : undefined}
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
        <PrintBarCodes ref={printRef} products={selectedProductsList} />
      </OnlyPrint>
      <ModalMultiDelete
        open={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={deleteSelectedProducts}
        elements={selectedProductsList}
        icon={ICONS.TRASH}
        title={`¿Estás seguro de que desea eliminar${Object.values(selectedProducts).some(
          p => p.state === PRODUCT_STATES.DELETED.id) ?
          " PERMANENTEMENTE" :
          ""} ${pluralize(Object.values(selectedProducts).length, "este producto", "estos productos")}?`
        }
        isLoading={deleteIsPending}
        headers={PRODUCT_COLUMNS}
      />
      <ModalAction
        showModal={showConfirmRecoverModal}
        setShowModal={setShowConfirmRecoverModal}
        title={`Recuperar ${pluralize(selectedProductsCount, "producto", "productos")}`}
        onConfirm={recoverSelectedProducts}
        isLoading={recoverIsPending}
        noConfirmation
        confirmButtonText="Recuperar"
        confirmButtonIcon={ICONS.UNDO}
        titleIcon={ICONS.UNDO}
        titleIconColor={COLORS.GREEN}
        plainBodyContent
        size="large"
        bodyContent={(
          <Table
            headers={PRODUCT_COLUMNS}
            elements={selectedProductsList}
            mainKey="id"
          />
        )}
      />
    </>
  );
};

export default ProductsPage;
