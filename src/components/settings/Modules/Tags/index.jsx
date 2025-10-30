import { Box, Button, Flex, OverflowWrapper } from "@/common/components/custom";
import { DropdownField, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DELETE, ICONS, SEMANTIC_COLORS, SIZES } from "@/common/constants";
import { handleEnterKeyDown } from "@/common/utils";
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
      title: "Descripción",
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
      tooltip: "Eliminar",
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

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Etiquetas
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box>
            <Flex width="100%" padding="0 10px 10px 10px!important" $alignItems="flex-start" $columnGap="15px">
              <TextField
                width={4}
                label="Nombre"
                placeholder="Nombre de la etiqueta"
                value={tagToAdd.name}
                onChange={handleNameChange}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddTag)}
                error={errors?.name}
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
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddTag)}
                error={errors?.description}
              />
              <Button
                size={SIZES.SMALL}
                icon={ICONS.ADD}
                content="Agregar"
                labelPosition="left"
                color={COLORS.GREEN}
                type="button"
                onClick={handleAddTag}
                $marginTop="25px"
              />
            </Flex>
            <Table
              isLoading={false}
              headers={headers}
              elements={tags}
              mainKey="name"
              paginate={false}
              actions={actions}
              $tableHeight="40vh"
              $deleteButtonInside
            />
          </Box>
        </Accordion.Content>
      </Accordion>
    </Box>
  );
};

export default Tags;
