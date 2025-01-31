"use client";
import { useListBrands } from "@/api/brands";
import { useCreateProduct } from "@/api/products";
import { useListSuppliers } from "@/api/suppliers";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/common/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const { data: brands, isLoading: isLoadingBrands, refetch: refetchBrands, isRefetching: isBrandsRefetching } = useListBrands();
  const { data: suppliers, isLoading: isLoadingSuppliers, refetch: refetchSuppliers, isRefetching: isSupplierRefetching } = useListSuppliers();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createProduct = useCreateProduct();

  useEffect(() => {
    resetActions();
    refetchBrands();
    refetchSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Productos', 'Crear']);
  }, [setLabels]);

  const mappedBrands = useMemo(() => brands?.brands?.map(brand => ({
    ...brand,
    key: brand.id,
    value: brand.name,
    text: brand.name,
  })), [brands]);

  const mappedSuppliers = useMemo(() => suppliers?.suppliers?.map(supplier => ({
    ...supplier,
    key: supplier.id,
    value: supplier.name,
    text: supplier.name,
  })), [suppliers]);

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.PRODUCTS.SHOW(response.product.code))
        toast.success('Producto creado!');
      } else {
        toast.error(response.error.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <Loader active={isLoadingBrands || isLoadingSuppliers || isBrandsRefetching || isSupplierRefetching}>
      <ProductForm
        brands={mappedBrands}
        suppliers={mappedSuppliers}
        onSubmit={mutate}
        isLoading={isPending}
      />
    </Loader>
  )
};

export default CreateProduct;
