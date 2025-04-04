import { createContext, useContext } from "react";

export const UnsavedChangesContext = createContext({
  onBeforeView: null,
});

export const useUnsavedContext = () => useContext(UnsavedChangesContext);