"use client";
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { ENTITIES, PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { downloadExcel } from "@/utils";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const mockData = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

const Products = () => {
  useValidateToken();
  const { role } = useUserContext();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.PRODUCTS);
  }, []);

  const { data, isLoading, isRefetching } = useListProducts({ sort: 'date', order: false, attributes: ["name", "price", "code"] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  const products = useMemo(() => {
    return data?.products
  }, [data?.products]);

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
        button: <BatchImport isCreating />,
      },
      {
        id: 3,
        button: <BatchImport />,
      },
      {
        id: 4,
        icon: 'download',
        color: 'blue',
        onClick: () => downloadExcel(mockData, "Ejemplo de tabla"),
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
  }, [products, push, role, setActions]);

  return (
    <>
      {open && <BanProduct open={open} setOpen={setOpen} />}
      <ProductsPage
        isRefetching={isRefetching}
        isLoading={isLoading}
        products={data?.products}
        role={role}
      />
    </>
  );
};

export default Products;
