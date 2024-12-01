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

// Mapeo para traducir nombres de entidades al español
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

// Lista de entidades a ocultar
const hiddenEntities = ["EXPENSE"]; // Ocultar "Gastos", por ejemplo.

// Campos por los cuales filtrar entidades visibles
const filterByFields = ["tags"]; // Mostrar entidades que tienen estos campos

const Settings = () => {
  useValidateToken();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { data, isLoading } = useListSettings();
  const [activeEntity, setActiveEntity] = useState(""); // Sin entidad activa por defecto
  const [settingsData, setSettingsData] = useState({}); // Aquí se almacenan los datos de configuración.
  const editSetting = useEditSetting();
  const { role } = useUserContext();

  // Función para capitalizar la primera letra
  const capitalize = (string) => string.charAt(0).toUpperCase() + string.slice(1);

  // Mutación para guardar cambios
  const { mutate: mutateEdit, isLoading: isEditPending } = useMutation({
    mutationFn: async ({ entity, tags }) => {
      const response = await editSetting({
        clientId: "client-id", // Cambiar por ID válido
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

  // Filtrar y preparar las entidades visibles
  const visibleSettings = useMemo(() => {
    if (!data?.settings) return [];

    return data.settings
      .filter(({ entity }) => !hiddenEntities.includes(entity)) // Ocultar entidades especificadas
      .filter((entity) => filterByFields.some((field) => entity[field] !== undefined)) // Filtrar por campos internos
      .map(({ entity, ...rest }) => {
        const pluralEntity = pluralEntities[entity] || entity; // Normalizar a plural si está en el mapeo
        return {
          entity: pluralEntity, // Usar el nombre plural
          label: capitalize(entityLabels[pluralEntity] || pluralEntity.toLowerCase()), // Traducir y capitalizar
          ...rest,
        };
      });
  }, [data]);

  // Actualizar settingsData cuando los datos del backend cambian
  useEffect(() => {
    if (visibleSettings.length > 0) {
      const parsedData = visibleSettings.reduce((acc, setting) => {
        acc[setting.entity] = setting; // Organizar por entidad
        return acc;
      }, {});
      setSettingsData(parsedData);
    }
  }, [visibleSettings]);

  // Establecer labels iniciales y la entidad activa
  useEffect(() => {
    if (visibleSettings.length > 0) {
      const initialEntity = visibleSettings[0]; // Primera entidad visible
      setActiveEntity(initialEntity.entity); // Establece la entidad activa como su clave interna
      setLabels([PAGES.SETTINGS.NAME, initialEntity.label]); // Actualizamos los labels
      setActions([]); // Reseteamos acciones
    }
  }, [visibleSettings, setLabels, setActions]);

  // Manejar cambios en la entidad activa
  const handleEntityChange = (entityName) => {
    setActiveEntity(entityName);
    const label = entityLabels[entityName] || capitalize(entityName.toLowerCase());
    setLabels([PAGES.SETTINGS.NAME, label]);
    setActions([]); // Puedes personalizar las acciones aquí si es necesario
  };

  // Función para guardar cambios desde SettingsPage
  const handleSaveChanges = ({ entity, tags }) => {
    mutateEdit({ entity, tags });
  };

  return (
    <SettingsPage
      activeEntity={activeEntity}
      settingsData={settingsData}
      isLoading={isLoading || isEditPending} // Mostrar loading si está editando
      onEntityChange={handleEntityChange}
      onSubmit={handleSaveChanges}
      settings={visibleSettings}
      role={role}
    />
  );
};

export default Settings;
