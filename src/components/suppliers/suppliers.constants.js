import { Box, Flex, Label, OverflowWrapper } from "@/common/components/custom";
import { AddressesTooltip, CommentTooltip, PhonesTooltip } from "@/common/components/tooltips";
import { COLORS } from "@/common/constants";
import { getAddressesForDisplay, getPhonesForDisplay } from "@/common/utils";
import { Popup } from "semantic-ui-react";

export const GET_SUPPLIER_QUERY_KEY = 'getSupplier';
export const LIST_SUPPLIERS_QUERY_KEY = 'listSuppliers';
export const SUPPLIERS_FILTERS_KEY = 'suppliersFilters';
export const LIST_ATTRIBUTES = ["id", "name", "addresses", "phoneNumbers", "comments", "state", "inactiveReason"];

export const SUPPLIERS_COLUMNS = [
  {
    id: 1,
    title: "Id",
    key: "id",
    sortable: true,
    width: 1,
    value: (supplier) => supplier?.id,
    sortValue: (supplier) => supplier.id ?? ""
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    key: "name",
    sortable: true,
    value: (supplier) =>
      <Flex $justifyContent="space-between">
        <OverflowWrapper maxWidth="40vw" popupContent={supplier.name}>
          {supplier.name}
        </OverflowWrapper>
        {supplier.comments && <CommentTooltip tooltip="true" comment={supplier.comments} />}
      </Flex>,
    sortValue: (supplier) => supplier.name ?? ""
  },
  {
    id: 3,
    title: "Dirección",
    key: "addresses",
    sortable: true,
    width: 4,
    value: (supplier) => {
      const { primaryAddress, additionalAddresses } = getAddressesForDisplay(supplier.addresses || []);
      return (
        <Flex $justifyContent="space-between">
          {primaryAddress}
          {additionalAddresses && <AddressesTooltip addresses={additionalAddresses} />}
        </Flex>
      );
    },
    sortValue: (customer) => customer.addresses?.[0]?.address ?? ""
  },
  {
    id: 4,
    title: "Teléfono",
    width: 2,
    value: (supplier) => {
      const { primaryPhone, additionalPhones } = getPhonesForDisplay(supplier.phoneNumbers);
      return (
        <Flex $justifyContent="space-between">
          {primaryPhone}
          {additionalPhones && <PhonesTooltip phones={additionalPhones} />}
        </Flex>
      );
    }
  },
];

export const SUPPLIER_STATES = {
  ACTIVE: {
    id: 'ACTIVE',
    title: 'Activos',
    singularTitle: 'Activo',
    color: 'green',
    icon: 'check',
  },
  INACTIVE: {
    id: 'INACTIVE',
    title: 'Inactivos',
    singularTitle: 'Inactivo',
    color: 'grey',
    icon: 'hourglass half',
  },
};

export const EMPTY_SUPPLIER = { id: '', name: '', emails: [], phoneNumbers: [], addresses: [], comments: '' };
export const EMPTY_FILTERS = { id: '', name: '', state: SUPPLIER_STATES.ACTIVE.id };

export const SUPPLIER_STATES_OPTIONS = Object.values(SUPPLIER_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

export const getSupplierSearchTitle = (supplier) => (
  <OverflowWrapper $lineClamp={3} popupContent={supplier.name} maxWidth="100%">
    {supplier.name}
  </OverflowWrapper>
);

export const getSupplierSearchDescription = (supplier) => (
  <Flex $marginTop="5px" $rowGap="5px">
    <Flex
      width="100%"
      $justifyContent="space-between"
      height="20px"
      $marginTop="auto"
      $columnGap="5px"
      $alignItems="center"
    >
      <Flex $columnGap="7px">
        {supplier?.state === SUPPLIER_STATES.INACTIVE.id && (
          <Popup
            trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
            content={supplier.inactiveReason ?? 'Motivo no especificado'}
            position="top center"
            size="mini"
          />
        )}
      </Flex>
      <Box width="fit-content">
        {supplier.comments ? (
          <CommentTooltip comment={supplier.comments} />
        ) : (
          <Box visibility="hidden" />
        )}
      </Box>
    </Flex>
  </Flex>
);