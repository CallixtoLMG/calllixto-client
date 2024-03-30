"use client";
import { Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { BUDGETS_COLUMNS, FILTERS } from "../budgets.common";

const BudgetsPage = ({ budgets }) => {
  const { push } = useRouter();
  const { resetFilters } = usePaginationContext();

  const onFilter = (data) => {
    const filters = { ...data };
    if (data.code) {
      filters.sort = "id";
    }
    if (data.customer) {
      filters.sort = "customer";
    }
    if (data.seller) {
      filters.sort = "seller";
    }
    resetFilters(filters);
  };

  const actions = [
    {
      id: 1,
      icon: 'copy',
      color: 'green',
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    },
  ];

  return (
    <Table
      headers={BUDGETS_COLUMNS}
      elements={budgets}
      page={PAGES.BUDGETS}
      actions={actions}
      filters={FILTERS}
      onFilter={onFilter}
      pag
    />
  )
};

export default BudgetsPage;
