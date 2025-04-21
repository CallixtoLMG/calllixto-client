import { useCallback } from "react";

export const useProtectedAction = ({ formRef, onBeforeView }) => {
  const handleProtectedAction = useCallback(
    (actionFn) => {
      if (formRef.current?.isDirty()) {
        onBeforeView(actionFn);
      } else {
        actionFn();
      }
    },
    [formRef, onBeforeView]
  );

  return { handleProtectedAction };
};
