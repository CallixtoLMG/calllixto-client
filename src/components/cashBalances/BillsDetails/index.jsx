import { IconedButton } from "@/common/components/buttons";
import { Box, FlexColumn } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { AddBillPopup } from "../AddBillPopup";
import { BILLS_DETAILS_TABLE_HEADERS } from "../cashBalances.constants";
import { Header } from "./styles";

export const BillDetails = ({ name }) => {
  const [openBillPopup, setOpenBillPopup] = useState(false);
  const billButtonRef = useRef(null);
  const { fields: billDetailsFields, append: appendBillDetails, remove: removeBillDetails } = useFieldArray({ name });

  const handleClosePopup = () => {
    setOpenBillPopup(false);
    billButtonRef.current?.focus();
  };

  return (
    <FlexColumn $rowGap="10px">
      <Header margin="0">Desglose de Billetes</Header>
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
              text="Agregar billetes"
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              iconOnly
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
          billDetailsFields={billDetailsFields}
          appendBillDetails={appendBillDetails}
          onClose={handleClosePopup}
        />
      </Popup>
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
    </FlexColumn>
  );
};
