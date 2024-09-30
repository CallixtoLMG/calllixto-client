"use client";
import { useListBrands } from "@/api/brands";
import { useCreateProduct } from "@/api/products";
import { useListSuppliers } from "@/api/suppliers";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const { data: brands, isLoading: isLoadingBrands } = useListBrands();
  const { data: suppliers, isLoading: isLoadingSuppliers } = useListSuppliers();
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createProduct = useCreateProduct();

  useEffect(() => {
    resetActions();
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
    mutationFn: async (product) => {
      const response = await createProduct(product);
      return response;
    },
    onSuccess: async (response) => {
      if (response.statusOk) {
        toast.success('Producto creado!');
        push(PAGES.PRODUCTS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(error.message);
    }
  });

  return (
    <Loader active={isLoadingBrands || isLoadingSuppliers}>
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
