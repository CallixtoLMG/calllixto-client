"use client";
import { useUserContext } from "@/User";
import { createBatch, editBatch, useListProducts } from "@/api/products";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { downloadExcel } from "@/utils";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const mockData = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

const Products = () => {
  useValidateToken();
  const { role } = useUserContext();
  const { data: products, isLoading } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);
  const isCreating = true;
  const task = (isCreating) => {
    return {
      buttonText: isCreating ? "Crear" : "Actualizar",
      onSubmit: isCreating ? createBatch : editBatch,
      processData: (formattedProduct, existingCodes, downloadProducts, importProducts) => {
        if (existingCodes[formattedProduct.code]) {
          isCreating ? downloadProducts.push(formattedProduct) : importProducts.push(formattedProduct);
        } else {
          isCreating ? importProducts.push(formattedProduct) : downloadProducts.push(formattedProduct);
        }
      },
      isButtonDisabled: (isCreating, isLoading, isPending, isDirty) => {
        return isCreating ? isLoading || isPending || !isDirty : isLoading || isPending;
      }
    };
  };

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  useEffect(() => {
    const visibilityRules = Rules(role);
    const actions = visibilityRules.canSeeButtons ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.PRODUCTS.CREATE) },
        text: 'Crear'
      },
      {
        id: 2,
        button: <BatchImport products={products} task={task(isCreating)} />,
      },
      {
        id: 3,
        button: <BatchImport products={products} task={task()} />,
      },
      {
        id: 4,
        icon: 'download',
        color: 'blue',
        onClick: () => downloadExcel(mockData),
        text: 'Plantilla'
      },
      {
        id: 5,
        icon: 'trash',
        color: 'orange',
        onClick: () => setOpen(true),
        text: 'Anular'
      },
    ] : [];
    setActions(actions);
  }, [products, push, role, setActions, isCreating]);

  return (
    <Loader active={isLoading}>
      {open && <BanProduct open={open} setOpen={setOpen} />}
      <ProductsPage
        products={products}
        role={role}
      />
    </Loader>
  );
};

export default Products;
