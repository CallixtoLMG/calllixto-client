import { Box, Button, Flex } from "@/common/components/custom";
import { DropdownField, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DELETE, ICONS, SEMANTIC_COLORS } from "@/common/constants";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, Icon, Label } from "semantic-ui-react";

const EMPTY_TAG = {
  name: "",
  color: "yellow",
  description: "",
};

const Tags = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [tagToAdd, setTagToAdd] = useState(EMPTY_TAG);
  const { formState: { isDirty } } = useFormContext();
  const [error, setError] = useState(null);
  const { fields: tags, append, remove } = useFieldArray({
    name: "tags"
  });

  useEffect(() => {
    if (!isDirty) {
      setTagToAdd(EMPTY_TAG);
    }
  }, [isDirty]);

  const headers = [
    {
      id: "name",
      title: "Etiqueta",
      align: "left",
      width: 5,
      value: (tag) => <Label color={tag.color}>{tag.name}</Label>,
    },
    {
      id: "description",
      title: "Descripción",
      align: "left",
      value: (tag) => <span>{tag.description}</span>,
    },
  ];

  const actions = [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (tag, index) => remove(index),
      tooltip: "Eliminar",
    },
  ];

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const handleAddTag = () => {
    const isDuplicate = tags.some((tag) => tag.name.trim().toLowerCase() === tagToAdd.name.trim().toLowerCase());

    if (!tagToAdd.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (isDuplicate) {
      setError("Ya existe una etiqueta con este nombre.");
      return;
    }

    append(tagToAdd);
    setTagToAdd(EMPTY_TAG);
    setError(null);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setTagToAdd({ ...tagToAdd, name });

    if (error) {
      setError(null);
    }
  };

  return (
    <Box marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Etiquetas
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box>
            <Flex width="100%" padding="0 10px 10px 10px!important" alignItems="flex-start" columnGap="15px">
              <TextField
                width={4}
                label="Nombre"
                placeholder="Nombre de la etiqueta"
                value={tagToAdd.name}
                onChange={handleNameChange}
                error={error}
              />
              <DropdownField
                flex={1}
                label="Color"
                options={SEMANTIC_COLORS}
                value={tagToAdd.color}
                onChange={(e, { value }) => setTagToAdd({ ...tagToAdd, color: value })}
              />
              <TextField
                flex={2}
                label="Descripción"
                placeholder="Descripción"
                value={tagToAdd.description}
                onChange={(e) => setTagToAdd({ ...tagToAdd, description: e.target.value })}
              />
              <Button
                size="small"
                icon={ICONS.ADD}
                content="Agregar"
                labelPosition="left"
                color={COLORS.GREEN}
                type="button"
                onClick={handleAddTag}
              />
            </Flex>
            <Table
              isLoading={false}
              headers={headers}
              elements={tags}
              mainKey="name"
              paginate={false}
              actions={actions}
              tableHeight="40vh"
              deleteButtonInside
            />
          </Box>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default Tags;
