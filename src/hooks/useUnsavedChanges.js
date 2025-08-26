import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const useUnsavedChanges = ({ formRef, onDiscard, onSave }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const isDirtyRef = useRef(false);
  const skipNextNavigation = useRef(false);
  const submitPromiseRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef?.current && typeof formRef.current.isDirty === "function") {
        isDirtyRef.current = formRef.current.isDirty();
      } else {
        isDirtyRef.current = false;
      }
    }, 300);
  
    return () => clearInterval(interval);
  }, [formRef]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  useEffect(() => {
    const originalPush = router.push;

    router.push = (...args) => {
      if (isDirtyRef.current && !skipNextNavigation.current && !showModal) {
        setShowModal(true);
      } else {
        originalPush(...args);
      }
    };

    return () => {
      router.push = originalPush;
    };
  }, [router, showModal]);

  useEffect(() => {
    const handlePopState = (e) => {
      if (isDirtyRef.current) {
        e.preventDefault?.();
        setShowModal(true);
        history.pushState(null, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleDiscard = useCallback(async () => {
    await onDiscard?.();
    isDirtyRef.current = false;
    closeModal();
  }, [onDiscard, closeModal]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);

    try {
      const result = await new Promise((resolve, reject) => {
        submitPromiseRef.current = { resolve, reject };
        onSave?.();
      });

      isDirtyRef.current = false;
      closeModal();
      return result;
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSaving(false);
      submitPromiseRef.current = null;
    }
  }, [onSave, closeModal]);

  const resolveSave = useCallback(() => {
    if (submitPromiseRef.current) {
      submitPromiseRef.current.resolve();
      submitPromiseRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const onBeforeView = useCallback(async () => {
    const isDirty = formRef.current?.isDirty?.();
    if (isDirty) {
      setShowModal(true);
      return false;
    }
    return true;
  }, [formRef]);

  return {
    showModal,
    isSaving,
    handleDiscard,
    handleSave,
    handleCancel,
    onBeforeView,
    closeModal,
    resolveSave,
  };
};

export default useUnsavedChanges;
