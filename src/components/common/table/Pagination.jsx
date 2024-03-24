import { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

const PaginationProvider = ({ children }) => {

  const [filters, setFilters] = useState({});
  const [keys, setKeys] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);
  const goToNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const goToPreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  const addKey = (key) => {
    if (!keys.includes(key)) {
      keys.push(key)
    };
  };

  const resetKeys = () => {
    setKeys([null])
  };

  return (
    <PaginationContext.Provider value={{ goToNextPage, goToPreviousPage, keys, setKeys, addKey, currentPage, resetKeys, filters, setFilters }}>
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

