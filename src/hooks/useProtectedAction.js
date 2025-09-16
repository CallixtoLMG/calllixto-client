const useProtectedAction = ({ formRef, onBeforeView }) => {
  const handleProtectedAction = (actionFn) => {
    const isDirty = formRef?.current?.isDirty?.();

    if (isDirty) {
      onBeforeView(actionFn);
    } else {
      actionFn();
    }
  };

  return { handleProtectedAction };
};

export default useProtectedAction;
