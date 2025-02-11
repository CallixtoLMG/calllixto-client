"use client";
import { useEditSetting, useListSettings } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { Form } from "@/common/components/custom";
import { PAGES } from "@/common/constants";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SettingsTabs from "@/components/settings";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  PRODUCT: ["tags"],
  CUSTOMER: ["tags"],
  EXPENSE: ["tags", "categories"],
};

const Settings = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { data } = useListSettings();
  const editSetting = useEditSetting();

  const methods = useForm();
  const { handleSubmit, reset, formState: { isDirty } } = methods;
  const [activeEntity, setActiveEntity] = useState(null);

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
    },
    onError: (error) => {
      toast.error(`Error al guardar cambios: ${error.message || error}`);
    },
  });

  const handleEntityChange = useCallback((entity) => {
    setActiveEntity(entity);
    setLabels([PAGES.SETTINGS.NAME, entity.label]);
    reset(entity);
  }, [reset, setLabels]);

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

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(mutateEdit)}>
        <SettingsTabs
          activeEntity={activeEntity}
          onEntityChange={handleEntityChange}
          settings={settings}
          isDirty={isDirty}
        />
        <SubmitAndRestore
          isLoading={isPending}
          onReset={() => reset(data[activeEntity])}
          isDirty={isDirty}
          text="Actualizar"
        />
      </Form>
    </FormProvider>
  );
};

export default Settings;
