"use client";
import { useUserContext } from "@/User";
import { edit, useGetProduct } from "@/api/products";
import PrintBarCodes from "@/components/common/custom/PrintBarCodes";
import { Loader, OnlyPrint, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ProductForm from "@/components/products/ProductForm";
import { PAGES, PRODUCTS_STATES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "react-hot-toast";
import { useReactToPrint } from "react-to-print";
import ProductView from "../../../components/products/ProductView";

const Product = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: product, isLoading } = useGetProduct(params.code);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });

  const printRef = useRef(null);

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stateTitle = product?.state ? PRODUCTS_STATES[product.state]?.singularTitle || PRODUCTS_STATES.INACTIVE.singularTitle : PRODUCTS_STATES.INACTIVE.singularTitle;
  const stateColor = product?.state ? PRODUCTS_STATES[product.state]?.color || PRODUCTS_STATES.INACTIVE.color : PRODUCTS_STATES.INACTIVE.color;
  useEffect(() => {
    setLabels([
      PAGES.PRODUCTS.NAME,
      product?.id ? { id: product.id, title: stateTitle, color: stateColor } : null
    ].filter(Boolean));
  }, [setLabels, product]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (product) => {
      const { data } = await edit(product);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Producto actualizado!');
        push(PAGES.PRODUCTS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  if (!isLoading && !product) {
    push(PAGES.NOT_FOUND.BASE);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  useEffect(() => {
    if (product) {
      const actions = [
        {
          id: 1,
          icon: 'barcode',
          color: 'blue',
          onClick: () => setTimeout(handlePrint),
          text: 'Código'
        },
      ];
      setActions(actions);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product, setActions]);

  return (
    <Loader active={isLoading}>
      {Toggle}
      {isUpdating ? (
        <ProductForm product={product} onSubmit={mutate} isUpdating isLoading={isPending} />
      ) : (
        <ProductView product={product} />
      )}
      {product && (
        <OnlyPrint>
          <PrintBarCodes singelProduct ref={printRef} products={[product]} />
        </OnlyPrint>
      )}
    </Loader>
  )
};

export default Product;
