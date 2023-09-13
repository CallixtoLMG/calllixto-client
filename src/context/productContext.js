"use client"
import { createContext, useContext, useState } from "react";
export const TaskContext = createContext();

export const useProducts = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useProduct must used with Provider");
  return context;
};

const TaskProvider = ({ children }) => {
  const [products, setProducts] = useState([])

  const createProduct = (name, stock, price) => {
    setProducts(
      [...products, {
        name,
        stock,
        price,
        id: products.length + 1,
      }]);
  };

  const deleteProduct = (id) => {
    setProducts([...products.filter(product => product.id !== id)])
  };

  const updateProduct = (id, updatedProduct) => {
    setProducts([...products.map(product => product.id === id ? { ...product, ...updatedProduct } : product)])
  };

  return (
    <TaskContext.Provider value={{ products, createProduct, deleteProduct, updateProduct }}>
      {children}
    </TaskContext.Provider>
  )
};

export default TaskProvider;