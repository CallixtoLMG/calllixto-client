"use client";
import { createBatch, deleteProduct, editBatch, useListProducts } from "@/api/products";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import ImportExcel from "@/components/products/ImportProduct";
import ProductsPage from "@/components/products/ProductsPage";
import { PAGES } from "@/constants";
import { useRole, useValidateToken } from "@/hooks/userData";
import { Rules } from "@/visibilityRules";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import * as XLSX from 'xlsx';

const Products = () => {
  useValidateToken();
  const role = useRole();
  const { products, isLoading } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  const handleDownload = () => {
    const mockData = [
      ['Codigo', 'Codigo Proveedor', 'Nombre', 'Precio', 'Comentarios'],
      ['AABB001', 'CP001', "Producto 1", 200, 'Comentarios...'],
      ['AABB002', 'CP002', "Producto 2", 300, 'Comentarios...'],
      ['AABB003', 'CP003', "Producto 3", 400, 'Comentarios...'],
    ];
    const ws = XLSX.utils.aoa_to_sheet(mockData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet 1');
    XLSX.writeFile(wb, 'Ejemplo de Tabla.xlsx');
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
        button: <ImportExcel products={products} createBatch={createBatch} editBatch={editBatch} />,
      },
      {
        id: 3,
        icon: 'download',
        color: 'blue',
        onClick: handleDownload,
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
