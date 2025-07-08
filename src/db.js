import Dexie from 'dexie';
import { LAST_UPDATED_AT } from '@/common/constants';

export const db = new Dexie('Callixto');

db.version(1).stores({
  customers: 'id, updatedAt',
  brands: 'id',
  suppliers: 'id',
  products: 'code',
  budgets: 'id',
  [LAST_UPDATED_AT]: 'id',
});

export async function bulkAddStorageItems({ entity, values }) {
  await db[entity].bulkAdd(values);
};

export function getStorageItem({ entity, id }) {
  return db[entity].get(id);
};

export function getAllStorageItems({ entity, sort, order }) {
  let query = db[entity];

  if (sort) {
    query = query.orderBy(sort);
  }

  if (order === 'descending') {
    query = query.reverse();
  }

  return query.toArray();
};

export async function updateOrCreateStorageItem({ entity, value }) {
  return db[entity].put(value);
};

export async function removeStorageItem({ entity, id }) {
  await db[entity].delete(id);
};

export async function clearStorageTable(entity) {
  await db[entity].clear();
};