"use client";
import { useEditSetting, useListSettings } from "@/api/settings";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Form } from "@/components/common/custom";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SettingsTabs from "@/components/settings";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useMutation } from "@tanstack/react-query";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

const ENTITY_MAPPER = {
  PRODUCT: {
    name: "Productos",
  },
  CUSTOMER: {
    name: "Clientes",
  },
  BRAND: {
    name: "Marcas",
  },
  BUDGET: {
    name: "Ventas",
  },
  SUPPLIER: {
    name: "Proveedores",
  },
  EXPENSE: {
    name: "Gastos",
  },
  GENERAL: {
    name: "General",
  },
};

export const SUPPORTED_SETTINGS = {
  PRODUCT: ['tags'],
  CUSTOMER: ['tags'],
  EXPENSE: ['tags', 'categories'],
}

const Settings = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { data } = useListSettings();
  const editSetting = useEditSetting();
  const [activeEntity, setActiveEntity] = useState({entity:"CUSTOMER", label: "Cliente"});
  const methods = useForm();
  const { handleSubmit, reset, formState: {isDirty}  } = methods;

  useEffect(() => {
    setActions([]);
    setLabels([PAGES.SETTINGS.NAME]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { mutate: mutateEdit, isPending } = useMutation({
    mutationFn: (data) => {
      return editSetting({
        entity: `${activeEntity.entity}S`,
        value: pick(data, SUPPORTED_SETTINGS[activeEntity.entity])
      });
    },
    onSuccess: () => {
      toast.success("Cambios guardados correctamente.");
    },
    onError: (error) => {
      toast.error(`Error al guardar cambios: ${error.message || error}`);
    },
  });

  const handleEntityChange = useCallback((entity) => {
    console.log(entity)
    setActiveEntity(entity);
    setLabels([PAGES.SETTINGS.NAME, entity.label]);
    reset(entity);
   
  }, [reset, setLabels]);

  const settings = useMemo(() => {
    if (!data?.settings) return [];
    const mappedEntities = data?.settings
      .filter(entity => SUPPORTED_SETTINGS[entity.entity]?.some(setting => !!entity[setting]))
      .map(entity => ({
        ...entity,
        label: ENTITY_MAPPER[entity.entity].name
      }));
    // handleEntityChange(activeEntity);
    return mappedEntities;
  }, [data, handleEntityChange]);

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
          onReset={() => reset(data[activeEntity])}  // Resetear a los valores iniciales
          isDirty={isDirty}
          text="Actualizar"
        />
      </Form>
    </FormProvider>
  );
};

export default Settings;
