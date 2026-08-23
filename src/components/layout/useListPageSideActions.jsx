"use client";

import { ModalAction } from "@/common/components/modals";
import { BUTTON_TEXTS, COLORS, CONTENT_SIZES, ICONS } from "@/common/constants";
import { useRestoreEntity } from "@/hooks";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavActionsContext } from "./NavActions";

const hasSameElements = (currentElements, nextElements) =>
  currentElements.length === nextElements.length &&
  currentElements.every((element, index) => element === nextElements[index]);

const useListPageSideActions = ({
  sideActions = [],
  onRefetch,
  onDownloadExcel,
  entity,
  queryKey,
  pageName,
  updateTooltip,
  downloadTooltip,
  downloadParentId,
  showUpdateTooltipWhenExpanded = false,
}) => {
  const { setActions } = useNavActionsContext();
  const [filteredElements, setFilteredElements] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const filteredElementsRef = useRef([]);
  const onRefetchRef = useRef(onRefetch);
  const restoreEntity = useRestoreEntity({ entity, key: queryKey });
  const restoreEntityRef = useRef(restoreEntity);
  const useSideActions = Boolean(sideActions.length || onRefetch || onDownloadExcel);

  useEffect(() => {
    onRefetchRef.current = onRefetch;
  }, [onRefetch]);

  useEffect(() => {
    restoreEntityRef.current = restoreEntity;
  }, [restoreEntity]);

  useEffect(() => {
    filteredElementsRef.current = filteredElements;
  }, [filteredElements]);

  const handleFilteredElementsChange = useCallback((nextFilteredElements) => {
    setFilteredElements((currentFilteredElements) =>
      hasSameElements(currentFilteredElements, nextFilteredElements)
        ? currentFilteredElements
        : nextFilteredElements
    );
  }, []);

  const handleQuickUpdate = useCallback(() => {
    onRefetchRef.current?.();
  }, []);

  const handleDownloadFilteredElements = useCallback(() => {
    onDownloadExcel?.(filteredElementsRef.current);
  }, [onDownloadExcel]);

  const handleConfirmHardUpdate = useCallback(async () => {
    setIsUpdateLoading(true);

    if (!entity || !queryKey || typeof restoreEntityRef.current !== "function") {
      setIsUpdateLoading(false);
      return;
    }

    try {
      await restoreEntityRef.current();
    } catch (error) {
      console.error("Error en restoreEntity:", error);
    }

    setIsUpdateLoading(false);
    setShowUpdateModal(false);
  }, [entity, queryKey]);

  const railActions = useMemo(() => {
    if (!useSideActions) return [];

    let actions = [...sideActions];

    if (onRefetch) {
      actions.push({
        id: "update",
        icon: ICONS.REFRESH,
        color: COLORS.BLUE,
        text: updateTooltip || BUTTON_TEXTS.UPDATE,
        showTooltipWhenExpanded: showUpdateTooltipWhenExpanded,
        items: [
          {
            id: "quick-update",
            icon: ICONS.BOLT,
            color: COLORS.BLUE,
            text: "Actualización rápida",
            onClick: handleQuickUpdate,
          },
          {
            id: "hard-update",
            icon: ICONS.CLOUD_DOWNLOAD,
            color: COLORS.BLUE,
            text: "Actualización completa",
            onClick: () => setShowUpdateModal(true),
          },
        ],
        modal: (
          <ModalAction
            title={`¿Quieres realizar una actualización completa de ${pageName} ?  `}
            onConfirm={handleConfirmHardUpdate}
            confirmButtonText={BUTTON_TEXTS.UPDATE}
            confirmButtonIcon={ICONS.REFRESH}
            showModal={showUpdateModal}
            setShowModal={setShowUpdateModal}
            isLoading={isUpdateLoading}
            noConfirmation={true}
            bodyContent={
              <>
                <strong>¡Atención!</strong> Esta acción puede tomar varios minutos en completarse, no se recomienda ejecutarla de manera frecuente!
                Si no encuentras un elemento en las tablas, podrías probar primero usando opción de <strong>&quot;Actualización ligera&quot;</strong>.
              </>
            }
            warning
          />
        ),
      });
    }

    if (onDownloadExcel) {
      const downloadAction = {
        id: "download-excel",
        icon: ICONS.FILE_EXCEL,
        color: COLORS.BLUE,
        onClick: handleDownloadFilteredElements,
        text: downloadTooltip || "Descargar Excel",
        width: CONTENT_SIZES.FIT,
        disabled: !filteredElements.length,
        showTooltipWhenExpanded: true,
      };

      if (downloadParentId && actions.some((action) => action.id === downloadParentId)) {
        actions = actions.map((action) => {
          if (action.id !== downloadParentId) return action;

          return {
            ...action,
            items: [
              ...(action.items || action.children || []),
              downloadAction,
            ],
          };
        });
      } else {
        actions.push(downloadAction);
      }
    }

    return actions;
  }, [
    downloadParentId,
    downloadTooltip,
    filteredElements.length,
    handleConfirmHardUpdate,
    handleDownloadFilteredElements,
    handleQuickUpdate,
    isUpdateLoading,
    onDownloadExcel,
    onRefetch,
    pageName,
    showUpdateModal,
    showUpdateTooltipWhenExpanded,
    sideActions,
    updateTooltip,
    useSideActions,
  ]);

  useEffect(() => {
    if (!useSideActions) return;

    setActions(railActions);
  }, [railActions, setActions, useSideActions]);

  return {
    useSideActions,
    handleFilteredElementsChange,
  };
};

export default useListPageSideActions;
