import { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

const PaginationProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);

  const goToNextPage = () => {
    setCurrentPage((prevPage) => prevPage + 1);
    setLastEvaluatedKey(lastEvaluatedKey)
    console.log(lastEvaluatedKey)
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prevPage) => prevPage - 1);
    }
  };

  return (
    <PaginationContext.Provider value={{ currentPage, goToNextPage, goToPreviousPage, lastEvaluatedKey, setLastEvaluatedKey }}>
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

