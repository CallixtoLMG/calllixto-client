"use client"
import { createContext, useContext } from "react";

export const TaskContext = createContext();

export const useProducts = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useProduct must used with Provider")
  return context
}

const TaskProvider = ({ children }) => {
  const products = []
  return <TaskContext.Provider value={products}>
    {children}
  </TaskContext.Provider>
}

export default TaskProvider;