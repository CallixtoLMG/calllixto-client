"use client";
import { useEditSetting, useListSettings } from "@/api/settings";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import SettingsPage from "@/components/settings";
import { PAGES } from "@/constants";
import { useValidateToken } from "@/hooks/userData";
import { useUserContext } from "@/User";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const entityLabels = {
  BRANDS: "Marcas",
  BUDGETS: "Presupuestos",
  CUSTOMERS: "Clientes",
  EXPENSES: "Gastos",
  GENERAL: "General",
  PRODUCTS: "Productos",
  SUPPLIERS: "Proveedores",
};

const pluralEntities = {
  PRODUCT: "PRODUCTS",
  CUSTOMER: "CUSTOMERS",
  BRAND: "BRANDS",
  BUDGET: "BUDGETS",
  SUPPLIER: "SUPPLIERS",
  EXPENSE: "EXPENSES",
  GENERAL: "GENERAL",
};

const hiddenEntities = ["EXPENSE"];

const filterByFields = ["tags"];

const Settings = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { data, isLoading } = useListSettings();
  const [activeEntity, setActiveEntity] = useState("");
  const [settingsData, setSettingsData] = useState({});
  const editSetting = useEditSetting();
  const { role } = useUserContext();

  const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  const { mutate: mutateEdit, isPending: isEditPending } = useMutation({
    mutationFn: async ({ entity, tags }) => {
      const response = await editSetting({
        clientId: "client-id",
        entity,
        value: { tags },
      });
      return response;
    },
    onSuccess: () => {
      toast.success("Cambios guardados correctamente.");
    },
    onError: (error) => {
      toast.error(`Error al guardar cambios: ${error.message || error}`);
    },
  });

  const visibleSettings = useMemo(() => {
    if (!data?.settings) return [];

    return data.settings
      .filter(({ entity }) => !hiddenEntities.includes(entity))
      .filter((entity) => filterByFields.some((field) => entity[field] !== undefined))
      .map(({ entity, ...rest }) => {
        const pluralEntity = pluralEntities[entity] || entity;
        return {
          entity: pluralEntity,
          label: capitalize(entityLabels[pluralEntity] || pluralEntity.toLowerCase()),
          ...rest,
        };
      });
  }, [data]);

  useEffect(() => {
    if (visibleSettings.length > 0) {
      const parsedData = visibleSettings.reduce((acc, setting) => {
        acc[setting.entity] = setting;
        return acc;
      }, {});
      setSettingsData(parsedData);

      if (!activeEntity) {
        const initialEntity = visibleSettings[0];
        setActiveEntity(initialEntity.entity);
        setLabels([PAGES.SETTINGS.NAME, initialEntity.label]);
        setActions([]);
      }
    }
  }, [visibleSettings, activeEntity, setLabels, setActions]);

  const handleEntityChange = (entityName, labelOverride) => {
    setActiveEntity(entityName);
    const label = labelOverride || entityLabels[entityName] || capitalize(entityName.toLowerCase());
    setLabels([PAGES.SETTINGS.NAME, label]);
    setActions([]);
  };

  const handleSaveChanges = ({ entity, tags }) => {
    mutateEdit({ entity, tags });
  };

  return (
    <SettingsPage
      activeEntity={activeEntity}
      settingsData={settingsData}
      isLoading={isLoading}
      isPending={isEditPending}
      onEntityChange={handleEntityChange}
      onSubmit={handleSaveChanges}
      settings={visibleSettings}
      role={role}
    />
  );
};

export default Settings;
