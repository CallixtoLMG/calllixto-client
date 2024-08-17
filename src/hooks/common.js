import { removeStorageEntity } from '@/api/common';
import { useQueryClient } from '@tanstack/react-query';

export function useRestoreEntity({ entity, key }) {
  const queryClient = useQueryClient();

  const restoreEntity = async () => {
    await removeStorageEntity(entity);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return restoreEntity;
}