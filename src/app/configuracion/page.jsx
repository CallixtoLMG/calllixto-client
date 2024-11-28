"use client";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { PAGES } from "@/constants";
import { useEffect, useState } from "react";
import { Button, Form, Icon, Label, Segment, Tab, Table } from "semantic-ui-react";

const SettingsPage = () => {
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: "", color: "blue", comment: "" });
  const [activeTabIndex, setActiveTabIndex] = useState(0); // Controla el Tab activo

  // Lista de panes con nombres de entidades
  const panes = [
    { menuItem: "Clientes", entityName: "Clientes", render: renderTagsContent },
    { menuItem: "Productos", entityName: "Productos", render: renderTagsContent },
  ];

  // Actualiza las etiquetas iniciales al cargar la página
  useEffect(() => {
    const entityName = panes[activeTabIndex]?.entityName || "General";
    setLabels([PAGES.CONFIG.NAME, entityName]);
    setActions([]);
  }, [activeTabIndex, setLabels, setActions]);

  function renderTagsContent() {
    return (
      <Tab.Pane>
        {renderTagsForm()}
        {renderTagsTable()}
      </Tab.Pane>
    );
  }

  const handleAddTag = () => {
    if (newTag.name.trim()) {
      setTags([...tags, newTag]);
      setNewTag({ name: "", color: "blue", comment: "" });
    }
  };

  const handleRemoveTag = (index) => {
    setTags(tags.filter((_, i) => i !== index));
  };

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
        {tags.map((tag, index) => (
          <Table.Row key={index}>
            <Table.Cell>{tag.name}</Table.Cell>
            <Table.Cell>
              <Label color={tag.color}>{tag.color}</Label>
            </Table.Cell>
            <Table.Cell>{tag.comment}</Table.Cell>
            <Table.Cell>
              <Button
                icon
                color="red"
                onClick={() => handleRemoveTag(index)}
                size="mini"
              >
                <Icon name="trash" />
              </Button>
            </Table.Cell>
          </Table.Row>
        ))}
        {!tags.length && (
          <Table.Row>
            <Table.Cell colSpan="4" textAlign="center">
              No hay etiquetas agregadas.
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );

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
          <Form.Select
            label="Color"
            options={[
              { key: "blue", text: "Azul", value: "blue" },
              { key: "red", text: "Rojo", value: "red" },
              { key: "green", text: "Verde", value: "green" },
              { key: "yellow", text: "Amarillo", value: "yellow" },
            ]}
            value={newTag.color}
            onChange={(e, { value }) =>
              setNewTag({ ...newTag, color: value })
            }
          />
        </Form.Group>
        <Form.TextArea
          label="Comentario"
          placeholder="Comentario opcional..."
          value={newTag.comment}
          onChange={(e) =>
            setNewTag({ ...newTag, comment: e.target.value })
          }
        />
        <Button color="green" onClick={handleAddTag} disabled={!newTag.name}>
          <Icon name="add" /> Agregar Etiqueta
        </Button>
      </Form>
    </Segment>
  );

  const handleTabChange = (_, { activeIndex }) => {
    // Actualiza el Tab activo y las etiquetas
    setActiveTabIndex(activeIndex);
    const entityName = panes[activeIndex]?.entityName || "General";
    setLabels([PAGES.CONFIG.NAME, entityName]);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Tab
        size="large"
        panes={panes.map(({ menuItem, render }) => ({ menuItem, render }))}
        activeIndex={activeTabIndex}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default SettingsPage;
