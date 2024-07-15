"use client";
import { useUserContext } from "@/User";
import { LIST_PRODUCTS_QUERY_KEY, deleteBatchProducts, useListAllProducts } from "@/api/products";
import { GET_SUPPLIER_QUERY_KEY, LIST_SUPPLIERS_QUERY_KEY, edit, useGetSupplier } from "@/api/suppliers";
import { BarCodeContainer, BarCodeSubContainer, Barcode, ProductCode, ProductName } from "@/commonStyles";
import { ModalDelete } from "@/components/common/modals";
import { Loader, NoPrint, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { ATTRIBUTES } from "@/components/products/products.common";
import SupplierForm from "@/components/suppliers/SupplierForm";
import SupplierView from "@/components/suppliers/SupplierView";
import { PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import JsBarcode from 'jsbarcode';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";


const Supplier = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: supplier, isLoading, isRefetching } = useGetSupplier(params.id);
  const [allowUpdate, Toggle] = useAllowUpdate();
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [open, setOpen] = useState(false);
  const [shouldPrint, setShouldPrint] = useState(false);
  const queryClient = useQueryClient();
  const { role } = useUserContext();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar todos los productos de la marca "${name}"?`;

  const { data: productsData, isLoading: loadingProducts, refetch } = useListAllProducts({
    attributes: [ATTRIBUTES.CODE, ATTRIBUTES.NAME],
    enabled: false,
    code: supplier?.id,
  });

  useEffect(() => {
    resetActions();
  }, []);

  useEffect(() => {
    setLabels([PAGES.SUPPLIERS.NAME, supplier?.name]);
  }, [setLabels, supplier]);

  useEffect(() => {
    if (productsData && productsData.products) {
      productsData.products.forEach((product) => {
        const barcodeElement = document.getElementById(`barcode-${product?.code}`);
        if (barcodeElement) {
          JsBarcode(barcodeElement, product?.code, {
            format: "CODE128",
            lineColor: "#000",
            width: 2,
            height: 80,
            displayValue: false,
            fit: true
          });
        }
      });
    }
  }, [productsData]);

  useEffect(() => {
    if (shouldPrint && productsData && productsData.products && !loadingProducts) {
      window.print();
      setShouldPrint(false);
    }
  }, [shouldPrint, productsData, loadingProducts]);

  useEffect(() => {
    setShouldPrint(false);
  }, [params.id]);

  const handleBarcodeClick = async () => {
    const { data } = await refetch();
    if (data) {
      setShouldPrint(true);
    }
  };

  useEffect(() => {
    const actions = RULES.canRemove[role]
      ? [
        {
          id: 1,
          icon: 'barcode',
          color: 'blue',
          text: 'Códigos',
          onClick: handleBarcodeClick,
        },
        {
          id: 2,
          icon: 'trash',
          color: 'red',
          onClick: () => setOpen(true),
          text: 'Limpiar lista',
        },
      ]
      : [];
    setActions(actions);
  }, [role, setActions]);

  const { mutate: mutateUpdate, isPending: isLoadingUpdate } = useMutation({
    mutationFn: async (supplier) => {
      const { data } = await edit(supplier);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_SUPPLIERS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_SUPPLIER_QUERY_KEY, params.id] });
        toast.success('Proveedor actualizado!');
        push(PAGES.SUPPLIERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateDelete, isPending: isLoadingDelete } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteBatchProducts(params.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Lista de productos del proveedor eliminada!');
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !supplier) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading || isRefetching || loadingProducts}>
      <NoPrint>
        {Toggle}
      </NoPrint>
      {open &&
        <ModalDelete
          showModal={open}
          setShowModal={setOpen}
          title={deleteQuestion(supplier?.name)}
          onDelete={mutateDelete}
          isLoading={isLoadingDelete}
        />}
      {allowUpdate ? (
        <SupplierForm supplier={supplier} onSubmit={mutateUpdate} isLoading={isLoadingUpdate} isUpdating />
      ) : (
        <>
          <NoPrint>
            <SupplierView supplier={supplier} />
          </NoPrint>
          <OnlyPrint>
            <BarCodeContainer>
              {productsData?.products?.map((product) => (
                <BarCodeSubContainer key={product.code}>
                  <ProductName>{product.name}</ProductName>
                  <Barcode id={`barcode-${product.code}`}></Barcode>
                  <ProductCode>{product.code}</ProductCode>
                </BarCodeSubContainer>
              ))}
            </BarCodeContainer>
          </OnlyPrint>
        </>
      )}
    </Loader>
  );
};

export default Supplier;
