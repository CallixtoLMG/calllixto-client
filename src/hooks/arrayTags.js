import { useGetSetting } from "@/api/settings";
import { Label } from "@/common/components/custom";
import { useMemo } from "react";

export const useArrayTags = (entity, tags = []) => {
  const { data: settings, isFetching } = useGetSetting(entity);

  const [tagsOptions, optionsMapper, defaultSelectedTags] = useMemo(() => {
    const uniqueTags = {};

    const entityTags = settings?.settings?.tags ?? []; 
    const tagsArray = Array.isArray(tags) ? tags : []; 

    const defaultSelectedTags = tagsArray.map(tag => tag.name); 

    [...entityTags, ...tagsArray].forEach((tag) => {
      if (tag?.name) {
        uniqueTags[tag.name] = tag;
      }
    });

    const options = Object.values(uniqueTags).map((tag) => ({
      key: tag.name,
      value: tag.name,
      text: tag.name,
      content: <Label color={tag.color}>{tag.name}</Label>,
    }));

    return [options, uniqueTags, defaultSelectedTags];
  }, [settings, tags]);

  return { tagsOptions, optionsMapper, defaultSelectedTags, isFetching };
};