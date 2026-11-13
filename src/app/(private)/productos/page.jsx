"use client"
import { useUserContext } from "@/User";
import { fetchProductsForExport, usePagedProducts } from "@/api/products";
import { useRefreshServerList } from "@/api/pagedLists";
import useServerListFilters from "@/hooks/useServerListFilters";
import { toast } from "react-hot-toast";
import { COLORS, ENTITIES, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import { useBreadcrumContext } from "@/components/layout";
import { BatchImportProducts } from "@/components/products/BatchImportProducts";
import ProductsPage from "@/components/products/ProductsPage";
import { EMPTY_FILTERS, EXAMPLE_TEMPLATE_DATA, PRODUCTS_FILTERS_KEY, PRODUCT_SORT_FIELDS } from "@/components/products/products.constants";
import { getProductsExcelRows } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

const Products = () => {
  const { role } = useUserContext();
  const refreshList = useRefreshServerList(ENTITIES.PRODUCTS);
  const list = useServerListFilters({
    key: PRODUCTS_FILTERS_KEY, defaultFilters: EMPTY_FILTERS, sortFields: PRODUCT_SORT_FIELDS, onApply: refreshList,
  });
  const { data, total, isFetching, error } = usePagedProducts(list);
  const [isExporting, setIsExporting] = useState(false);
  const { hydrated, pageNumber, pageSize, setPageNumber, appliedFilters, sort, order } = list;
  useEffect(() => {
    if (!hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);
  useEffect(() => { if (error) toast.error(error.message); }, [error]);
  const { setLabels } = useBreadcrumContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([{ name: 'Productos' }]);
  }, [setLabels]);

  const handleDownloadExcel = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    try {
      const productsList = await fetchProductsForExport({ appliedFilters, sort, order });
      if (productsList.length) downloadExcel(getProductsExcelRows(productsList), "Lista de Productos");
    } catch (error) {
      toast.error(error.message || "No se pudieron exportar los productos.");
    } finally {
      setIsExporting(false);
    }
  }, [appliedFilters, sort, order, isExporting]);

  const sideActions = useMemo(() => {
    const actions = [];

    if (RULES.canCreateProduct[role]) {
      actions.push({
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        href: PAGES.PRODUCTS.CREATE,
        text: 'Crear producto',
      });
    }

    if (RULES.canCreate[role]) {
      actions.push({
        id: 2,
        icon: ICONS.FILE_EXCEL,
        color: COLORS.BLUE,
        text: 'Excel',
        collapsedTooltip: 'Acciones de productos con Excel',
        items: [
          {
            id: "batch-create",
            text: "Crear lote de productos",
            color: COLORS.GREEN,
            button: <BatchImportProducts key="batch-create" isCreating />,
          },
          {
            id: "batch-update",
            text: "Actualizar lote de productos",
            color: COLORS.BLUE,
            button: <BatchImportProducts key="batch-update" />,
          },
          {
            id: "template",
            icon: ICONS.FILE_EXCEL_OUTLINE,
            color: COLORS.BLUE,
            text: "Descargar plantilla de productos",
            showTooltipWhenExpanded: true,
            onClick: () => downloadExcel(EXAMPLE_TEMPLATE_DATA, "Ejemplo de tabla"),
          },
        ],
      });
    }

    const downloadAction = {
      id: "download-excel", icon: ICONS.DOWNLOAD, color: COLORS.BLUE,
      text: "Descargar productos en Excel", onClick: handleDownloadExcel,
      disabled: !hydrated || isFetching || total === null || total === 0 || isExporting,
      loading: isExporting,
    };
    const excelMenu = actions.find((action) => action.id === 2);
    if (excelMenu) excelMenu.items.push(downloadAction);
    else actions.push(downloadAction);
    return actions;
  }, [role, hydrated, isFetching, total, isExporting, handleDownloadExcel]);

  const createProductShortcuts = useMemo(() => ([
    {
      key: SHORTKEYS.ENTER,
      action: () => push(PAGES.PRODUCTS.CREATE),
      condition: () => RULES.canCreateProduct[role],
    },
  ]), [push, role]);

  useKeyboardShortcuts(createProductShortcuts);

  return (
    <>
      <ProductsPage
        isLoading={!hydrated || isFetching}
        productsList={data?.items ?? []}
        list={list}
        total={total}
        sideActions={sideActions}
      />
    </>
  );
};

export default Products;
