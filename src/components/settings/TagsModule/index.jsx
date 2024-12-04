import { useUserContext } from "@/User";
import { IconnedButton, SubmitAndRestore } from "@/components/common/buttons";
import { Flex, FlexColumn } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { COLORS, ICONS, SEMANTIC_COLORS } from "@/constants";
import { RULES } from "@/roles";
import { Controller } from "react-hook-form";
import { Accordion, Icon, Label, Segment } from "semantic-ui-react";
import { Form, FormInput, FormSelect } from "./styles";

const TagsModule = ({
  control,
  errors,
  localTags,
  isDirty,
  isTableModified,
  onAddTag,
  onRemoveTag,
  onReset,
  onSaveChanges,
  isPending,
  isLoading,
  isAccordionOpen,
  onToggleAccordion,
}) => {

  const { role } = useUserContext();

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

  const actions = RULES.canRemove[role] ? [
    {
      id: "delete",
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: onRemoveTag,
      tooltip: "Eliminar",
    },
  ] : [];

  return (
    <Accordion fluid>
      <Accordion.Title active={isAccordionOpen} onClick={onToggleAccordion}>
        <Icon name="dropdown" />
        Etiquetas
      </Accordion.Title>
      <Accordion.Content active={isAccordionOpen}>
        <Segment>
          <Form onSubmit={onAddTag}>
            <Flex width="100%" paddingTop="20px" alignItems="flex-start" columnGap="15px">
              <Controller
                name="name"
                control={control}
                rules={{ required: "El nombre es obligatorio" }}
                render={({ field }) => (
                  <FormInput
                    width={4}
                    label="Nombre"
                    placeholder="Nombre de la etiqueta"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    error={errors.name && { content: errors.name.message }}
                  />
                )}
              />
              <Controller
                name="color"
                control={control}
                render={({ field }) => (
                  <FormSelect
                    width={3}
                    label="Color"
                    options={SEMANTIC_COLORS}
                    value={field.value}
                    onChange={(e, { value }) => field.onChange(value)}
                  />
                )}
              />
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <FormInput
                    width={8}
                    label="Descripción"
                    placeholder="Descripción"
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
              <IconnedButton
                text="Agregar"
                icon={ICONS.ADD}
                color={COLORS.GREEN}
                onClick={onAddTag}
                disabled={!isDirty}
                height="38px"
              />
            </Flex>
          </Form>
          <FlexColumn rowGap="15px">
            <Table
              isLoading={isLoading}
              headers={headers}
              elements={localTags}
              mainKey="name"
              actions={actions}
              paginate={false}
              tableHeight="40vh"
              deleteButtonInside
            />
            <SubmitAndRestore
              isUpdating={true}
              isLoading={isPending}
              isDirty={isTableModified}
              onReset={onReset}
              onSubmit={onSaveChanges}
            />
          </FlexColumn>
        </Segment>
      </Accordion.Content>
    </Accordion>
  );
};

export default TagsModule;
