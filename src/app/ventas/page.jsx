"use client";
import { useListBudgets } from "@/api/budgets";
import { COLORS, DATE_FORMATS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel, handleUndefined } from "@/common/utils";
import { getFormatedDate } from "@/common/utils/dates";
import BudgetsPage from "@/components/budgets/BudgetsPage";
import { BUDGET_STATE_TRANSLATIONS } from "@/components/budgets/budgets.constants";
import { getTotalSum } from "@/components/budgets/budgets.utils";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { getTotal } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";

const Budgets = () => {
  useValidateToken();
  const { data, isLoading, isRefetching, refetch } = useListBudgets();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels([PAGES.BUDGETS.NAME]);
    refetch()
  }, [setLabels, refetch]);

  const budgets = useMemo(() => data?.budgets, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

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
        getTotalSum(budget.products, budget.globalDiscount, budget.additionalCharge),
        `% ${budget.globalDiscount ?? 0}`,
        `% ${budget.additionalCharge ?? 0}`,
        handleUndefined(budget.seller)
      ];

      const productData = budget.products.map(product => {
        let productName = handleUndefined(product.name);
        if (product.fractionConfig?.active) {
          productName = `${product.name} x ${product.fractionConfig.value} ${product.fractionConfig.unit}`;
        }
        return `Código: ${handleUndefined(product.code)}, Cantidad: ${handleUndefined(product.quantity)}, Nombre: ${productName}, Precio: ${product.price ?? 0}, Descuento: % ${product.discount ?? 0}, Total: ${getTotal(product)};`;
      });

      while (productData.length < maxProductCount) {
        productData.push('');
      }

      return [...budgetRow, ...productData];
    });

    const productsHeaders = Array.from(Array(maxProductCount).keys()).map((index) => `Producto ${index + 1}`);
    const headers = ['ID', 'Estado', 'Cliente', 'Fecha', "Total", "Descuento", "Cargo adicional", "Vendedor", ...productsHeaders];
    downloadExcel([headers, ...mappedBudgets], "Lista de Ventas");
  }, [budgets]);

  useEffect(() => {
    const actions = [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
        onClick: () => { push(PAGES.BUDGETS.CREATE) },
        text: 'Crear'
      },
      {
        id: 3,
        icon: ICONS.FILE_EXCEL,
        color: COLORS.SOFT_GREY,
        width: "fit-content",
        onClick: handleDownloadExcel,
        text: 'Presupuestos',
        disabled: loading
      },
    ];
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.BUDGETS.CREATE), SHORTKEYS.ENTER);

  return (
    <BudgetsPage onRefetch={refetch} isLoading={loading} budgets={loading ? [] : budgets} />
  )
};

export default Budgets;
