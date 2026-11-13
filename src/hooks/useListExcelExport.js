import { useIsMutating, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo } from "react";
import { toast } from "react-hot-toast";

export default function useListExcelExport({ entity, id, exportFile, errorMessage }) {
  const queryClient = useQueryClient();
  const mutationFilter = useMemo(() => ({
    mutationKey: ["listExcelExport", entity, id],
    exact: true,
  }), [entity, id]);
  const isExporting = useIsMutating(mutationFilter) > 0;
  const { mutate } = useMutation({
    mutationKey: mutationFilter.mutationKey,
    mutationFn: exportFile,
    onError: (error) => toast.error(error.message || errorMessage),
  });

  const startExport = useCallback((request) => {
    if (!queryClient.isMutating(mutationFilter)) mutate(request);
  }, [queryClient, mutationFilter, mutate]);

  return { isExporting, startExport };
}
