"use client";
import { useListBrands } from "@/api/brands";
import { useCreateProduct } from "@/api/products";
import { useGetSetting } from "@/api/settings";
import { useListSuppliers } from "@/api/suppliers";
import { ENTITIES, HARD_DELETED, PAGES } from "@/common/constants";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-hot-toast";

const CreateProduct = () => {
  useValidateToken();
  const { push } = useRouter();
  const { data: brands, isLoading: isLoadingBrands, refetch: refetchBrands, isRefetching: isBrandsRefetching } = useListBrands();
  const { data: suppliers, isLoading: isLoadingSuppliers, refetch: refetchSuppliers, isRefetching: isSupplierRefetching } = useListSuppliers();
  const { data: blacklist, refetch: refetchBlacklist } = useGetSetting(ENTITIES.PRODUCT);
  const { setLabels } = useBreadcrumContext();
  const { resetActions } = useNavActionsContext();
  const createProduct = useCreateProduct();
  const filterBrands = brands?.brands?.filter((brand) => brand.state !== HARD_DELETED) ?? [];
  const filterSuppliers = suppliers?.suppliers?.filter((supplier) => supplier.state !== HARD_DELETED) ?? [];

  useEffect(() => {
    resetActions();
    refetchBrands();
    refetchSuppliers();
    refetchBlacklist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    setLabels(['Productos', 'Crear']);
  }, [setLabels]);

  const { mutate, isPending } = useMutation({
    mutationFn: createProduct,
    onSuccess: async (response) => {
      if (response.statusOk) {
        push(PAGES.PRODUCTS.SHOW(response.product.id))
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
        brands={filterBrands ?? []}
        suppliers={filterSuppliers ?? []}
        onSubmit={mutate}
        isLoading={isPending}
        blacklist={blacklist?.blacklist}
      />
    </Loader>
  )
};

export default CreateProduct;
