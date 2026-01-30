import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const useUnsavedChanges = ({ formRef, onDiscard }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const isDirtyRef = useRef(false);
  const skipNextNavigation = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (formRef?.current?.isDirty) {
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
    skipNextNavigation.current = true;
    closeModal();
  }, [onDiscard, closeModal]);

  const handleContinue = useCallback(() => {
    closeModal();
  }, [closeModal]);

  const onBeforeView = useCallback(() => {
    if (formRef.current?.isDirty?.()) {
      setShowModal(true);
      return false;
    }
    return true;
  }, [formRef]);

  return {
    showModal,
    handleDiscard,
    handleContinue,
    onBeforeView,
    closeModal,
  };
};

export default useUnsavedChanges;
