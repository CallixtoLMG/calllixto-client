import { useCallback, useRef, useState } from "react";

export const useUnsavedChanges = ({ formRef, onDiscard, onSave }) => {
  const skipNext = useRef(false);
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onBeforeView = useCallback(async () => {
    if (skipNext.current) {
      skipNext.current = false;
      return true;
    }

    const isDirty = formRef.current?.isDirty?.();

    if (isDirty) {
      setShowModal(true);
      return false;
    }

    return true;
  }, [formRef]);

  const handleDiscard = useCallback(() => {
    skipNext.current = true;
    onDiscard?.();
    setShowModal(false);
  }, [onDiscard]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    console.log("⏳ isSaving now TRUE");

    skipNext.current = true;
    try {
      await onSave?.();
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShowModal(false);
    } finally {
      setIsSaving(false);
    }
  }, [onSave]);

  return {
    showModal,
    isSaving,
    setShowModal,
    onBeforeView,
    handleDiscard,
    handleSave,
  };
};
