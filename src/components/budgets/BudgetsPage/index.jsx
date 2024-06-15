import { Table } from '@/components/common/table';
import { usePaginationContext } from "@/components/common/table/Pagination";
import { BUDGET_STATES, PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { BUDGETS_COLUMNS, FILTERS } from "../budgets.common";
import { useState } from 'react';

const BudgetsPage = ({ budgets, isLoading }) => {
  const { push } = useRouter();
  const { resetFilters } = usePaginationContext();
  const [selectedStateColor, setSelectedStateColor] = useState();

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
    if (data.state === 'ALL') {
      delete filters.state;
    }
    setSelectedStateColor(Object.values(BUDGET_STATES).find(state => state.id === filters.state)?.color);
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
      isLoading={isLoading}
      headers={BUDGETS_COLUMNS}
      elements={budgets}
      page={PAGES.BUDGETS}
      actions={actions}
      filters={FILTERS}
      onFilter={onFilter}
      usePagination
      color={selectedStateColor}
    />
  )
};

export default BudgetsPage;
