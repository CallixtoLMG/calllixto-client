import { Box, Button, FieldsContainer, OverflowWrapper } from "@/common/components/custom";
import { DropdownField, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { BUTTON_TEXTS, COLORS, DELETE, FIELD_LABELS, ICONS, SEMANTIC_COLORS, SIZES, TOOLTIPS } from "@/common/constants";
import { createPriorityKeyDownHandler, handleEnterKeyDown } from "@/common/utils";
import { SETTINGS_HELP_TEXTS } from "@/components/settings/settings.constants";
import { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Accordion, Label } from "semantic-ui-react";
import SettingsAccordionTitle from "../SettingsAccordionTitle";
import { AnimatedContent, AnimatedInner } from "../styles";

const EMPTY_TAG = {
  name: "",
  color: "yellow",
  description: "",
};

const Tags = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [tagToAdd, setTagToAdd] = useState(EMPTY_TAG);
  const { formState: { isDirty } } = useFormContext();
  const [errors, setErrors] = useState(null);
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
      value: (tag) => (
        <Label color={tag.color}>
          <OverflowWrapper height="13px" maxWidth="40vw" popupContent={tag.name}>
            {tag.name}
          </OverflowWrapper>
        </Label >
      )
    },
    {
      id: "description",
      title: FIELD_LABELS.DESCRIPTION,
      align: "left",
      value: (tag) => (
        <OverflowWrapper maxWidth="35vw" popupContent={tag.description}>
          {tag.description}
        </OverflowWrapper>
      ),
    },
  ];

  const actions = [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (tag, index) => remove(index),
      tooltip: TOOLTIPS.DELETE,
    },
  ];

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const handleAddTag = () => {
    const isDuplicate = tags.some((tag) => tag.name.trim().toLowerCase() === tagToAdd.name.trim().toLowerCase());
    const newErrors = {};

    if (!tagToAdd.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (tagToAdd.name.length > 50) {
      newErrors.name = "El nombre no debe superar los 50 caracteres.";
    }

    if (tagToAdd.description.length > 250) {
      newErrors.description = "La descripción no debe superar los 250 caracteres.";
    }

    if (isDuplicate) {
      newErrors.name = "Ya existe una etiqueta con este nombre.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    append(tagToAdd);
    setTagToAdd(EMPTY_TAG);
    setErrors({});
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setTagToAdd({ ...tagToAdd, name });

    if (errors) {
      setErrors(null);
    }
  };

  const handleTagKeyDown = createPriorityKeyDownHandler({
    shouldHandle: () => !!tagToAdd.name.trim(),
    callback: handleAddTag,
  });

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <SettingsAccordionTitle
          active={isAccordionOpen}
          helpText={SETTINGS_HELP_TEXTS.TAGS}
          onClick={toggleAccordion}
        >
          Etiquetas
        </SettingsAccordionTitle>
        <Accordion.Content active>
          <AnimatedContent $active={isAccordionOpen}>
            <AnimatedInner $active={isAccordionOpen}>
              <Box>
                <FieldsContainer padding="0 10px 10px 10px!important" >
                  <TextField
                    flex="1"
                    label={FIELD_LABELS.NAME}
                    placeholder="Nombre de la etiqueta"
                    value={tagToAdd.name}
                    onChange={handleNameChange}
                    onKeyDown={handleTagKeyDown}
                    error={errors?.name}
                    required
                  />
                  <DropdownField
                    selection
                    flex="1"
                    label={FIELD_LABELS.COLOR}
                    options={SEMANTIC_COLORS}
                    value={tagToAdd.color}
                    onChange={(e, { value }) => setTagToAdd({ ...tagToAdd, color: value })}
                  />
                  <TextField
                    flex="1"
                    label={FIELD_LABELS.DESCRIPTION}
                    placeholder={FIELD_LABELS.DESCRIPTION}
                    value={tagToAdd.description}
                    onChange={(e) => setTagToAdd({ ...tagToAdd, description: e.target.value })}
                    onKeyDown={(e) => handleEnterKeyDown(e, handleAddTag)}
                    error={errors?.description}
                  />
                  <Button
                    size={SIZES.SMALL}
                    icon={ICONS.ADD}
                    content={BUTTON_TEXTS.ADD}
                    labelPosition="left"
                    color={COLORS.GREEN}
                    type="button"
                    onClick={handleAddTag}
                    $marginTop="25px"
                  />
                </FieldsContainer>
                <Table
                  isLoading={false}
                  headers={headers}
                  elements={tags}
                  mainKey="name"
                  paginate={false}
                  actions={actions}
                  $tableHeight="40vh"
                  $actionButtonInside
                />
              </Box>
            </AnimatedInner>
          </AnimatedContent>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default Tags;
