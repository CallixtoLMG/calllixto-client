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

const EMPTY_CATEGORY = {
  name: "",
  color: "yellow",
  description: "",
};

const Categories = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [categoryToAdd, setCategoryToAdd] = useState(EMPTY_CATEGORY);
  const { formState: { isDirty } } = useFormContext();
  const [errors, setErrors] = useState(null);
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
      value: (category) => (
        <Label color={category.color}>
          <OverflowWrapper maxWidth="40vw" popupContent={category.name}>
            {category.name}
          </OverflowWrapper>
        </Label >)
    },
    {
      id: "description",
      title: FIELD_LABELS.DESCRIPTION,
      align: "left",
      value: (category) => (
        <span>
          <OverflowWrapper maxWidth="40vw" popupContent={category.description}>
            {category.description}
          </OverflowWrapper>
        </span>
      ),
    },
  ];

  const actions = [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (category, index) => remove(index),
      tooltip: TOOLTIPS.DELETE,
    },
  ];

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const handleAddCategory = () => {
    const isDuplicate = categories.some((category) => category.name.trim().toLowerCase() === categoryToAdd.name.trim().toLowerCase());
    const newErrors = {};

    if (!categoryToAdd.name.trim()) {
      newErrors.name = "El nombre es obligatorio.";
    }

    if (categoryToAdd.name.length > 50) {
      newErrors.name = "El nombre no debe superar los 50 caracteres.";
    }

    if (categoryToAdd.description.length > 250) {
      newErrors.description = "La descripción no debe superar los 250 caracteres.";
    }

    if (isDuplicate) {
      newErrors.name = "Ya existe una categoria con este nombre.";
      return;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    append(categoryToAdd);
    setCategoryToAdd(EMPTY_CATEGORY);
    setErrors({});
  };

  const handleNameChange = (e) => {
    const name = e.target.value;
    setCategoryToAdd({ ...categoryToAdd, name });

    if (errors) {
      setErrors(null);
    }
  };

  const handleCategoriesKeyDown = createPriorityKeyDownHandler({
    shouldHandle: () => !!categoryToAdd.name.trim(),
    callback: handleAddCategory,
  });

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <SettingsAccordionTitle
          active={isAccordionOpen}
          helpText={SETTINGS_HELP_TEXTS.CATEGORIES}
          onClick={toggleAccordion}
          dataTestId="settings-categories-accordion"
        >
          Categorias
        </SettingsAccordionTitle>
        <Accordion.Content active>
          <AnimatedContent $active={isAccordionOpen}>
            <AnimatedInner $active={isAccordionOpen}>
              <Box>
                <FieldsContainer padding="0 10px 10px 10px!important" >
                  <TextField
                    label={FIELD_LABELS.NAME}
                    placeholder="Personal"
                    value={categoryToAdd.name}
                    onChange={handleNameChange}
                    onKeyDown={handleCategoriesKeyDown}
                    error={errors?.name}
                    required
                    flex="1"
                    dataTestId="settings-category-name-field"
                  />
                  <DropdownField
                    flex="1"
                    selection
                    label={FIELD_LABELS.COLOR}
                    options={SEMANTIC_COLORS}
                    value={categoryToAdd.color}
                    onChange={(e, { value }) => setCategoryToAdd({ ...categoryToAdd, color: value })}
                    dataTestId="settings-category-color-dropdown"
                  />
                  <TextField
                    flex="1"
                    label={FIELD_LABELS.DESCRIPTION}
                    placeholder="Mis cosas"
                    value={categoryToAdd.description}
                    onChange={(e) => setCategoryToAdd({ ...categoryToAdd, description: e.target.value })}
                    onKeyDown={(e) => handleEnterKeyDown(e, handleAddCategory)}
                    error={errors?.description}
                    dataTestId="settings-category-description-field"
                  />
                  <Button
                    size={SIZES.SMALL}
                    icon={ICONS.ADD}
                    content={BUTTON_TEXTS.ADD}
                    labelPosition="left"
                    color={COLORS.GREEN}
                    type="button"
                    onClick={handleAddCategory}
                    $marginTop="25px"
                    data-testid="settings-category-add-button"
                  />
                </FieldsContainer>
              <Table
                isLoading={false}
                headers={headers}
                elements={categories}
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
    </Box >
  );
};

export default Categories;
