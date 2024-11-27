"use client"
import { useState } from "react";
import { Button, Form, Icon, Label, Segment, Tab, Table } from "semantic-ui-react";

const SettingsPage = () => {
  const [tags, setTags] = useState([]);
  const [newTag, setNewTag] = useState({ name: "", color: "blue", comment: "" });

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

  const renderCommonSettings = () => (
    <Segment>
      <Form>
        <Form.Checkbox
          label="Habilitar notificaciones por correo"
          toggle
        />
        <Form.Checkbox
          label="Activar integración con terceros"
          toggle
        />
        <Form.Input
          label="URL del servicio externo"
          placeholder="https://api.mi-servicio.com"
        />
        <Button color="blue">Guardar Cambios</Button>
      </Form>
    </Segment>
  );

  const panes = [
    {
      menuItem: "General",
      render: () => (
        <Tab.Pane>
          <h3>Configuración General</h3>
          {renderCommonSettings()}
        </Tab.Pane>
      ),
    },
    ...["Clientes", "Proveedores", "Marcas", "Productos", "Ventas"].map((entity) => ({
      menuItem: entity,
      render: () => (
        <Tab.Pane>
          <h3>Configuración de {entity}</h3>
          {renderTagsForm()}
          {renderTagsTable()}
        </Tab.Pane>
      ),
    })),
  ];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Configuración</h2>
      <Tab size="large" panes={panes} />
    </div>
  );
};

export default SettingsPage;
