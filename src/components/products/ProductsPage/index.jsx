import { LIST_PRODUCTS_QUERY_KEY, deleteProduct } from "@/api/products";
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
import styled from 'styled-components';
import { PRODUCT_COLUMNS } from "../products.common";

const EMPTY_FILTERS = { code: '', name: '' };

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
`;

const SubContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 1px solid #000;
  text-align: center;
  page-break-inside: avoid;
  height: 300px !important;
  padding: 0px !important;
`;

const ProductName = styled.p`
  margin: 0;
  font-size: 16px;
  padding-top: 3px !important;
  height: 50px !important;
`;

const ProductCode = styled.p`
  margin: 0;
  font-size: 16px;
  flex: 1 0 5% !important;
  padding: 3px !important;
`;

const Barcode = styled.img`
  flex: 1 0 60%;
  width: 100%;
  height: 80px !important;
  padding: 0 3px !important;
`;

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
      setTimeout(() => {
        window.print();
        setShouldPrint(false);
      }, 500);
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

  const onSelectionChange = useCallback((selected, isSelected = null) => {
    if (isSelected === null) {
      // Toggle selection
      isSelected = !selectedProducts[selected];
    }
  
    if (isSelected) {
      setSelectedProducts(prev => ({ ...prev, [selected]: true }));
    } else {
      const productsCopy = { ...selectedProducts };
      delete productsCopy[selected];
      setSelectedProducts(productsCopy);
    }
  }, [selectedProducts]);
  
  const clearSelection = () => {
    setSelectedProducts({});
  };

  const { mutate: deleteSelectedProducts, isPending: deleteIsPending } = useMutation({
    mutationFn: async () => {
      const productCodes = Object.keys(selectedProducts);
      const deletePromises = productCodes.map(code => deleteProduct(code));
      await Promise.all(deletePromises);
      return productCodes.length;
    },
    onSuccess: (deletedCount) => {
      queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
      toast.success(`${deletedCount} productos eliminados!`);
      setSelectedProducts({});
    },
    onError: (error) => {
      toast.error(`Error al eliminar productos: ${error.message}`);
    }
  });

  const handleBarcodePrint = async () => {
    setShouldPrint(true);
  };

  const handleDeleteProducts = () => {
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmDeleteModal(false);
    deleteSelectedProducts();
  };

  const selectedProductDetails = Object.keys(selectedProducts).map(code => {
    const product = products.find(product => product.code === code);
    return { code: product?.code, name: product?.name, price: product?.price };
  });

  const selectionActions = useMemo(() => {
    if (RULES.canRemove[role]) {
      return [
        <Button
          onClick={handleDeleteProducts}
          color="red"
          size="tiny"
          key={1}
        >
          <Icon name="trash" /> Eliminar Productos
        </Button>,
        <Button
          onClick={handleBarcodePrint}
          color="blue"
          size="tiny"
          key={2}
        >
          <Icon name="barcode" /> Descargar Códigos
        </Button>
      ];
    }
    return [];
  }, [role, selectedProducts, handleDeleteProducts, handleBarcodePrint]);

  return (
    <>
      <NoPrint>
        <Flex flexDirection="column" rowGap="15px">
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(onFilter)}>
              <Filters onRestoreFilters={onRestoreFilters}>
                <Controller
                  name="code"
                  control={control}
                  render={({ field: { onChange, ...rest } }) => (
                    <Input
                      {...rest}
                      $marginBottom
                      maxWidth
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
                      maxWidth
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
            isLoading={isLoading}
            mainKey="code"
            headers={PRODUCT_COLUMNS}
            elements={mapProductsForTable(products)}
            page={PAGES.PRODUCTS}
            actions={actions}
            selection={selectedProducts}
            onSelectionChange={onSelectionChange}
            selectionActions={selectionActions}
            clearSelection={clearSelection} 
          />
          <ModalDelete
            showModal={showModal}
            setShowModal={setShowModal}
            title={deleteQuestion(selectedProduct?.name)}
            onDelete={mutate}
            isLoading={isPending}
          />
        </Flex>
      </NoPrint>
      <OnlyPrint firstPageMarginTop="-95px">
        <Container>
          {Object.keys(selectedProducts).map((code) => (
            <SubContainer key={code}>
              <ProductName>{products.find(product => product.code === code)?.name}</ProductName>
              <Barcode id={`barcode-${code}`}></Barcode>
              <ProductCode>{code}</ProductCode>
            </SubContainer>
          ))}
        </Container>
      </OnlyPrint>
      <ModalMultiDelete
        open={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        products={selectedProductDetails}
      />
    </>
  );
};

export default ProductsPage;
