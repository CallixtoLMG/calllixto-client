import { useGetSetting } from "@/api/settings";
import { Label } from "@/common/components/custom";

export const useArrayTags = (entity) => {
  const { data: settings, isFetching } = useGetSetting(entity);

  const uniqueTags = {};

  const entityTags = settings?.tags ?? [];

    entityTags.forEach((tag) => {
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
