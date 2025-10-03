import { IconedButton } from "@/common/components/buttons";
import { DropdownField, NumberControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { handleEnterKeyDown } from "@/common/utils";
import { ARS_BILL_DENOMINATIONS } from "@/components/cashBalances/cashBalances.constants";

export const AddBillPopup = ({
  billToAdd,
  setBillToAdd,
  billError,
  setBillError,
  billDetailsFields,
  appendBillDetails,
  setValue,
  getValues,
  onClose,
}) => {

    const handleAdd = () => {
    const d = parseInt(`${billToAdd.denomination}`, 10);
    const q = parseInt(getValues("tempQuantity") || "0", 10);
    const errors = {};

    if (isNaN(d) || d <= 0) errors.denomination = "Seleccione una denominación";

    const exists = billDetailsFields.some(
      (b) => parseInt(`${b.denomination}`, 10) === d
    );
    if (exists) errors.denomination = "Ya existe esta denominación";

    if (Object.keys(errors).length > 0) {
      setBillError(errors);
      return;
    }

    appendBillDetails({ denomination: d, quantity: q });
    setValue("tempQuantity", "");
    setBillToAdd({ denomination: "", quantity: "" });
    setBillError(undefined);
    onClose();
  };

  return (
    <>
      <DropdownField
        height="58px"
        label="Denominación"
        width="200px"
        selection
        options={ARS_BILL_DENOMINATIONS}
        value={billToAdd.denomination}
        onChange={(e, { value }) => {
          setBillToAdd({ ...billToAdd, denomination: value });
          if (!isNaN(parseInt(`${value}`, 10)) && parseInt(`${value}`, 10) > 0) {
            setBillError((prev) => ({ ...prev, denomination: undefined }));
          }
        }}
        error={
          billError?.denomination && {
            content: billError.denomination,
            pointing: "above"
          }
        }
        placeholder="Seleccionar"
      />
      <NumberControlled
        name="tempQuantity"
        label="Cantidad"
        width="200px"
        onKeyDown={(e) => handleEnterKeyDown(e, handleAdd)}

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
    </>
  );
};