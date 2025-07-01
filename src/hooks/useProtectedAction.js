const useProtectedAction = ({ formRef, onBeforeView }) => {
  const handleProtectedAction = (actionFn) => {
    if (formRef.current?.isDirty()) {
      onBeforeView(actionFn);
    } else {
      actionFn();
    }
  };

  return { handleProtectedAction };
};

export default useProtectedAction;
