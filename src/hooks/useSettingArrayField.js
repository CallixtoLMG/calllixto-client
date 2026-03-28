import { useGetSetting } from "@/api/settings";
import { Label } from "@/common/components/custom";

import styled from "styled-components";

const NoResultMessagge = styled.p`
  align-content: center;
  height: 28px;
  font-size: 13px;
  padding-left: 10px;
`;

const useSettingArrayField = (
  entity,
  fieldName = "tags",
  externalItems = [], {
  } = {}) => {

  const { data, isFetching } = useGetSetting(entity);
  const uniqueItems = {};
  const entityItems = data?.[fieldName] ?? [];

  const combinedItems = [...entityItems, ...externalItems];

  combinedItems.forEach((item) => {
    if (item?.name) {
      uniqueItems[item.name] = item;
    }
  });

  const options = Object.values(uniqueItems).map((item) => ({
    key: item.name,
    value: item.name,
    text: item.name,
    content: <Label color={item.color}>{item.name}</Label>,
  }));

  const optionsWithNoResultMessage = options.length
    ? options
    : [
      {
        key: "empty",
        value: "empty",
        text: "No hay opciones disponibles",
        content: <strong><NoResultMessagge>No hay opciones disponibles</NoResultMessagge></strong>,
        disabled: true,
      },
    ];

  return { options: optionsWithNoResultMessage, optionsMapper: uniqueItems, isFetching };
};

export default useSettingArrayField;