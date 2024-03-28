import { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

const PaginationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeKey, setActiveKey] = useState();
  const [filters, setFilters] = useState({});
  const [keys, setKeys] = useState({
    products: [null],
    brands: [null],
    suppliers: [null],
    customers: [null],
    budgets: [null],
  });

  const goToNextPage = () => {
    if (currentPage < keys[activeKey].length - 1) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  };

  const addKey = (key, activeKey) => {
    const newKeys = [...keys[activeKey]];
    if (!newKeys.includes(key)) {
      newKeys.push(key);
      setKeys({ ...keys, [activeKey]: newKeys });
    }
  };

  const handleEntityChange = (key) => {
    setCurrentPage(0);
    setActiveKey(key)
    setFilters({})
  };

  const resetPagination = () => {
    setFilters({});
    resetKeys();
  };

  const resetKeys = () => {
    setKeys({ ...keys, [activeKey]: [null] });
    setCurrentPage(0);
  };

  return (
    <PaginationContext.Provider value={{
      handleEntityChange,
      resetPagination,
      goToNextPage,
      goToPreviousPage,
      keys,
      setKeys,
      addKey,
      currentPage,
      filters,
      setFilters,
      resetKeys
    }}>
      {children}
    </PaginationContext.Provider>
  );
};

const usePaginationContext = () => {
  const context = useContext(PaginationContext);
  if (context === undefined) {
    throw new Error('usePaginationContext must be used within a PaginationProvider');
  }
  return context;
};

export { PaginationProvider, usePaginationContext };

