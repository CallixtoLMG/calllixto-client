import { DropdownControlled, TextControlled } from "@/common/components/form";
import { Filters, Table } from '@/common/components/table';
import { COLORS, DATE_FORMATS, ENTITIES, ICONS, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { createFilter, downloadExcel, getFormatedPercentage, handleUndefined } from '@/common/utils';
import { getFormatedDate } from "@/common/utils/dates";
import { getTotal } from "@/components/products/products.utils";
import { useFilters } from "@/hooks";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { BUDGETS_FILTERS_KEY, BUDGET_STATES, BUDGET_STATES_OPTIONS, BUDGET_STATE_TRANSLATIONS, EMPTY_FILTERS, PAYMENT_STATES, PAYMENT_STATES_OPTIONS, getBudgetColumns } from "../budgets.constants";

const BudgetsPage = ({ budgets, filterKey = BUDGETS_FILTERS_KEY, isLoading, onRefetch }) => {
  const { push } = useRouter();

  const handleDownloadExcel = useCallback((elements) => {
    if (!elements.length) return;
    let maxProductCount = 1;
    const mappedBudgets = elements.map(budget => {
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
  }, []);

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = useFilters({ defaultFilters: EMPTY_FILTERS, key: filterKey });

  const onFilter = createFilter(filters, {
    id: {},
    customer: { field: 'name' },
    paymentStatus: {
      custom: (item) => {
        const filter = filters.paymentStatus;

        if (!filter) return true;

        const total = Number(item.total ?? 0);
        const paid = Number(item.paidAmount ?? 0);

        if (filter === PAYMENT_STATES.PAID.id) {
          return paid === total;
        }

        if (filter === PAYMENT_STATES.PENDING.id) {
          return paid < total;
        }

        return true;
      }
    },
    createdBy: {},
    state: { skipAll: true },
  });

  const cashBudgetColumns = useMemo(
    () => getBudgetColumns(filters.state),
    [filters.state]
  );

  useEffect(() => {
    if (filters.state !== BUDGET_STATES.CONFIRMED.id && filters.paymentStatus) {
      methods.setValue("paymentStatus", "");
      onSubmit();
    }
  }, [filters.state, filters.paymentStatus, methods, onSubmit]);

  const actions = [
    {
      id: 1,
      icon: ICONS.COPY,
      color: COLORS.GREEN,
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    }
  ];

  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            entity={ENTITIES.BUDGETS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
          >
            <DropdownControlled
              filter
              width="200px"
              name="state"
              options={BUDGET_STATES_OPTIONS}
              defaultValue={SELECT_ALL_OPTION.state}
              afterChange={onSubmit}
            />
            <TextControlled
              width="120px"
              name="id"
              placeholder="Id"
            />
            <TextControlled
              flex="1"
              name="customer"
              placeholder="Cliente"
            />
            <TextControlled
              flex="1"
              name="createdBy"
              placeholder="Vendedor"
            />
            {filters.state === BUDGET_STATES.CONFIRMED.id && (
              <DropdownControlled
                filter
                width="200px"
                name="paymentStatus"
                placeholder="Estado de pago"
                options={PAYMENT_STATES_OPTIONS}
                afterChange={onSubmit}
              />
            )}
          </Filters>
        </Form>
      </FormProvider>
      <Table
        isLoading={isLoading}
        headers={cashBudgetColumns}
        elements={budgets}
        page={PAGES.BUDGETS}
        actions={actions}
        color={BUDGET_STATES[filters.state]?.color}
        onFilter={onFilter}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={handleDownloadExcel}
      />
    </>
  );
};

export default BudgetsPage;
