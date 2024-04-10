"use client";
import { useListAllBrands } from "@/api/brands";
import { create, LIST_PRODUCTS_QUERY_KEY } from "@/api/products";
import { useListAllSuppliers } from "@/api/suppliers";
import { ATTRIBUTES as BRANDSATTRIBUTES } from "@/components/brands/brands.common";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { ATTRIBUTES as SUPPLIERSATTRIBUTES } from "@/components/suppliers/suppliers.common";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const { data: brands, isLoading: isLoadingBrands } = useListAllBrands({ attributes: [BRANDSATTRIBUTES.NAME, BRANDSATTRIBUTES.ID] });
  const { data: suppliers, isLoading: isLoadingSuppliers } = useListAllSuppliers({ attributes: [SUPPLIERSATTRIBUTES.NAME, SUPPLIERSATTRIBUTES.ID] });
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const queryClient = useQueryClient();

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
      const { data } = await create(product);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
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
