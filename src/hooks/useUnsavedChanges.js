import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const useUnsavedChanges = ({ formRef, onDiscard }) => {
  const [showModal, setShowModal] = useState(false);

  const router = useRouter();
  const isDirtyRef = useRef(false);
  const skipNextNavigation = useRef(false);
  const skipNextPopState = useRef(false);
  const pendingActionRef = useRef(null);

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
        pendingActionRef.current = () => originalPush(...args);
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
      if (skipNextPopState.current) {
        skipNextPopState.current = false;
        return;
      }

      if (isDirtyRef.current) {
        e.preventDefault?.();
        pendingActionRef.current = () => {
          skipNextPopState.current = true;
          history.back();
        };
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
    const pendingAction = pendingActionRef.current;
    pendingActionRef.current = null;
    closeModal();
    pendingAction?.();
    setTimeout(() => {
      skipNextNavigation.current = false;
    }, 0);
  }, [onDiscard, closeModal]);

  const handleContinue = useCallback(() => {
    pendingActionRef.current = null;
    closeModal();
  }, [closeModal]);

  const onBeforeView = useCallback((pendingAction) => {
    if (formRef.current?.isDirty?.()) {
      pendingActionRef.current = typeof pendingAction === "function" ? pendingAction : null;
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
