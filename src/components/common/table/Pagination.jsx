import { createContext, useContext, useState } from 'react';

const PaginationContext = createContext();

const PaginationProvider = ({ children }) => {

  const [previousKeys, setPreviousKeys] = useState([]);
  const [currentPage, setCurrentPage] = useState(-1);
  const [nextKey, setNextKey] = useState(null);
  const goToNextPage = (key) => {
    if (nextKey) {
      setCurrentPage(prevState => Math.max(prevState + 1, 0));
      setPreviousKeys(prevKeys => [...prevKeys, nextKey]);
      setNextKey(key);
    }

  };
  const goToPreviousPage = () => {
    setCurrentPage(prevState => Math.max(prevState - 1, -1));
    setNextKey(previousKeys.pop());
    setPreviousKeys(previousKeys);
  };

  const addNextKey = (key) => {
    setNextKey(key);
  };

  return (
    <PaginationContext.Provider value={{ goToNextPage, goToPreviousPage, previousKeys, nextKey, setNextKey, addNextKey, currentPage }}>
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

