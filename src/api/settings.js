import { ENTITIES, IN_MS } from "@/common/constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { GET_SETTING_QUERY_KEY, LIST_SETTINGS_QUERY_KEY } from "../components/settings/settings.constants";
import { getInstance } from "./axios";
import { listItems, useEditItem } from "./common";

export function useListSettings() {
  const query = useQuery({
    queryKey: [LIST_SETTINGS_QUERY_KEY],
    queryFn: () => listItems({
      entity: ENTITIES.SETTINGS,
      url: PATHS.SETTINGS,
    }),
    staleTime: IN_MS.ONE_DAY,
  });

  return query;
};

export function useGetSetting(entity) {
  const getSetting = async () => {
    try {
      const { data } = await getInstance().get(PATHS.SETTINGS);
      return data?.settings.find(setting => setting.entity.toLowerCase() === entity);
    } catch (error) {
      throw error;
    }
  };

  const query = useQuery({
    queryKey: [GET_SETTING_QUERY_KEY, entity],
    queryFn: getSetting,
    retry: false,
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!entity,         
    placeholderData: {},
  });

  return query;
};

export const useEditSetting = () => {
  const editItem = useEditItem();

  const editSetting = ({ entity, value }) => {
    return editItem({
      entity: ENTITIES.SETTINGS,
      url: `${PATHS.SETTINGS}/${entity}`,
      value,
      key: "entity",
      responseEntity: ENTITIES.SETTINGS,
      invalidateQueries: [
        [LIST_SETTINGS_QUERY_KEY],
        [GET_SETTING_QUERY_KEY, entity],
      ],
    });
  };

  return editSetting;
};
