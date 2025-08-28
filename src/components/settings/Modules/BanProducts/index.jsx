import { Box, Button, Flex } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DELETE, ICONS } from "@/common/constants";
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
    const codes = inputValue
      .split(",")
      .map(code => code.trim().toUpperCase())
      .filter(Boolean);

    const uniqueCodes = [...new Set(codes)];
    const validCodes = [];
    const errorCodes = [];
    const detailedErrors = {};

    uniqueCodes.forEach(code => {
      if (code.includes(" ")) {
        errorCodes.push(code);
        detailedErrors[code] = `El código [${code}] contiene espacios en blanco, no permitidos!`;
        return;
      }
      if (code.length < 5) {
        errorCodes.push(code);
        detailedErrors[code] = `El código [${code}] debe tener más de 5 caracteres!`;
        return;
      }
      if (blacklist.includes(code)) {
        errorCodes.push(code);
        detailedErrors[code] = `El código [${code}] ya existe en la lista!`;
        return;
      }
      validCodes.push(code);
    });

    if (validCodes.length > 0) {
      updateBlacklist([...blacklist, ...validCodes]);
    }

    if (errorCodes.length > 0) {
      if (errorCodes.length === 1) {
        setError(detailedErrors[errorCodes[0]]);
      } else {
        setError("Revisa los códigos marcados con error.");
      }
      setInputValue(errorCodes.join(", "));
    } else {
      setError(null);
      setInputValue(EMPTY_INPUT);
    }
  };

  const handleRemoveCode = useCallback((codeToRemove) => {
    const updatedBlacklist = (watch("blacklist") || []).filter(code => code !== codeToRemove);
    updateBlacklist(updatedBlacklist);
  }, [watch, updateBlacklist]);

  const headers = useMemo(() => [
    {
      id: "code",
      title: "Productos Bloqueados",
      align: "left",
      value: (code) => code,
    },
  ], []);

  const actions = useMemo(() => [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: handleRemoveCode,
      tooltip: "Eliminar",
      getKey: (code, index) => `delete_${code}_${index}`, 
    },
  ], [handleRemoveCode]);

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
                label="Código(s)"
                placeholder="Ingresar código(s)"
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
                    <p>* Para añadir un código nuevo a la lista, anótelo y luego pulse &quot;enter&quot;.</p>
                    <p>* Puede agregar múltiples códigos separados por coma, por ejemplo: PCMU123,PCMU124.</p>
                  </div>
                }
              />
              <Button
                size="small"
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
