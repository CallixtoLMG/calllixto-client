import { Table } from "@/components/common/table";
import { Loader } from "@/components/layout";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/constants";
import { RULES } from "@/roles";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Accordion, Form, Icon, Label, Segment, Tab } from "semantic-ui-react";
import { IconnedButton, SubmitAndRestore } from "../common/buttons";
import { Flex, FlexColumn } from "../common/custom";
import { FormInput, FormSelect } from "./styles";

const SettingsPage = ({ activeEntity, settingsData, isLoading, onEntityChange, settings = [], onSubmit, role }) => {
  const [localTags, setLocalTags] = useState([]); // Maneja los tags localmente
  const [initialTags, setInitialTags] = useState([]); // Estado inicial para restaurar
  const [newTag, setNewTag] = useState({ name: "", color: "blue", comment: "" });
  const [openAccordions, setOpenAccordions] = useState({}); // Maneja estados de acordeones

  // Sincronizar datos locales con la entidad activa
  useEffect(() => {
    if (settingsData[activeEntity]?.tags) {
      setLocalTags(settingsData[activeEntity].tags);
      setInitialTags(settingsData[activeEntity].tags); // Guarda el estado inicial
    }
    // Limpiar los inputs cuando cambia la entidad activa
    setNewTag({ name: "", color: "blue", comment: "" });
  }, [settingsData, activeEntity]);

  // Alternar acordeones
  const toggleAccordion = (key) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Añadir una etiqueta localmente
  const addTag = () => {
    if (newTag.name.trim()) {
      setLocalTags((prev) => [...prev, newTag]);
      setNewTag({ name: "", color: "blue", comment: "" });
    }
  };

  // Eliminar una etiqueta localmente
  const removeTag = (tagToRemove) => {
    setLocalTags((prev) => prev.filter((tag) => tag !== tagToRemove));
  };

  // Guardar cambios al backend
  const handleSaveChanges = () => {
    if (!localTags.every((tag) => tag.name && tag.color)) {
      toast.error("Algunas etiquetas son inválidas. Por favor revisa los datos.");
      return;
    }
    onSubmit({ entity: activeEntity, tags: localTags });
  };

  const handleReset = () => {
    setLocalTags(initialTags); // Restaurar las etiquetas locales al estado inicial
  };

  // Configurar encabezados de la tabla
  const headers = [
    {
      id: "name",
      title: "Etiqueta",
      align: "left",
      width: 5,
      value: (tag) => <Label color={tag.color}>{tag.name}</Label>, // Mostrar el nombre de la etiqueta
    },
    {
      id: "comment",
      title: "Comentario",
      align: "left",
      value: (tag) => <span>{tag.comment}</span>, // Mostrar el comentario
    },
  ];

  // Acciones para cada elemento
  const actions = RULES.canRemove[role] ? [
    {
      id: "delete",
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (tag) => removeTag(tag), // Eliminar directamente el tag correspondiente
      tooltip: "Eliminar",
    },
  ] : [];

  const renderTagsForm = () => (
    <Form>
      <Form.Group widths="equal">
        <FormInput
          width={3}
          label="Nombre"
          placeholder="Nombre de la etiqueta"
          value={newTag.name}
          onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
        />
        <FormSelect
          width={2}
          label="Color"
          options={SEMANTIC_COLORS}
          value={newTag.color}
          onChange={(e, { value }) => setNewTag({ ...newTag, color: value })}
        />
        <FormInput
          width={7}
          label="Comentario"
          placeholder="Comentario"
          value={newTag.comment}
          onChange={(e) => setNewTag({ ...newTag, comment: e.target.value })}
        />
        <Flex alignSelf="end">
          <IconnedButton
            text="Agregar"
            icon={ICONS.ADD}
            color={COLORS.GREEN}
            onClick={addTag}
            disabled={!newTag.name}
            height="38px"
          />
        </Flex>
      </Form.Group>
    </Form>
  );

  // Renderizar contenido de tabs
  const renderTabContent = (entity) => {
    if (isLoading) return <Loader active />;
    return (
      <Tab.Pane>
        <Accordion fluid>
          {/* Acordeón de Etiquetas */}
          <Accordion.Title
            active={openAccordions[`${entity}-tags`]}
            onClick={() => toggleAccordion(`${entity}-tags`)}
          >
            <Icon name="dropdown" />
            Etiquetas
          </Accordion.Title>
          <Accordion.Content active={openAccordions[`${entity}-tags`]}>
            <Segment>
              {renderTagsForm()}
              <FlexColumn rowGap="15px">
                <Table
                  isLoading={isLoading}
                  headers={headers}
                  elements={localTags} // Pasamos los tags locales como datos
                  mainKey="name" // Usar un identificador único para las filas
                  actions={actions} // Acciones para cada fila
                  paginate={false} // No paginar
                  tableHeight="40vh"
                  deleteButtonInside
                />
                <SubmitAndRestore
                  isLoading={isLoading}
                  isDirty={JSON.stringify(localTags) !== JSON.stringify(initialTags)} // Verifica si hubo cambios
                  onReset={handleReset} // Restaurar al estado inicial
                  onSubmit={handleSaveChanges} // Guardar cambios
                  text="Actualizar"
                />
              </FlexColumn>
            </Segment>
          </Accordion.Content>
        </Accordion>
      </Tab.Pane>
    );
  };

  const panes = settings.map(({ entity, label }) => ({
    menuItem: label,
    render: () => renderTabContent(entity),
  }));

  return <Tab panes={panes} onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex]?.entity)} />;
};

export default SettingsPage;
