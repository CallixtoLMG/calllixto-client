import { fetchProductsForExport, usePagedProducts } from "@/api/products";
import { Table } from "@/common/components/table";
import { COLORS, ENTITIES, ICONS, PAGES, toUiSorting } from "@/common/constants";
import { downloadExcel, getEntityExcelFileName } from "@/common/utils";
import { useListPageSideActions } from "@/components/layout";
import { PRODUCT_COLUMNS, PRODUCT_SORT_FIELDS } from "@/components/products/products.constants";
import { getProductsExcelRows } from "@/components/products/products.utils";
import useListExcelExport from "@/hooks/useListExcelExport";
import useServerListFilters from "@/hooks/useServerListFilters";
import { useEffect, useMemo } from "react";
import { Message } from "semantic-ui-react";

const PRODUCT_SCOPES = {
  [ENTITIES.BRAND]: {
    filter: "brandId", preferences: "brandProductsFilters", exportEntity: ENTITIES.BRANDS,
    mismatchMessage: "El listado devolvió productos de otra marca.",
  },
  [ENTITIES.SUPPLIER]: {
    filter: "supplierId", preferences: "supplierProductsFilters", exportEntity: ENTITIES.SUPPLIERS,
    mismatchMessage: "El listado devolvió productos de otro proveedor.",
  },
};

const RelatedProducts = ({ entity, id, name }) => {
  const { filter, preferences, exportEntity, mismatchMessage } = PRODUCT_SCOPES[entity];
  const list = useServerListFilters({
    key: `${preferences}:${id}`,
    defaultFilters: {},
    sortFields: PRODUCT_SORT_FIELDS,
  });
  const { hydrated, pageNumber, pageSize, setPageNumber, sort, order, appliedFilters } = list;
  const request = useMemo(() => ({
    hydrated, pageNumber, pageSize, sort, order, appliedFilters: { ...appliedFilters, [filter]: id },
  }), [hydrated, pageNumber, pageSize, sort, order, appliedFilters, filter, id]);
  const { data, total, isFetching, error } = usePagedProducts(request);
  const productsList = data?.items;
  const errorMessage = error?.message ?? (
    productsList?.some((product) => product[filter] !== id) ? mismatchMessage : undefined
  );
  const { isExporting, startExport } = useListExcelExport({
    entity: exportEntity,
    id,
    errorMessage: "No se pudieron exportar los productos.",
    exportFile: async (state) => {
      const matches = await fetchProductsForExport(state);
      if (matches.some((product) => product[filter] !== id)) {
        throw new Error(mismatchMessage);
      }
      if (matches.length) {
        downloadExcel(getProductsExcelRows(matches), getEntityExcelFileName(entity, name, id));
      }
    },
  });
  const exportDisabled = !hydrated || isFetching || !!errorMessage || !(total > 0) || isExporting;
  const exportTooltip = errorMessage ? "No se pudieron cargar los productos."
    : total === 0 ? "No hay productos para descargar." : undefined;
  const sideActions = useMemo(() => [{
    id: "download-excel",
    icon: ICONS.FILE_EXCEL,
    color: COLORS.BLUE,
    text: "Descargar Excel",
    disabled: exportDisabled,
    loading: isExporting,
    tooltip: exportTooltip,
    onClick: () => startExport(request),
  }], [exportDisabled, isExporting, exportTooltip, startExport, request]);
  useListPageSideActions({ sideActions });

  useEffect(() => {
    if (!hydrated || isFetching || total === null) return;
    const lastPage = Math.max(1, Math.ceil(total / pageSize));
    if (pageNumber > lastPage) setPageNumber(lastPage);
  }, [hydrated, isFetching, total, pageNumber, pageSize, setPageNumber]);

  if (errorMessage) return <Message negative role="alert" header="No se pudieron cargar los productos." content={errorMessage} />;

  return (
    <Table
      elements={productsList}
      headers={PRODUCT_COLUMNS}
      page={PAGES.PRODUCTS}
      isLoading={!hydrated || isFetching}
      paginate
      serverPagination={{
        hydrated, total, pageNumber, pageSize,
        sorting: {
          key: Object.keys(PRODUCT_SORT_FIELDS).find((key) => PRODUCT_SORT_FIELDS[key] === sort),
          direction: toUiSorting(order),
        },
        sortFields: PRODUCT_SORT_FIELDS,
        onPageChange: setPageNumber,
        onPageSizeChange: list.setPageSize,
        onSortChange: list.setSorting,
      }}
    />
  );
};

export default RelatedProducts;
