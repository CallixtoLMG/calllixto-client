# Hydration de preferencias de tabla

Branch `590-test-staging`. Corrección del 15 de octubre de 2026. Cambios anteriores del workspace conservados.

## A. Causa raíz

`src/hooks/useFilterParams.js`, antiguo inicializador de `useState` (líneas 15–18 antes de esta corrección), evaluaba `getStoredFilters(key)` durante render. Esa función lee localStorage (línea 7) y sessionStorage (línea 8), con preferencia de sesión sobre local cuando existe registro local.

Cadena exacta para Productos:

1. `EMPTY_FILTERS` de productos no fija tamaño; `DEFAULT_PAGE_SIZE=20` está en `src/common/constants/index.js:329`.
2. Servidor: no existe window; helper devolvía `{}`. `getListPageState` (`src/api/listPagination.js:31`) asignaba 20.
3. Primer render cliente: el mismo inicializador leía `localStorage.productsFilters`; con `pageSize:100` devolvía 100 antes de hidratar. Es preferencia guardada por `onParamsChange`, invocado por el cambio del dropdown; no es un segundo default. SessionStorage puede sobrescribir un registro local según comportamiento existente.
4. `useFilters.listRequest` → página Productos → `ProductsPage` → `CustomTable` (`Table.jsx:58`) → `Pagination` → `PageSizeDropdown value={pageSize}` (`Pagination.jsx:166`) → Semantic UI `DropdownText`: servidor 20, cliente 100.

El `hydrated` anterior de useFilters sólo retrasaba requests: no impedía que props visuales ya incluyeran datos de storage durante primer render. Por eso no evitaba mismatch.

## B. Corrección

`useFilterParams.js:18` inicializa exclusivamente defaults, tanto en SSR como en cliente. `useEffect` de líneas 22–25 lee storage después del mount y publica **filtros restaurados y hydrated=true en una única actualización de estado**.

Resultado: SSR=20, primer render cliente=20, luego actualización React=100. SSR permanece habilitado, sin `suppressHydrationWarning`, `dynamic` ni ocultamiento del dropdown.

`useFilters` reutiliza señal hydrated del hook de persistencia; inicializa formulario sólo cuando preferencias están restauradas. Así filtros aplicados y controles recuperan valores guardados juntos, sin perder texto persistido ni modificar aplicación manual de drafts.

`CustomTable` conserva sorting local cuando props restauradas llegan después del mount: agregado efecto específico para modo local (`Table.jsx:141`). Página y tamaño locales ya tenían sincronización por efecto. Modo remoto continúa leyendo props directamente.

## C. Persistencia

Mismas claves y formato JSON; localStorage guarda preferencias, sessionStorage mantiene precedencia existente. Lectura movida de render a efecto. No se escriben defaults durante restauración; cambiar tamaño/sort/página después continúa persistiendo normalmente.

## D. Requests

Los nueve listados principales ya usan `enabled: filterControls.hydrated`. Ahora esa señal permanece falsa hasta tener preferencias completas; primera query usa tamaño/página/sort restaurados. **No se agrega request descartable con 20** cuando hay 100 guardado.

Smoke comprueba, tanto en entrada directa como en reload:

| Preferencia | UI final | Primera y única GET por carga |
| --- | --- | --- |
| pageSize=100 | 100 | pageNumber=1, pageSize=100, count=true |
| Sin preferencia | 20 | pageNumber=1, pageSize=20, count=true |
| pageSize=100, page=2, sorting name/ascending, name=Guardado | 100 | pageNumber=2, pageSize=100, sort=name, order=true, name=Guardado, count=true |

Edición de draft posterior no dispara request. Paginación/count, Buscar/Enter/reset, filtros draft/applied y sort/order conservados. Sin cambios de catálogo/useProductCatalog ni lectura Dexie en listados; smoke verifica cero operaciones IndexedDB.

## E. Estados equivalentes auditados

`page` y `sorting` se restauraban por el mismo inicializador prematuro: podían diferir página activa y estado visual de ordenamiento entre servidor y cliente. Ahora ambos usan defaults inicialmente y se restauran después. Validado caso persistido página 2, sorting name ASC junto con tamaño 100.

No se atribuyen otros errores de consola sin evidencia ni se amplió auditoría. Controles draft ya partían de defaultValues; sólo se ajustó momento de su reset para recuperar persistencia después del mount. No se agregó persistencia de drafts sin aplicar.

## F. Validación

```powershell
node --test tests/unit/filter-persistence-hydration.test.js tests/unit/list-remote-filters.test.js
```

33/33 pasan. Cinco nuevos tests cubren HTML inicial con React SSR real sin lectura de storage, restauración atómica de tamaño/página/sort, ausencia de preferencias, precedencia de sesión/escritura posterior y draft/applied tras restaurar. Resto verifica filtros manuales, count, paginación, errores y separación de catálogos.

