"use client";
import { Loader } from "@/components/layout";
import { SEMANTIC_COLORS } from "@/constants";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { Accordion, Button, Form, Icon, Label, Segment, Tab, Table } from "semantic-ui-react";
import { FormSelect } from "./styles";

const SettingsPage = ({ activeEntity, settingsData, isLoading, onEntityChange, settings = [], onSubmit }) => {
  const [localTags, setLocalTags] = useState([]); // Maneja los tags localmente
  const [newTag, setNewTag] = useState({ name: "", color: "blue", comment: "" });
  const [openAccordions, setOpenAccordions] = useState({}); // Maneja estados de acordeones

  // Sincronizar datos locales con la entidad activa
  useEffect(() => {
    if (settingsData[activeEntity]?.tags) {
      setLocalTags(settingsData[activeEntity].tags);
    }
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
  const removeTag = (index) => {
    setLocalTags((prev) => prev.filter((_, i) => i !== index));
  };

  // Guardar cambios al backend
  const handleSaveChanges = () => {
    if (!localTags.every((tag) => tag.name && tag.color)) {
      toast.error("Algunas etiquetas son inválidas. Por favor revisa los datos.");
      return;
    }
    onSubmit({ entity: activeEntity, tags: localTags });
  };

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
            {renderTagsForm()}
            {renderTagsTable()}
            <Button
              color="blue"
              onClick={handleSaveChanges}
              disabled={isLoading}
              style={{ marginTop: "1rem" }}
            >
              Guardar cambios
            </Button>
          </Accordion.Content>
        </Accordion>
      </Tab.Pane>
    );
  };

  const renderTagsForm = () => (
    <Segment>
      <Form>
        <Form.Group widths="equal">
          <Form.Input
            label="Nombre"
            placeholder="Nombre de la etiqueta"
            value={newTag.name}
            onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
          />
          <FormSelect
            label="Color"
            options={SEMANTIC_COLORS}
            value={newTag.color}
            onChange={(e, { value }) => setNewTag({ ...newTag, color: value })}
          />
          <Form.Input
            label="Comentario"
            placeholder="Comentario opcional..."
            value={newTag.comment}
            onChange={(e) => setNewTag({ ...newTag, comment: e.target.value })}
          />
        </Form.Group>
        <Button color="green" onClick={addTag} disabled={!newTag.name}>
          Agregar etiqueta
        </Button>
      </Form>
    </Segment>
  );

  const renderTagsTable = () => (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Nombre</Table.HeaderCell>
          <Table.HeaderCell>Color</Table.HeaderCell>
          <Table.HeaderCell>Comentario</Table.HeaderCell>
          <Table.HeaderCell>Acciones</Table.HeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {localTags.map((tag, index) => (
          <Table.Row key={index}>
            <Table.Cell>{tag.name}</Table.Cell>
            <Table.Cell>
              <Label color={tag.color}>{tag.color}</Label>
            </Table.Cell>
            <Table.Cell>{tag.comment}</Table.Cell>
            <Table.Cell>
              <Button icon="trash" color="red" size="mini" onClick={() => removeTag(index)} />
            </Table.Cell>
          </Table.Row>
        ))}
        {!localTags.length && (
          <Table.Row>
            <Table.Cell colSpan="4" textAlign="center">
              No hay etiquetas agregadas.
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );

  const panes = settings.map(({ entity, label }) => ({
    menuItem: label,
    render: () => renderTabContent(entity),
  }));

  return <Tab panes={panes} onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex]?.entity)} />;
};

export default SettingsPage;
