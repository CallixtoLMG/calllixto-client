import { IconnedButton } from "@/components/common/buttons";
import { Flex, FlexColumn } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/constants";
import {  useFieldArray } from "react-hook-form";
import { Accordion, Icon, Label, Segment } from "semantic-ui-react";
import { FormInput, FormSelect } from "./styles";
import { useState } from "react";

const TagsModule = () => {
  const [tagToAdd, setTagToAdd] = useState({ name: "", color: "", description: "" });
  const { fields: tags, append, remove } = useFieldArray({
    name: "tags"
  });

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

  return (
    <Accordion fluid>
      <Accordion.Title active={true} onClick={() => {}}>
        <Icon name="dropdown" />
        Etiquetas
      </Accordion.Title>
      <Accordion.Content active={true}>
        <Segment>
          <Flex width="100%" paddingTop="20px" alignItems="flex-start" columnGap="15px">
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
            <IconnedButton
              text="Agregar"
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              onClick={() => append(tagToAdd)}
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
        </Segment>
      </Accordion.Content>
    </Accordion>
  );
};

export default TagsModule;
