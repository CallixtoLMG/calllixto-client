import { LIST_PRODUCTS_QUERY_KEY, deleteProduct } from "@/api/products";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductCode, ProductName } from "@/commonStyles";
import { Flex, Input } from "@/components/common/custom";
import { ModalDelete, ModalMultiDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import JsBarcode from 'jsbarcode';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form, Icon } from "semantic-ui-react";
import { PRODUCT_COLUMNS } from "../products.common";

const EMPTY_FILTERS = { code: '', name: '' };

const ProductsPage = ({ products = [], role, isLoading }) => {
  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [shouldPrint, setShouldPrint] = useState(false);
  const queryClient = useQueryClient();
  const { resetFilters } = usePaginationContext();
  const methods = useForm();
  const { handleSubmit, control, reset, setValue } = methods;

  const generateBarcodes = useCallback(() => {
    Object.keys(selectedProducts).forEach(code => {
      const barcodeElement = document.getElementById(`barcode-${code}`);
      if (barcodeElement) {
        JsBarcode(barcodeElement, code, {
          format: "CODE128",
          lineColor: "#000",
          width: 2,
          height: 80,
          displayValue: false,
          fit: true
        });
      }
    });
  }, [selectedProducts]);

  useEffect(() => {
    if (shouldPrint) {
      generateBarcodes();
      const printTimeout = setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 500);

      return () => clearTimeout(printTimeout);
    }
  }, [shouldPrint, generateBarcodes]);

  const onFilter = useCallback((data) => {
    const filters = { ...data };
    if (data.code) {
      filters.sort = "code";
    }
    if (data.name) {
      filters.sort = "name";
    }
    resetFilters(filters);
  }, [resetFilters]);

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
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Producto eliminado!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  const onRestoreFilters = useCallback(() => {
    reset(EMPTY_FILTERS);
    onFilter(EMPTY_FILTERS);
  }, [reset, onFilter]);

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
      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
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
      <Button
        key={2}
        onClick={() => setShouldPrint(true)}
        color="blue"
        size="tiny"
      >
        <Icon name="barcode" /> Descargar Códigos
      </Button>
    ];
    if (RULES.canRemove[role]) {
      actions.unshift(
        <Button
          key={1}
          onClick={() => setShowConfirmDeleteModal(true)}
          color="red"
          size="tiny"
        >
          <Icon name="trash" /> Eliminar Productos
        </Button>
      )
    }
    return actions;
  }, [role]);

  return (
    <>
      <NoPrint>
        <Flex flexDirection="column" rowGap="15px">
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(onFilter)}>
              <Filters clearSelection={clearSelection} onRestoreFilters={onRestoreFilters}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field: { onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      $marginBottom
                      $maxWidth
                      height="35px"
                      placeholder="Código"
                      onChange={(e) => {
                        setValue('name', '');
                        onChange(e.target.value);
                      }}
                    />
                  )}
                />
                <Controller
                  name="name"
                  control={control}
                  render={({ field: { onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      $marginBottom
                      $maxWidth
                      height="35px"
                      placeholder="Nombre"
                      onChange={(e) => {
                        setValue('code', '');
                        onChange(e.target.value);
                      }}
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
          />
          <ModalDelete
            showModal={showModal}
            setShowModal={setShowModal}
            title={`¿Está seguro que desea eliminar el producto "${selectedProduct?.name}"?`}
            onDelete={mutate}
            isLoading={isPending}
          />
        </Flex>
      </NoPrint>
      <OnlyPrint firstPageMarginTop="-95px">
        <BarCodeContainer>
          {Object.keys(selectedProducts).map((code) => (
            <BarCodeSubContainer key={code}>
              <ProductName>{products.find(product => product.code === code)?.name}</ProductName>
              <Barcode id={`barcode-${code}`}></Barcode>
              <ProductCode>{code}</ProductCode>
            </BarCodeSubContainer>
          ))}
        </BarCodeContainer>
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
