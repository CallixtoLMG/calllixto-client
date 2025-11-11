import { Box, Flex, Label, OverflowWrapper } from '@/common/components/custom';
import { CommentTooltip } from "@/common/components/tooltips";
import { COLORS } from '@/common/constants';
import { Popup } from 'semantic-ui-react';

export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';
export const BRANDS_FILTERS_KEY = 'brandsFilters';
export const LIST_ATTRIBUTES = ['id', 'name', 'comments', 'state', 'deactivationReason'];

export const BRAND_COLUMNS = [
  {
    id: 1,
    title: "Id",
    key: "id",
    sortable: true,
    width: 1,
    value: (brand) => brand.id,
    sortValue: (brand) => brand.id ?? ""
  },
  {
    id: 2,
    title: "Nombre",
    key: "name",
    sortable: true,
    align: "left",
    value: (brand) =>
      <Flex $justifyContent="space-between">
        <OverflowWrapper maxWidth="70vw" popupContent={brand.name}>
          {brand.name}
        </OverflowWrapper>
        {brand.comments && <CommentTooltip comment={brand.comments} />}
      </Flex>,
    sortValue: (brand) => brand.name ?? ""
  }
];

export const BRAND_STATES = {
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

export const EMPTY_BRAND = { name: '', id: '', comments: '' };
export const EMPTY_FILTERS = { id: '', name: '', state: BRAND_STATES.ACTIVE.id };

export const BRAND_STATES_OPTIONS = Object.values(BRAND_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex $alignItems="center" $justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));

export const getBrandSearchTitle = (brand) => (
  <OverflowWrapper $lineClamp={3} popupContent={brand.name} maxWidth="100%">
    {brand.name}
  </OverflowWrapper>
);

export const getBrandSearchDescription = (brand) => (
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
        {brand?.state === BRAND_STATES.INACTIVE.id && (
          <Popup
            trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
            content={brand.inactiveReason ?? 'Motivo no especificado'}
            position="top center"
            size="mini"
          />
        )}
      </Flex>
      <Box width="fit-content">
        {brand.comments ? (
          <CommentTooltip comment={brand.comments} />
        ) : (
          <Box visibility="hidden" />
        )}
      </Box>
    </Flex>
  </Flex>
);