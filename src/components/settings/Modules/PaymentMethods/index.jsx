import { Box, Button, Flex } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, DELETE, ICONS } from "@/common/constants";
import { handleEnterKeyDown } from "@/common/utils";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Accordion, Icon } from "semantic-ui-react";

const EMPTY_INPUT = "";

const PaymentMethods = () => {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  const [inputValue, setInputValue] = useState(EMPTY_INPUT);
  const [error, setError] = useState(null);
  const { setValue, watch, formState: { isDirty } } = useFormContext();
  const paymentMethods = watch("paymentMethods") || [];

  useEffect(() => {
    if (!isDirty) {
      setInputValue(EMPTY_INPUT);
      setError(null);
    }
  }, [isDirty]);

  const toggleAccordion = () => setIsAccordionOpen(!isAccordionOpen);

  const updatePaymentMethod = useCallback((newList) => {
    setValue("paymentMethods", newList, { shouldValidate: true, shouldDirty: true });
  }, [setValue]);

  const handleAddPaymentMethods = () => {
    const method = inputValue.trim();

    if (!method) return;

    if (paymentMethods.includes(method)) {
      setError(`El método [${method}] ya existe en la lista!`);
      return;
    }

    updatePaymentMethod([...paymentMethods, method]);
    setInputValue(EMPTY_INPUT);
    setError(null);
  };

  const handleRemoveMethod = useCallback((methodToRemove) => {
    const updatedPaymentMethods = (watch("paymentMethods") || []).filter(method => method !== methodToRemove);
    updatePaymentMethod(updatedPaymentMethods);
  }, [watch, updatePaymentMethod]);

  const headers = useMemo(() => [
    {
      id: "method",
      title: "Métodos de pago",
      align: "left",
      value: (method) => method,
    },
  ], []);

  const actions = useMemo(() => [
    {
      id: DELETE,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: handleRemoveMethod,
      tooltip: "Eliminar",
    },
  ], [handleRemoveMethod]);

  return (
    <Box $marginBottom="5px">
      <Accordion fluid>
        <Accordion.Title active={isAccordionOpen} onClick={toggleAccordion}>
          <Icon name="dropdown" />
          Métodos de pago
        </Accordion.Title>
        <Accordion.Content active={isAccordionOpen}>
          <Box>
            <Flex width="100%" padding="0 10px 10px 10px!important" $alignItems="flex-start" $columnGap="15px">
              <TextField
                width="50%"
                label="Método"
                placeholder="Ingresar método"
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  if (error) setError(null);
                }}
                onKeyDown={(e) => handleEnterKeyDown(e, handleAddPaymentMethods)}
                error={error}
              />
              <Button
                size="small"
                icon={ICONS.ADD}
                content="Agregar"
                labelPosition="left"
                color={COLORS.GREEN}
                type="button"
                onClick={handleAddPaymentMethods}
                $marginTop="25px"
              />
            </Flex>
            <Table
              isLoading={false}
              headers={headers}
              elements={paymentMethods}
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

export default PaymentMethods;
