import { IconedButton } from "@/common/components/buttons";
import { Box, FieldsContainer, Flex, FlexColumn } from "@/common/components/custom";
import { PriceLabel } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { useMemo } from "react";
import { Popup } from "semantic-ui-react";
import { AddBillPopup } from "../AddBillPopup";
import { BILLS_DETAILS_TABLE_HEADERS, EMPTY_BILL } from "../cashBalances.constants";
import { Header } from "./styles";

export const BillDetails = ({
  billDetailsFields,
  appendBillDetails,
  removeBillDetails,
  billToAdd,
  setBillToAdd,
  billError,
  setBillError,
  billButtonRef,
  openBillPopup,
  setOpenBillPopup,
  getValues,
  setValue,
  trigger,
  updateInitialAmountButton,
  close
}) => {
  const billsTotal = useMemo(() => {
    return billDetailsFields.reduce(
      (sum, b) => sum + (Number(b.denomination) * Number(b.quantity)),
      0
    );
  }, [billDetailsFields]);

  const handleClosePopup = () => {
    setBillToAdd(EMPTY_BILL);
    setOpenBillPopup(false);
    setBillError(undefined);
    setValue("tempQuantity", "");
    billButtonRef.current?.focus();
  };

  return (
    <FieldsContainer>
      <FlexColumn $rowGap="10px">
        <Header margin="0">Desglose de Billetes {close && "(Cierre)"}</Header>
        <Flex $columnGap="10px">
          <Popup
            trigger={
              <Box
                width="fit-content"
                tabIndex={0}
                role="button"
                ref={billButtonRef}
                onClick={() => setOpenBillPopup(true)}
              >
                <IconedButton
                  text="Agregar billete"
                  icon={ICONS.ADD}
                  color={COLORS.GREEN}
                />
              </Box>
            }
            open={openBillPopup}
            on="click"
            onClose={handleClosePopup}
            closeOnDocumentClick
            position="top left"
          >
            <AddBillPopup
              billToAdd={billToAdd}
              setBillToAdd={setBillToAdd}
              billError={billError}
              setBillError={setBillError}
              billDetailsFields={billDetailsFields}
              appendBillDetails={appendBillDetails}
              setValue={setValue}
              getValues={getValues}
              onClose={handleClosePopup}
              buttonRef={billButtonRef}
              trigger={trigger}
            />
          </Popup>
          {billsTotal > 0 && updateInitialAmountButton && (
            <IconedButton
              text="Actualizar monto inicial"
              icon={ICONS.CHECK}
              color={COLORS.BLUE}
              onClick={() => setValue("initialAmount", billsTotal)}
            />
          )}
        </Flex>
        <Flex width="40vw" $columnGap="60px">
          <Table
            headers={BILLS_DETAILS_TABLE_HEADERS}
            actions={[
              {
                id: 1,
                icon: ICONS.TRASH,
                color: COLORS.RED,
                onClick: (billDetail, index) => removeBillDetails(index),
                tooltip: "Eliminar",
              },
            ]}
            elements={billDetailsFields}
          />
          <Flex $alignItems="center" $alignSelf="end" $marginBottom="0.7rem">
            Total <PriceLabel margin="0" value={billsTotal} />
          </Flex>
        </Flex>
      </FlexColumn>
    </FieldsContainer>
  );
};
