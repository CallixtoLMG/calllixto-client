import { LAST_UPDATED_AT } from '@/common/constants';
import { clearStorageTable, removeStorageItem } from '@/db';
import { useQueryClient } from '@tanstack/react-query';

const useRestoreEntity = ({ entity, key }) => {
  const queryClient = useQueryClient();

  const restoreEntity = async () => {
    await removeStorageItem({ entity: LAST_UPDATED_AT, id: entity });
    await clearStorageTable(entity);
    queryClient.invalidateQueries({ queryKey: [key] });
  };

  return restoreEntity;
}

export default useRestoreEntity;
