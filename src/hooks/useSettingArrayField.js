import { useGetSetting } from "@/api/settings";
import { Label } from "@/common/components/custom";

const useSettingArrayField = (entity, fieldName = "tags", externalItems = []) => {

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

  return { options, optionsMapper: uniqueItems, isFetching };
};

export default useSettingArrayField;