import { LIST_PRODUCTS_QUERY_KEY, deleteProduct } from "@/api/products";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductCode, ProductName } from "@/commonStyles";
import { Flex, IconedButton, Input } from "@/components/common/custom";
import { ModalDelete, ModalMultiDelete } from "@/components/common/modals";
import { Filters, Table } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { PAGES } from "@/constants";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import JsBarcode from 'jsbarcode';
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form, Icon } from "semantic-ui-react";
import { PRODUCT_COLUMNS } from "../products.common";

const EMPTY_FILTERS = { code: '', name: '' };

const ProductsPage = ({ products = [], role, isLoading }) => {
  const { handleSubmit, control, reset }  = useForm();

  const [showModal, setShowModal] = useState(false);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState({});
  const [shouldPrint, setShouldPrint] = useState(false);
  const [filters, setFilters] = useState(EMPTY_FILTERS);

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
    setFilters(EMPTY_FILTERS);
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
      <IconedButton
        width="fit-content"
        icon
        labelPosition="left"
        key={2}
        onClick={() => setShouldPrint(true)}
        color="blue"
        size="small"
      >
        <Icon name="barcode" />
        Descargar Códigos
      </IconedButton>
    ];
    if (RULES.canRemove[role]) {
      actions.unshift(
        <IconedButton
          width="fit-content"
          icon
          labelPosition="left"
          key={1}
          onClick={() => setShowConfirmDeleteModal(true)}
          color="red"
          size="small"
        >
          <Icon name="trash" />
          Eliminar Productos
        </IconedButton>
      );
    };
    return actions;
  }, [role]);

  return (
    <>
      <NoPrint>
        <Flex flexDirection="column" rowGap="15px">
          <Form onSubmit={handleSubmit(setFilters)}>
            <Filters onRestoreFilters={onRestoreFilters}>
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
          <Table
            isLoading={isLoading || deleteIsPending}
            mainKey="code"
            headers={PRODUCT_COLUMNS}
            elements={products}
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
