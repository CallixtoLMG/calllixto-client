import { clearStorageTable } from '@/db';
import { useQueryClient } from '@tanstack/react-query';

const useRestoreEntity = ({ entity, key }) => {
  const queryClient = useQueryClient();

  const restoreEntity = async () => {
    await clearStorageTable(entity);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return restoreEntity;
}

export default useRestoreEntity;
