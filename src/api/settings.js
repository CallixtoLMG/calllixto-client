import { ENTITIES, IN_MS } from "@/common/constants";
import { PATHS } from "@/fetchUrls";
import { useQuery } from "@tanstack/react-query";
import { GET_SETTING_QUERY_KEY, LIST_SETTINGS_QUERY_KEY } from "../components/settings/settings.constants";
import { getItemById, listItems, useEditItem } from "./common";

export function useListSettings() {
  const query = useQuery({
    queryKey: [LIST_SETTINGS_QUERY_KEY],
    queryFn: () =>
      listItems({
        entity: ENTITIES.SETTINGS,
        url: PATHS.SETTINGS,
      }),
    staleTime: IN_MS.ONE_DAY,
  });
  return query;
};

export function useGetSetting(entity) {
  const query = useQuery({
    queryKey: [GET_SETTING_QUERY_KEY, entity],
    queryFn: () =>
      getItemById({
        url: `${PATHS.SETTINGS}/${entity}`,
        entity: ENTITIES.SETTINGS,
      }),
    staleTime: IN_MS.ONE_HOUR,
    enabled: !!entity,
  });

  return query;
};

export const useEditSetting = () => {
  const editItem = useEditItem();

  const editSetting = async ({ entity, value }) => {
    const response = await editItem({
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

    return response;
  };

  return editSetting;
};