```powershell
npx next lint --file src/hooks/useFilterParams.js --file src/hooks/useFilters.js --file src/common/components/table/Table.jsx
node --check tests/smoke/filter-hydration.cjs
node tests/smoke/filter-hydration.cjs
git diff --check
```

Lint sin warnings/errors; sintaxis y whitespace limpios. Smoke usa Next aislado en 3107, `NEXT_PUBLIC_URL=http://127.0.0.1:3108/`, APIs interceptadas con respuestas simuladas y orígenes externos bloqueados. Servidor nunca consulta backend real. Preload temporal de Next sólo separa distDir `.next/pagination-smoke` del dev habitual.

7 comprobaciones browser pasan: HTML SSR con JavaScript deshabilitado muestra 20; tres casos de tabla anterior, cada uno con entrada directa y reload. **0 warnings/errors de hydration y 0 pageerrors**; una GET por carga. Límite explícito 10 requests y watchdog 30 segundos por escenario, sin sleeps largos. No suite E2E completa.

Captura: `C:/Users/Usuario/AppData/Local/Temp/callixto-hydration-smoke.json`. Browser y servidor aislado cerrados; cambio automático de Next a tsconfig retirado.

Archivos de esta corrección: `src/hooks/useFilterParams.js`, `src/hooks/useFilters.js`, `src/common/components/table/Table.jsx`, ajuste del mock en `tests/unit/list-remote-filters.test.js`, nuevos `tests/unit/filter-persistence-hydration.test.js`, `tests/smoke/filter-hydration.cjs` y este informe.

## G. Git diff

`git diff --stat`: 45 archivos tracked, 617 inserciones, 445 eliminaciones. Incluye cambios locales anteriores; archivos untracked no entran en este stat. Salida completa abajo.

## H. Estado Git

Sin git add, commit ni push. Índice vacío (`git diff --cached --name-only` sin salida). Backend sin cambios. `useProductCatalog` sin modificaciones en esta corrección.

```text
 src/api/brands.js                                  | 31 ++++++---
 src/api/budgets.js                                 | 67 ++++++++-----------
 src/api/cashBalances.js                            | 24 +++----
 src/api/common.js                                  | 61 ++++++-----------
 src/api/customers.js                               | 31 ++++++---
 src/api/expenses.js                                | 22 +++----
 src/api/products.js                                | 52 ++++++++++-----
 src/api/settings.js                                |  5 +-
 src/api/stock.js                                   | 11 +++-
 src/api/suppliers.js                               | 33 +++++++---
 src/api/users.js                                   | 24 +++----
 src/app/(private)/cajas/page.jsx                   | 14 +++-
 src/app/(private)/clientes/page.jsx                | 22 +++++--
 src/app/(private)/gastos/page.jsx                  | 14 +++-
 src/app/(private)/historial-ventas/page.jsx        | 26 ++++++--
 src/app/(private)/marcas/[id]/page.client.jsx      | 14 +++-
 src/app/(private)/marcas/page.jsx                  | 14 +++-
 src/app/(private)/productos/crear/page.jsx         |  8 +--
 src/app/(private)/productos/page.jsx               | 16 +++--
 src/app/(private)/proveedores/page.jsx             | 14 +++-
 src/app/(private)/usuarios/page.jsx                | 14 +++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    | 18 +++--
 src/app/(private)/ventas/crear/page.jsx            | 18 +++--
 src/app/(private)/ventas/page.jsx                  | 18 +++--
 src/common/components/table/Filters.jsx            | 10 +--
 src/common/components/table/Pagination.jsx         | 24 +++++--
 src/common/components/table/Table.jsx              | 58 +++++++++++++----
 src/components/brands/BrandsPage/index.jsx         | 14 ++--
 src/components/budgets/BudgetDeliveries/index.jsx  | 12 +++-
 src/components/budgets/BudgetsPage/index.jsx       | 72 ++++++--------------
 .../cashBalances/CashBalancesPage/index.jsx        | 15 ++---
 src/components/customers/CustomersPage/index.jsx   | 16 ++---
 src/components/expenses/ExpensesPage/index.jsx     | 20 ++----
 src/components/layout/useListPageSideActions.jsx   | 13 ++--
 .../products/BatchImportProducts/index.jsx         |  6 +-
 src/components/products/ProductsPage/index.jsx     | 19 ++----
 src/components/settings/Entities/Budgets/index.jsx |  4 +-
 src/components/suppliers/SuppliersPage/index.jsx   | 14 ++--
 src/components/users/UserPage/index.jsx            | 14 ++--
 src/components/users/users.constants.js            |  2 +-
 src/hooks/useFilterParams.js                       | 25 ++++---
 src/hooks/useFilters.js                            | 76 +++++++++++++++++-----
 .../budget-deliveries-consume-response.test.js     |  2 +-
 .../budgets-history-hard-deleted-filter.test.js    | 19 +-----
 tests/unit/stock-batching.test.js                  | 56 +++++++++-------
 45 files changed, 617 insertions(+), 445 deletions(-)
```
