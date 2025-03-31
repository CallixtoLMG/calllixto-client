import { useCallback, useState } from "react";

export const useUnsavedChanges = ({ formRef, onDiscard, onSave  }) => {

  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const onBeforeView = useCallback(async () => {

    const isDirty = formRef.current?.isDirty?.();

    if (isDirty) {
      setShowModal(true);
      return false;
    }

    return true;
  }, [formRef]);

  const handleDiscard = useCallback(() => {
    onDiscard?.();
    setShowModal(false);
  }, [onDiscard]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave?.();
    } catch (err) {
      console.error(err);
    }

  }, [onSave]);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setIsSaving(false);
  }, []);

  return {
    showModal,
    closeModal,
    isSaving,
    onBeforeView,
    handleDiscard,
    handleSave,
    handleCancel,
  };
};
