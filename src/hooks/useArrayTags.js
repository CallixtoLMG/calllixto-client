import { useGetSetting } from "@/api/settings";
import { Label } from "@/common/components/custom";

const useArrayTags = (entity, externalTags = []) => {
  const { data: settings, isFetching } = useGetSetting(entity);
  const uniqueTags = {};
  const entityTags = settings?.tags ?? [];
  const combinedTags = [...entityTags, ...externalTags];

  combinedTags.forEach((tag) => {
    if (tag?.name) {
      uniqueTags[tag.name] = tag;
    }
  });

  const tagsOptions = Object.values(uniqueTags).map((tag) => ({
    key: tag.name,
    value: tag.name,
    text: tag.name,
    content: <Label color={tag.color}>{tag.name}</Label>,
  }));

  return { tagsOptions, optionsMapper: uniqueTags, isFetching };
};

export default useArrayTags;
