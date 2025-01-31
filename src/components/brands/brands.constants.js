import { Flex, Label } from '@/components/common/custom';
import { CommentTooltip } from "@/components/common/tooltips";

export const ATTRIBUTES = { ID: "id", NAME: "name", COMMENT: "comments", STATE: "state" };

export const BRAND_COLUMNS = [
  {
    id: 1,
    title: "Id",
    width: 1,
    value: (brand) => brand.id
  },
  {
    id: 2,
    title: "Nombre",
    align: "left",
    value: (brand) =>
      <Flex justifyContent="space-between">
        {brand.name}
        {brand.comments && <CommentTooltip comment={brand.comments} />}
      </Flex>
  }
];

export const BRANDS_STATES = {
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
export const EMPTY_FILTERS = { id: '', name: '', state: BRANDS_STATES.ACTIVE.id };

export const BRANDS_STATES_OPTIONS = Object.values(BRANDS_STATES)
  .map(({ id, title, color }) => ({
    key: id,
    text: (
      <Flex alignItems="center" justifyContent="space-between">
        {title}&nbsp;<Label width="fit-content" color={color} circular empty />
      </Flex>
    ),
    value: id
  }));
