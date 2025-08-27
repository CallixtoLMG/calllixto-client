"use client";
import { useEditSetting, useListSettings } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { Form } from "@/common/components/custom";
import { UnsavedChangesModal } from "@/common/components/modals";
import { ENTITIES, PAGES, SHORTKEYS } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SettingsTabs from "@/components/settings";
import { LIST_SETTINGS_QUERY_KEY } from "@/components/settings/settings.constants";
import { useKeyboardShortcuts, useRestoreEntity, useUnsavedChanges, useValidateToken } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const ENTITY_MAPPER = {
  PRODUCT: { name: "Productos" },
  CUSTOMER: { name: "Clientes" },
  BRAND: { name: "Marcas" },
  BUDGET: { name: "Ventas" },
  SUPPLIER: { name: "Proveedores" },
  EXPENSE: { name: "Gastos" },
  GENERAL: { name: "General" },
};

export const SUPPORTED_SETTINGS = {
  PRODUCT: ["tags", "blacklist"],
  CUSTOMER: ["tags"],
  GENERAL: ["paymentMethods"],
};

const Settings = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { data } = useListSettings();
  const editSetting = useEditSetting();
  const [isLoading, setIsLoading] = useState(false);
  const methods = useForm();
  const formRef = useRef(null);
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  const [activeEntity, setActiveEntity] = useState(null);
  const {
    showModal,
    handleDiscard,
    handleSave,
    resolveSave,
    handleCancel,
    isSaving,
    onBeforeView,
    closeModal,
  } = useUnsavedChanges({
    formRef,
    onDiscard: async () => {
      methods.reset(data[activeEntity]);
    },
    onSave: () => {
      methods.handleSubmit(mutateEdit)();
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
    setLabels([PAGES.SETTINGS.NAME]);
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
      resolveSave();
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

  const handleEntityChange = useCallback(async (entity) => {
    const canView = await onBeforeView();
    if (!canView) return;

    setActiveEntity(entity);
    setLabels([PAGES.SETTINGS.NAME, entity.label]);
    reset(entity);
  }, [onBeforeView, reset, setLabels]);

  const settings = useMemo(() => {
    if (!data?.settings) return [];

    const mappedEntities = data.settings
    .filter((entity) => SUPPORTED_SETTINGS[entity.entity]?.some((setting) => !!entity[setting]))
    .map((entity) => ({
      ...entity,
      label: ENTITY_MAPPER[entity.entity]?.name || entity.entity,
    }));

  return mappedEntities;
}, [data]);
 
  useEffect(() => {
    if (!activeEntity && settings.length) {
      handleEntityChange(settings[0]);
    }
  }, [settings, activeEntity, handleEntityChange]);

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

  return (
    <FormProvider {...methods}>
      <Form ref={formRef} onSubmit={handleSubmit(mutateEdit)}>
        <SettingsTabs
          onEntityChange={handleEntityChange}
          settings={settings}
          onRefresh={handleSettingsRefresh}
          isLoading={isLoading}
          onBeforeView={onBeforeView}
        />
        <SubmitAndRestore
          isLoading={isPending}
          onReset={() => reset(data[activeEntity])}
          isDirty={isDirty}
          text="Actualizar"
          submit
        />
        <UnsavedChangesModal
          open={showModal}
          onDiscard={handleDiscard}
          onSave={handleSave}
          isSaving={isSaving}
          onCancel={handleCancel}
        />
      </Form>
    </FormProvider>
  );
};

export default Settings;
