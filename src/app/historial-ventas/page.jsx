"use client";
import { useListBudgetsHistory } from "@/api/budgets";
import { DATE_FORMATS, ICONS, PAGES } from "@/common/constants";
import { downloadExcel, getFormatedPercentage, handleUndefined } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import BudgetsHistoryFilter from "@/components/budgets/BudgetsHistoryFilters";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGET_STATE_TRANSLATIONS } from "@/components/budgets/budgets.constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { getTotal } from "@/components/products/products.utils";
import { useValidateToken } from "@/hooks";
import { useCallback, useEffect, useMemo, useState } from "react";

const BudgetsHistory = () => {
  useValidateToken();
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  const { data, isLoading, refetch, isRefetching } = useListBudgetsHistory(
    {
      sort: "createdAt",
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    },
    { enabled: false }
  );

  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();

  useEffect(() => {
    setLabels([PAGES.BUDGETS_HISTORY.NAME]);
  }, [setLabels]);

  useEffect(() => {
    if (dateRange.startDate || dateRange.endDate) {
      refetch();
    }
  }, [dateRange, refetch]);

  const handleSearch = (newRange) => {
    setDateRange(newRange);
  };

  const budgets = useMemo(() => data, [data]);
  const loading = isLoading || isRefetching;

  const handleDownloadExcel = useCallback(() => {
    if (!budgets) return;
    let maxProductCount = 1;
    const mappedBudgets = budgets.map(budget => {
      const translatedState = BUDGET_STATE_TRANSLATIONS[budget.state].singularTitle || "";
      maxProductCount = Math.max(maxProductCount, budget.products?.length);
      const budgetRow = [
        handleUndefined(budget.id),
        handleUndefined(translatedState),
        handleUndefined(budget.customer.name),
        handleUndefined(getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME)),
        handleUndefined(budget.total),
        getFormatedPercentage(budget.globalDiscount),
        getFormatedPercentage(budget.additionalCharge),
        handleUndefined(budget.createdBy)
      ];

      const productData = budget.products.map(product => {
        let productName = handleUndefined(product.name);
        if (product.fractionConfig?.active) {
          productName = `${product.name} x ${product.fractionConfig.value} ${product.fractionConfig.unit}`;
        }
        return `Id: ${handleUndefined(product.id)}, Cantidad: ${handleUndefined(product.quantity)}, Nombre: ${productName}, Precio: ${product.price ?? 0}, Descuento: % ${product.discount ?? 0}, Total: ${getTotal(product)};`;
      });

      while (productData.length < maxProductCount) {
        productData.push('');
      }

      return [...budgetRow, ...productData];
    });

    const productsHeaders = Array.from({ length: maxProductCount }, (_, i) => `Producto ${i + 1}`);
    const headers = ['ID', 'Estado', 'Cliente', 'Fecha', "Total", "Descuento", "Cargo adicional", "Vendedor", ...productsHeaders];
    downloadExcel([headers, ...mappedBudgets], "Lista de Ventas");
  }, [budgets]);

  useEffect(() => {
    setActions([
      {
        id: 1,
        icon: ICONS.FILE_EXCEL,
        width: "fit-content",
        onClick: handleDownloadExcel,
        text: 'Presupuestos',
        disabled: loading || !budgets
      },
    ]);
  }, [handleDownloadExcel, loading, setActions]);

  return (
    <>
      <BudgetsHistoryFilter onSearch={handleSearch} isLoading={loading} />
      {dateRange.startDate && dateRange.endDate && <BudgetsPage isLoading={loading} budgets={loading ? [] : budgets} />}
    </>
  );
};

export default BudgetsHistory;