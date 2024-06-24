import { ENTITIES, SHORTKEY } from '@/constants';
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { createContext, useContext, useMemo, useState } from 'react';

const PaginationContext = createContext();

const PaginationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [activeKey, setActiveKey] = useState();
  const [filters, setFilters] = useState({});
  const [keys, setKeys] = useState({
    [ENTITIES.PRODUCTS]: [null],
    [ENTITIES.BRANDS]: [null],
    [ENTITIES.SUPPLIERS]: [null],
    [ENTITIES.CUSTOMERS]: [null],
    [ENTITIES.BUDGETS]: [null],
  });

  const canGoNext = useMemo(() => {
    return currentPage < keys[activeKey]?.length - 1
  }, [currentPage, keys, activeKey]);

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
    const oldKey = newKeys?.find(k => k?.LSI2 === key?.LSI2 && k?.SK === key?.SK);
    if (!oldKey) {
      newKeys.push(key);
      setKeys({ ...keys, [activeKey]: newKeys });
    }
  };

  const handleEntityChange = (key) => {
    setActiveKey(key);
    setFilters({});
    setCurrentPage(0);
  };

  const resetFilters = (filters = {}) => {
    setKeys({ ...keys, [activeKey]: [null] });
    setFilters(filters);
    setCurrentPage(0);
  };

  const shortcutMapping = {
    [SHORTKEY.LEFT_ARROW]: () => goToPreviousPage(),
    [SHORTKEY.RIGHT_ARROW]: () => goToNextPage(),
  };
  useKeyboardShortcuts(shortcutMapping);

  return (
    <PaginationContext.Provider value={{
      handleEntityChange,
      goToNextPage,
      goToPreviousPage,
      keys,
      setKeys,
      addKey,
      currentPage,
      filters,
      setFilters,
      resetFilters,
      canGoNext
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

