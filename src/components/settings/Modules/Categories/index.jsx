import { Box, Button, Flex, FlexColumn } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/common/constants";
import { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Accordion, Icon, Label } from "semantic-ui-react";
import { FormInput, FormSelect } from "./styles";

const Categories = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [categoryToAdd, setCategoryToAdd] = useState({ name: "", color: "", description: "" });
  const { fields: categories, append, remove } = useFieldArray({
    name: "categories"
  });

  const headers = [
    {
      id: "name",
      title: "Etiqueta",
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

  return (
    <Accordion fluid>
      <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
        <Icon name="dropdown" />
        Categorias
      </Accordion.Title>
      <Accordion.Content active={isAccordionOpen}>
        <Box>
          <Flex width="100%" padding="0 10px 10px 10px!important" alignItems="flex-start" columnGap="15px">
            <FormInput
              width={4}
              label="Nombre"
              placeholder="Nombre de la etiqueta"
              value={categoryToAdd.name}
              onChange={(e) => setCategoryToAdd({ ...categoryToAdd, name: e.target.value })}
            />
            <FormSelect
              width={3}
              label="Color"
              options={SEMANTIC_COLORS}
              value={categoryToAdd.color}
              onChange={(e, { value }) => setCategoryToAdd({ ...categoryToAdd, color: value })}
            />
            <FormInput
              width={8}
              label="Descripción"
              placeholder="Descripción"
              value={categoryToAdd.description}
              onChange={(e) => setCategoryToAdd({ ...categoryToAdd, description: e.target.value })}
            />
            <Button
              text="Agregar"
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              onClick={() => append(categoryToAdd)}
              height="38px"
            />
          </Flex>
          <FlexColumn rowGap="15px">
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
          </FlexColumn>
        </Box>
      </Accordion.Content>
    </Accordion>
  );
};

export default Categories;
