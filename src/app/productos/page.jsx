"use client";
import { createBatch, deleteProduct, editBatch, useListProducts } from "@/api/products";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BatchCreate from "@/components/products/BatchCreate";
import BatchUpdate from "@/components/products/BatchUpdate";
import ButtonImport from "@/components/products/ButtonImport";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { downloadExcel } from "@/utils";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const mockData = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

const Products = () => {
  useValidateToken();
  const role = useRole();
  const { products, isLoading } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

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
        button: <ButtonImport products={products} createBatch={createBatch} editBatch={editBatch} />,
      },
      {
        id: 3,
        button: <BatchCreate products={products} createBatch={createBatch} />,
      },
      {
        id: 4,
        button: <BatchUpdate products={products} editBatch={editBatch} />,
      },
      {
        id: 5,
        icon: 'download',
        color: 'blue',
        onClick: () => downloadExcel(mockData),
        text: 'Plantilla'
      }
    ] : [];
    setActions(actions);
  }, [products, push, role, setActions]);

  return (
    <Loader active={isLoading}>
      <ProductsPage
        products={products}
        role={role}
        onDelete={deleteProduct}
      />
    </Loader>
  );
};

export default Products;
