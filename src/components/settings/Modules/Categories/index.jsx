import { Box, Button, Flex } from "@/common/components/custom";
import { DropdownField, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/common/constants";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, Icon, Label } from "semantic-ui-react";

const EMPTY_CATEGORY = {
  name: "",
  color: "yellow",
  description: "",
};

const Categories = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [categoryToAdd, setCategoryToAdd] = useState(EMPTY_CATEGORY);
  const { formState: { isDirty } } = useFormContext();
  const [error, setError] = useState(null);
  const { fields: categories, append, remove } = useFieldArray({
    name: "categories"
  });

  useEffect(() => {
    if (!isDirty) {
      setCategoryToAdd(EMPTY_CATEGORY)
    }
  }, [isDirty])

  const headers = [
    {
      id: "name",
      title: "Categoria",
      align: "left",
      width: 5,
      value: (category) => <Label color={category.color}>{category.name}</Label>,
    },
    {
      id: "description",
      title: "Descripción",
      align: "left",
      value: (category) => <span>{category.description}</span>,
    },
  ];

  const actions = [
    {
      id: "delete",
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (category, index) => remove(index),
      tooltip: "Eliminar",
    },
  ];

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const handleAddCategory = () => {
    const isDuplicate = categories.some((category) => category.name.trim().toLowerCase() === categoryToAdd.name.trim().toLowerCase());

    if (!categoryToAdd.name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }

    if (isDuplicate) {
      setError("Ya existe una etiqueta con este nombre.");
      return;
    }

    append(categoryToAdd);
    setCategoryToAdd(EMPTY_CATEGORY);
    setError(null);
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setCategoryToAdd({ ...categoryToAdd, name });

    if (error) {
      setError(null);
    }
  };

  return (
    <Box marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Categorias
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box>
            <Flex width="100%" padding="0 10px 10px 10px!important" alignItems="flex-start" columnGap="15px">
              <TextField
                width={4}
                label="Nombre"
                placeholder="Nombre de la categoria"
                value={categoryToAdd.name}
                onChange={handleNameChange}
                error={error}
              />
              <DropdownField
                flex={1}
                label="Color"
                options={SEMANTIC_COLORS}
                value={categoryToAdd.color}
                onChange={(e, { value }) => setCategoryToAdd({ ...categoryToAdd, color: value })}
              />
              <TextField
                flex={2}
                label="Descripción"
                placeholder="Descripción"
                value={categoryToAdd.description}
                onChange={(e) => setCategoryToAdd({ ...categoryToAdd, description: e.target.value })}
              />
              <Button
                size="small"
                icon={ICONS.ADD}
                content="Agregar"
                labelPosition="left"
                color={COLORS.GREEN}
                type="button"
                onClick={handleAddCategory}
              />
            </Flex>
            <Table
              isLoading={false}
              headers={headers}
              elements={categories}
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

export default Categories;
