"use client";

import { COLORS, CONTENT_SIZES, ICONS } from "@/common/constants";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavActionsContext } from "./NavActions";

const hasSameElements = (currentElements, nextElements) =>
  currentElements.length === nextElements.length &&
  currentElements.every((element, index) => element === nextElements[index]);

const useListPageSideActions = ({
  sideActions = [],
  onDownloadExcel,
  downloadTooltip,
  downloadParentId,
}) => {
  const { setActions } = useNavActionsContext();
  const [filteredElements, setFilteredElements] = useState([]);
  const filteredElementsRef = useRef([]);
  const useSideActions = Boolean(sideActions.length || onDownloadExcel);

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

  const handleDownloadFilteredElements = useCallback(() => {
    onDownloadExcel?.(filteredElementsRef.current);
  }, [onDownloadExcel]);

  const railActions = useMemo(() => {
    if (!useSideActions) return [];

    let actions = [...sideActions];

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
    handleDownloadFilteredElements,
    onDownloadExcel,
    sideActions,
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
