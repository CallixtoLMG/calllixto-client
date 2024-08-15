import { removeEntity } from '@/api/common';
import { useQueryClient } from '@tanstack/react-query';

export function useRestoreEntity({ entity, key }) {
  const queryClient = useQueryClient();

  const restoreEntity = async () => {
    await removeEntity(entity);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return restoreEntity;
}