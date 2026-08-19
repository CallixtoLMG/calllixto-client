import { IconedButton } from "@/common/components/buttons";
import { Box, Flex, FlexColumn } from "@/common/components/custom";
import { Table } from "@/common/components/table";
import { POPUP_POSITIONS, CONTENT_SIZES, COLORS, ICONS, TOOLTIPS } from "@/common/constants";
import { useRef, useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { AddBillPopup } from "../AddBillPopup";
import { ADD_BILL_POPUP_CLASS_NAME } from "../AddBillPopup/styles";
import { BILLS_DETAILS_TABLE_HEADERS } from "../cashBalances.constants";
import { Header } from "./styles";

const addBillPopupModifiers = [
  {
    name: "preventOverflow",
    enabled: true,
    options: {
      rootBoundary: "viewport",
      padding: 16,
      altAxis: true,
      tether: false,
    },
  },
];

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
      <Flex $columnGap="15px">
        <Header margin="0">Desglose de billetes</Header>
        <Popup
          trigger={
            <Box
              width={CONTENT_SIZES.FIT}
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
          position={POPUP_POSITIONS.TOP_LEFT}
          className={ADD_BILL_POPUP_CLASS_NAME}
          popperModifiers={addBillPopupModifiers}
        >
          <AddBillPopup
            billDetailsFields={billDetailsFields}
            appendBillDetails={appendBillDetails}
            onClose={handleClosePopup}
          />
        </Popup>
      </Flex>
      <Table
        headers={BILLS_DETAILS_TABLE_HEADERS}
        actions={[
          {
            id: 1,
            icon: ICONS.TRASH,
            color: COLORS.RED,
            onClick: (billDetail, index) => removeBillDetails(index),
            tooltip: TOOLTIPS.DELETE,
          },
        ]}
        elements={billDetailsFields}
      />
    </FlexColumn>
  );
};
