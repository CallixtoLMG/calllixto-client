import { Flex, Label, OverflowWrapper } from '@/common/components/custom';
import { CommentTooltip } from "@/common/components/tooltips";

export const GET_BRAND_QUERY_KEY = 'getBrand';
export const LIST_BRANDS_QUERY_KEY = 'listBrands';
export const BRANDS_FILTERS_KEY = 'brandsFilters';

export const ATTRIBUTES = { ID: "id", NAME: "name", COMMENT: "comments", STATE: "state" };

export const BRAND_COLUMNS = [
  {
    id: 1,
    title: "Id",
    key: "id",
    sortable: true,
    width: 1,
    value: (brand) => brand.id,
    sortValue: (brand) => brand.id?.trim().toLowerCase() ?? ""

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
    sortValue: (brand) => brand.name?.trim().toLowerCase() ?? ""
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
