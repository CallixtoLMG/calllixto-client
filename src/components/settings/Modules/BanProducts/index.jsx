import { Box, Button, Flex } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DELETE, ICONS, SIZES } from "@/common/constants";
import { handleEnterKeyDown } from "@/common/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const EMPTY_INPUT = "";

const Blacklist = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [inputValue, setInputValue] = useState(EMPTY_INPUT);
  const [error, setError] = useState(null);
  const { setValue, watch, formState: { isDirty } } = useFormContext();
  const blacklist = watch("blacklist") || [];

  useEffect(() => {
    if (!isDirty) {
      setInputValue(EMPTY_INPUT);
      setError(null);
    }
  }, [isDirty]);

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const updateBlacklist = useCallback((newList) => {
    setValue("blacklist", newList, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleAddBlacklist = () => {
    const ids = inputValue
      .split(",")
      .map(id => id.trim().toUpperCase())
      .filter(Boolean);

    const uniqueIds = [...new Set(ids)];
    const validIds = [];
    const errorIds = [];
    const detailedErrors = {};

    uniqueIds.forEach(id => {
      if (id.includes(" ")) {
        errorIds.push(id);
        detailedErrors[id] = `El id [${id}] contiene espacios en blanco, no permitidos!`;
        return;
      }
      if (id.length < 5) {
        errorIds.push(id);
        detailedErrors[id] = `El id [${id}] debe tener más de 5 caracteres!`;
        return;
      }
      if (blacklist.includes(id)) {
        errorIds.push(id);
        detailedErrors[id] = `El id [${id}] ya existe en la lista!`;
        return;
      }
      validIds.push(id);
    });

    if (validIds.length > 0) {
      updateBlacklist([...blacklist, ...validIds]);
    }

    if (errorIds.length > 0) {
      if (errorIds.length === 1) {
        setError(detailedErrors[errorIds[0]]);
      } else {
        setError("Revisa los ids marcados con error.");
      }
      setInputValue(errorIds.join(", "));
    } else {
      setError(null);
      setInputValue(EMPTY_INPUT);
    }
  };

  const handleRemoveId = useCallback((idToRemove) => {
    const updatedBlacklist = (watch("blacklist") || []).filter(id => id !== idToRemove);
    updateBlacklist(updatedBlacklist);
  }, [watch, updateBlacklist]);

  const headers = useMemo(() => [
    {
      id: "id",
      title: "Productos Bloqueados",
      align: "left",
      value: (id) => id,
    },
  ], []);

  const actions = useMemo(() => [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: handleRemoveId,
      tooltip: "Eliminar",
      getKey: (id, index) => `delete_${id}_${index}`,
    },
  ], [handleRemoveId]);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Productos Bloqueados
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box>
            <Flex width="100%" padding="0 10px 10px 10px!important" $alignItems="flex-start" $columnGap="15px">
              <TextField
                width="50%"
                label="Id(s)"
                placeholder="A0001, A0002"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddBlacklist)}
                error={error}
                showPopup
                iconLabel
                popupPosition="top right"
                popupContent={
                  <div>
                    <p>* Para añadir un id nuevo a la lista, anótelo y luego pulse &quot;enter&quot;.</p>
                    <p>* Puede agregar múltiples ids separados por coma, por ejemplo: PCMU123,PCMU124.</p>
                  </div>
                }
              />
              <Button
                size={SIZES.SMALL}
                icon={ICONS.ADD}
                content="Agregar"
                labelPosition="left"
                color={COLORS.GREEN}
                type="button"
                onClick={handleAddBlacklist}
                $marginTop="25px"
              />
            </Flex>
            <Table
              isLoading={false}
              headers={headers}
              elements={blacklist}
              mainKey={(item) => item}
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

export default Blacklist;
