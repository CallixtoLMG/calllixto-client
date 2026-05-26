"use client";
import { useEditSetting, useListSettings } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { Form } from "@/common/components/custom";
import { UnsavedChangesModal } from "@/common/components/modals";
import { ALL, BUTTON_TEXTS, ENTITIES, INFO, PAGES, SETTINGS_TAB_MAP, SETTINGS_TAB_REVERSE_MAP, SHORTKEYS } from "@/common/constants";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SettingsTabs from "@/components/settings";
import { ENTITY_MAPPER, GET_SETTING_QUERY_KEY, LIST_SETTINGS_QUERY_KEY, sortSettingsByEntityOrder, SUPPORTED_SETTINGS } from "@/components/settings/settings.constants";
import { useKeyboardShortcuts, useRestoreEntity, useUnsavedChanges } from "@/hooks";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { pick } from "lodash";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const Settings = () => {
  const { push } = useRouter();
  const { setLabels } = useBreadcrumContext();
  const { setActions, setInfo } = useNavActionsContext();
  const { data, isLoading: isLoadingSettings } = useListSettings();
  const editSetting = useEditSetting();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm();
  const formRef = useRef(null);
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const entityFromUrl = SETTINGS_TAB_MAP[tabParam];

  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  const [activeEntity, setActiveEntity] = useState(null);
  const {
    showModal: showUnsavedModal,
    handleDiscard,
    handleContinue,
    onBeforeView,
    closeModal,
  } = useUnsavedChanges({
    formRef,
    onDiscard: async () => {
      methods.reset(data[activeEntity]);
    },
  });

  const restoreSettings = useRestoreEntity({
    entity: ENTITIES.SETTINGS,
    key: LIST_SETTINGS_QUERY_KEY,
  });

  const handleSettingsRefresh = async () => {
    setIsLoading(true)
    if (typeof restoreSettings !== "function") {
      return;
    }
    try {
      await restoreSettings();
      toast.success("Configuración actualizada correctamente.");
    } catch (error) {
      console.error("Error al actualizar configuración:", error);
      toast.error("Hubo un error al actualizar la configuración.");
    }
    setIsLoading(false)
  };

  useEffect(() => {
    setActions([]);
    setInfo(INFO.HELP.SECTIONS[ENTITIES.SETTINGS]);
    setLabels([{ name: PAGES.SETTINGS.NAME }]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setActions, setLabels]);

  const { mutate: mutateEdit, isPending } = useMutation({
    mutationFn: (data) => editSetting({
      entity: `${activeEntity?.entity}S`,
      value: pick(data, SUPPORTED_SETTINGS[activeEntity?.entity]),
    }),
    onSuccess: () => {
      toast.success("Cambios guardados correctamente.");
      methods.reset(methods.getValues());
      queryClient.invalidateQueries({ queryKey: [[GET_SETTING_QUERY_KEY]], refetchType: ALL })
    },
    onError: (error) => {
      toast.error(`Error al guardar cambios: ${error.message || error}`);
    },
    onSettled: () => {
      closeModal();
    },
  });

  useEffect(() => {
    formRef.current = {
      isDirty: () => methods.formState.isDirty,
      submitForm: () => methods.handleSubmit(mutateEdit)(),
      resetForm: () => methods.reset(data[activeEntity]),
    };
  }, [methods, mutateEdit, data, activeEntity]);

  const handleEntityChange = useCallback(async (entity, options = {}) => {
    const canView = await onBeforeView();
    if (!canView) return;

    setActiveEntity(entity);
    setLabels([{ name: PAGES.SETTINGS.NAME }, { name: entity.label }]);
    reset(entity);

    if (!options.skipUrlUpdate) {
      const tabSlug = SETTINGS_TAB_REVERSE_MAP[entity.entity];
      push(`${PAGES.SETTINGS.BASE}?tab=${tabSlug}`);
    }
  }, [onBeforeView, reset, setLabels, push]);

  const settings = useMemo(() => {
    if (!data?.settings) return [];

    const mappedEntities = data.settings
      .filter((entity) => SUPPORTED_SETTINGS[entity.entity]?.some((setting) => !!entity[setting]))
      .map((entity) => ({
        ...entity,
        label: ENTITY_MAPPER[entity.entity]?.name || entity.entity,
      }));

    return sortSettingsByEntityOrder(mappedEntities);
  }, [data]);

  useEffect(() => {
    if (!settings.length) return;

    if (!tabParam) {
      setActiveTabIndex(0);
      return;
    }

    const nextIndex = settings.findIndex(
      (entity) => entity.entity === entityFromUrl
    );

    if (nextIndex >= 0) {
      setActiveTabIndex(nextIndex);
      handleEntityChange(settings[nextIndex], { skipUrlUpdate: true });
    } else {
      setActiveTabIndex(0);
      handleEntityChange(settings[0]);
    }
  }, [settings, tabParam, handleEntityChange, entityFromUrl]);

  const validateShortcuts = {
    canConfirm: () => !isPending && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(mutateEdit),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(data[activeEntity]),
      condition: validateShortcuts.canReset,
    }
  ]);

  if (!isLoadingSettings && !data) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoadingSettings}>
      <FormProvider {...methods}>
        <Form ref={formRef} onSubmit={handleSubmit(mutateEdit)}>
          <SettingsTabs
            onEntityChange={handleEntityChange}
            settings={settings}
            onRefresh={handleSettingsRefresh}
            isLoading={isLoading}
            onBeforeView={onBeforeView}
            activeIndex={activeTabIndex}
            onActiveIndexChange={setActiveTabIndex}
          />
          <SubmitAndRestore
            isLoading={isPending}
            onReset={() => reset(data[activeEntity])}
            isDirty={isDirty}
            text={BUTTON_TEXTS.UPDATE}
            submitDataTestId="settings-update-button"
            submit
          />
          <UnsavedChangesModal
            open={showUnsavedModal}
            onDiscard={handleDiscard}
            onContinue={handleContinue}
          />
        </Form>
      </FormProvider>
    </Loader>
  );
};

export default Settings;
