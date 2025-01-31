import { Box, Button, Flex, FlexColumn } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/common/constants";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, Icon, Label } from "semantic-ui-react";
import { FormInput, FormSelect } from "./styles";

const EMPTY_TAG = {
  name: "",
  color: "yellow",
  description: "",
};

const Tags = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [tagToAdd, setTagToAdd] = useState(EMPTY_TAG);
  const { formState: { isDirty } } = useFormContext()
  const { fields: tags, append, remove } = useFieldArray({
    name: "tags"
  });

  useEffect(() => {
    if (!isDirty) {
      setTagToAdd(EMPTY_TAG)
    }
  }, [isDirty])

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
      id: "delete",
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (tag, index) => remove(index),
      tooltip: "Eliminar",
    },
  ];

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  return (
    <Box marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Etiquetas
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box >
            <Flex width="100%" padding="0 10px 10px 10px!important" alignItems="flex-start" columnGap="15px">
              <FormInput
                width={4}
                label="Nombre"
                placeholder="Nombre de la etiqueta"
                value={tagToAdd.name}
                onChange={(e) => setTagToAdd({ ...tagToAdd, name: e.target.value })}
              />
              <FormSelect
                width={3}
                label="Color"
                options={SEMANTIC_COLORS}
                value={tagToAdd.color}
                onChange={(e, { value }) => setTagToAdd({ ...tagToAdd, color: value })}
              />
              <FormInput
                width={8}
                label="Descripción"
                placeholder="Descripción"
                value={tagToAdd.description}
                onChange={(e) => setTagToAdd({ ...tagToAdd, description: e.target.value })}
              />
              <Button
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={() => {
                  append(tagToAdd);
                  setTagToAdd(EMPTY_TAG);
                }}
                height="38px"
              />
            </Flex>
            <FlexColumn rowGap="15px">
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
            </FlexColumn>
          </Box>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default Tags;
