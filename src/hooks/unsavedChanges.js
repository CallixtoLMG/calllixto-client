import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

export const useUnsavedChanges = ({ formRef, onDiscard, onSave }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();
  const isDirtyRef = useRef(false);
  const skipNextNavigation = useRef(false);
  const submitPromiseRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      isDirtyRef.current = formRef.current?.isDirty?.() ?? false;
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
  }, []);

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
    closeModal();
  }, [onDiscard, closeModal]);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      const result = await new Promise((resolve, reject) => {
        submitPromiseRef.current = { resolve, reject };
        const maybePromise = onSave?.();
        if (maybePromise instanceof Promise) {
          maybePromise.then(resolve).catch(reject);
        }
      });
      closeModal();
      return result;
    } catch (err) {
      console.error("Error al guardar:", err);
    } finally {
      setIsSaving(false);
    }
  }, [onSave, closeModal]);

  const resolveSave = useCallback(() => {
    if (submitPromiseRef.current) {
      submitPromiseRef.current.resolve();
      submitPromiseRef.current = null;
    }
  }, []);

  const rejectSave = useCallback((error) => {
    if (submitPromiseRef.current) {
      submitPromiseRef.current.reject(error);
      submitPromiseRef.current = null;
    }
  }, []);

  const handleCancel = useCallback(() => {
    setShowModal(false);
  }, []);

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
    rejectSave,
  };
};
