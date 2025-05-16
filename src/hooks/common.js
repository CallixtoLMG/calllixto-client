import { clearStorageTable } from '@/db';
import { useQueryClient } from '@tanstack/react-query';

export function useRestoreEntity({ entity, key }) {
  const queryClient = useQueryClient();

  const restoreEntity = async () => {
    await clearStorageTable(entity);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return restoreEntity;
}