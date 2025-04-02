import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouteHistory } from "./useRouteHistory"; // o donde lo pongas

export const useUnsavedChanges = ({ formRef, onDiscard, onSave }) => {
  const [showModal, setShowModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [nextRoute, setNextRoute] = useState(null);
  const { getLast } = useRouteHistory();
  const router = useRouter();
  const isDirtyRef = useRef(false);
  const skipDirtyCheckRef = useRef(false); // 👈 nueva bandera

  const closeModal = useCallback(() => {
    setShowModal(false);
    setNextRoute(null);
    setIsSaving(false);
  }, []);

  useEffect(() => {
    const checkDirty = () => {
      isDirtyRef.current = formRef.current?.isDirty?.() ?? false;
    };

    const interval = setInterval(checkDirty, 300);
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

  const resolveNavigation = () => {
    if (nextRoute) {
      skipDirtyCheckRef.current = true;
      router.push(nextRoute.url, nextRoute.options);
      setNextRoute(null);
      setTimeout(() => {
        skipDirtyCheckRef.current = false;
      }, 1000); // vuelve al control normal
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      if (isDirtyRef.current) {
        setNextRoute({ url: getLast(), options: {} }); // usamos historial propio
        setShowModal(true);
        router.push(window.location.pathname); // quedamos donde estamos
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    const originalPush = router.push;

    router.push = (url, options = {}) => {
      if (!skipDirtyCheckRef.current && isDirtyRef.current) {
        setNextRoute({ url, options });
        setShowModal(true);
      } else {
        originalPush(url, options);
      }
    };

    return () => {
      router.push = originalPush;
    };
  }, [router]);

  useEffect(() => {
    const handlePopState = (event) => {
      if (isDirtyRef.current) {
        // Previene navegación si hay cambios
        setNextRoute({ url: document.referrer || "/", options: {} });
        setShowModal(true);
        // Empuja de nuevo a la misma ruta para cancelar el retroceso
        router.push(window.location.pathname);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const handleDiscard = useCallback(async () => {
    if (onDiscard) {
      await onDiscard();
    }

    setTimeout(() => {
      closeModal();
      resolveNavigation();
    }, 0);
  }, [onDiscard, resolveNavigation]);

  const handleCancel = useCallback(() => {
    setShowModal(false);
    setNextRoute(null);
  }, []);

  const handleSave = useCallback(async () => {
    setIsSaving(true);
    try {
      await onSave?.();
      resolveNavigation();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
      closeModal();
    }
  }, [onSave, resolveNavigation]);

  return {
    showModal,
    isSaving,
    onBeforeView: async () => {
      const isDirty = formRef.current?.isDirty?.();
      if (isDirty) {
        setShowModal(true);
        return false;
      }
      return true;
    },
    handleDiscard,
    handleSave,
    handleCancel,
    resolveNavigation,
    closeModal,
  };
};
