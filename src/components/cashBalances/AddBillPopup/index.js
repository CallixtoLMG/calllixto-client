import { IconedButton } from "@/common/components/buttons";
import { Flex, Form } from "@/common/components/custom";
import { DropdownField, NumberField } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { handleEnterKeyDown } from "@/common/utils";
import { ARS_BILL_DENOMINATIONS, EMPTY_BILL } from "@/components/cashBalances/cashBalances.constants";
import { useEffect, useState } from "react";

export const AddBillPopup = ({
  billDetailsFields,
  appendBillDetails,
  onClose,
}) => {
  const [billToAdd, setBillToAdd] = useState(EMPTY_BILL);
  const [billErrors, setBillErrors] = useState({});
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const checkErrors = () => {
      const errors = {};
      const denomination = Number(billToAdd.denomination);
      const quantity = Number(billToAdd.quantity);

      if (!denomination) errors.denomination = "Seleccione una denominación";
      if (!quantity) errors.quantity = "Ingrese una cantidad";
      if (billDetailsFields.some(bill => Number(bill.denomination) === denomination)) errors.denomination = "Ya existe esta denominación";

      setBillErrors(errors);
    };

    checkErrors(billToAdd);
  }, [billToAdd]);

  const handleAdd = () => {
    setIsDirty(true);
    const denomination = Number(billToAdd.denomination);
    const quantity = Number(billToAdd.quantity);

    if (!!Object.keys(billErrors).length) {
      return;
    }

    appendBillDetails({ denomination, quantity });

    setBillToAdd(EMPTY_BILL);
    setBillErrors({});
    setIsDirty(false);
    onClose();
  };

  return (
    <>
      <Flex $columnGap="14px" as={Form} flexDirection="row">
        <DropdownField
          dropdownHeight="38px"
          height="auto"
          label="Denominación"
          width="200px"
          selection
          options={ARS_BILL_DENOMINATIONS}
          value={billToAdd.denomination}
          onChange={(e, { value }) => {
            setBillToAdd({ ...billToAdd, denomination: value });
          }}
          error={
            billErrors?.denomination && isDirty && {
              content: billErrors.denomination,
              pointing: "above"
            }
          }
          placeholder="Seleccionar"
        />
        <NumberField
          label="Cantidad"
          width="200px"
          value={billToAdd.quantity}
          onChange={(value) => {
            setBillToAdd({ ...billToAdd, quantity: value });
          }}
          error={billErrors?.quantity && isDirty &&  {
            content: billErrors.quantity,
            pointing: "above"
          }}
        />
        <IconedButton
          text="Agregar"
          alignSelf="end"
          height="38px"
          icon={ICONS.CHECK}
          color={COLORS.GREEN}
          onClick={handleAdd}
          onKeyDown={(e) => handleEnterKeyDown(e, handleAdd)}
        />
      </Flex>
    </>
  );
};