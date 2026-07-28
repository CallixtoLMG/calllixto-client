"use client"
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import { useBreadcrumContext } from "@/components/layout";
import { BatchImportProducts } from "@/components/products/BatchImportProducts";
import ProductsPage from "@/components/products/ProductsPage";
import { EXAMPLE_TEMPLATE_DATA, PRODUCT_STATES } from "@/components/products/products.constants";
import { getFormatedMargin } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Products = () => {
  const { role } = useUserContext();
  const { data, isLoading, isRefetching, refetch } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: 'Productos' }]);
  }, [setLabels]);

  const products = useMemo(() => data?.products, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    const headers = ['Id', 'Nombre', 'Marca', 'Proveedor', 'Costo', 'Precio', 'Margen', 'Estado', 'Comentarios'];
    const mappedPRoducts = elements.map(product => {
      const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
      return [
        product.id,
        product.name,
        product.brandName,
        product.supplierName,
        product.cost,
        product.price,
        getFormatedMargin(product.price, product.cost),
        productState,
        product.comments
      ];
    });
    downloadExcel([headers, ...mappedPRoducts], "Lista de Productos");
  }, []);

  const sideActions = useMemo(() => {
    const actions = [];

    if (RULES.canCreate[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.PRODUCTS.CREATE) },
        text: 'Crear',
        collapsedTooltip: 'Crear producto',
      },
        {
          id: 2,
          icon: ICONS.FILE_EXCEL,
          color: COLORS.BLUE,
          text: 'Excel',
          collapsedTooltip: 'Acciones de productos con Excel',
          items: [
            {
              id: "batch-create",
              text: "Crear",
              color: COLORS.GREEN,
              collapsedTooltip: "Crear lote de productos",
              button: <BatchImportProducts key="batch-create" isCreating />,
            },
            {
              id: "batch-update",
              text: "Actualizar",
              color: COLORS.BLUE,
              collapsedTooltip: "Actualizar lote de productos",
              button: <BatchImportProducts key="batch-update" />,
            },
            {
              id: "template",
              icon: ICONS.FILE_EXCEL_OUTLINE,
              color: COLORS.BLUE,
              text: "Plantilla",
              collapsedTooltip: "Descargar plantilla de productos",
              onClick: () => downloadExcel(EXAMPLE_TEMPLATE_DATA, "Ejemplo de tabla"),
            },
          ],
        });
    }

    return actions;
  }, [push, role]);

  useKeyboardShortcuts(() => push(PAGES.PRODUCTS.CREATE), SHORTKEYS.ENTER);

  return (
    <>
      <ProductsPage
        onRefetch={refetch}
        isLoading={loading}
        products={loading ? [] : products}
        onDownloadExcel={handleDownloadExcel}
        sideActions={sideActions}
      />
    </>
  );
};

export default Products;
