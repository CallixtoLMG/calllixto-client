# Aplicación manual de filtros — 13 octubre 2026

Branch `590-test-staging`. Este ajuste cambia cuándo se aplican filtros; conserva paginación, política count, sort/order y catálogos legacy.

## Punto central

`src/hooks/useFilters.js` separa dos estados:

- `draftFilters`: valores del formulario React Hook Form, observados con `useWatch`. Controles sólo actualizan estos valores.
- `appliedFilters`: estado existente de `useFilterParams`, también expuesto como `filters` para consumidores actuales. `queryParams` y `listRequest` dependen únicamente de este estado y su página/tamaño/sort.

La hidratación carga filtros persistidos al formulario una sola vez. Navegar, cambiar tamaño o sort no sobrescribe un draft pendiente. Submit copia sólo campos funcionales del formulario; mantiene tamaño/sort vigentes del estado aplicado y vuelve a página 1.

Se retiró watcher que aplicaba filtros automáticamente y debounce remoto de 400 ms, incluida constante `FILTER_TEXT_DEBOUNCE_MS`. Debounce local de 300 ms del autocompletado permanece para buscar sugerencias; no aplica filtros ni consulta listados.

## Buscar, Enter y reset

| Acción | Comportamiento |
|---|---|
| Escribir/seleccionar/borrar | Sólo draft; cero requests |
| Buscar | Aplica draft completo, página 1, count=true, una request |
| Enter textual | Mismo submit de Form que Buscar; una request |
| Reset | Limpia draft/applied, página 1, count=true, request inmediata |
| Página 2 | Usa filtros aplicados, count=false con total conocido |
| Editar draft en página 2 | Mantiene resultados/applied; cero requests |
| Tamaño/sort con draft pendiente | Inmediatos, usando filtros aplicados; no copian draft |

Enter se centraliza en `handleFilterEnter`, conectado al contenedor compartido `Filters`. Cancela submit nativo duplicado y llama `form.requestSubmit()` una vez, incluyendo input de vendedor. No aplica durante composición IME ni repite submit por tecla sostenida.

Reset limpia filtros funcionales, incluidos estados iniciales ACTIVE/OPEN; no vuelve a imponer esos defaults. Selects quedan vacíos o en Todos donde default ya era ese sentinel. Mantiene tamaño/sort y contexto de fechas existente de ventas/historial. Badge cuenta filtros realmente enviados y queda en cero después de reset.

`filterApplication` es señal interna de aplicación explícita. `usePagedList` usa esa señal para invalidar conteo conocido antes del GET. Si cambia queryKey, React Query consulta normalmente; si Buscar/reset repite misma página/filtros, ejecuta un solo refetch. La señal no viaja a backend y no forma parte de queryKey: no genera caches duplicadas. `count` también sigue fuera de queryKey.

Response normalizada mantiene referencia estable mientras sólo cambia draft, evitando cambios artificiales de datos de tabla. No se rediseñó `listCounts`, no se añadió Dexie ni se modificó `useProductCatalog`.

## Componentes afectados

Ocho componentes cubren nueve listados:

```text
src/components/budgets/BudgetsPage/index.jsx — ventas e historial
src/components/products/ProductsPage/index.jsx
src/components/customers/CustomersPage/index.jsx
src/components/suppliers/SuppliersPage/index.jsx
src/components/users/UserPage/index.jsx
src/components/expenses/ExpensesPage/index.jsx
src/components/cashBalances/CashBalancesPage/index.jsx
src/components/brands/BrandsPage/index.jsx
```

Se retiraron submits de `afterChange` de selects. Productos limpia selección al submit, no al editar draft. Clientes ya no remonta formulario al cambiar estado aplicado/página. Estado de pago de ventas usa draft para mostrar/limpiar control dependiente; esa limpieza nunca hace submit. Columnas/resultados siguen usando estado aplicado.

Otros archivos del ajuste:

```text
src/hooks/useFilters.js
src/api/pagedLists.js
src/api/listFilters.js
src/common/components/table/Filters.jsx
tests/unit/list-remote-filters.test.js
docs/manual-list-filter-application.md
docs/server-side-count-call.md — referencia a este informe
docs/server-side-filter-call.md — referencia a este informe
```

No se modificaron backend, exportaciones, infraestructura Dexie, API de catálogo ni selector de productos de creación/edición de presupuesto. Consumidores locales de `useFilters` mantienen su comportamiento previo.

## Validaciones

```powershell
node --test tests/unit/list-remote-filters.test.js tests/unit/budgets-history-hard-deleted-filter.test.js
```

**30/30 pasan.** Incluyen borrador textual/select, submit combinado, Enter, reset sin filtros, conservar draft durante página/tamaño/sort, count=true al aplicar, count=false al navegar y una request al repetir Buscar/reset sobre misma query. Continúan pasando pruebas previas de conteo/mutaciones, raw response, tabla local/remota, catálogo y fechas.

ESLint con `no-undef=error`, sobre 12 archivos JS/JSX del ajuste: **cero errores y advertencias**. `git diff --check`: pasa.

```powershell
node C:/Users/Usuario/AppData/Local/Temp/callixto-manual-filter-smoke.cjs
```

**PASS nueve pantallas**, API completamente simulada. Verifica ausencia de requests después de escribir/seleccionar y esperar más de 400 ms; Buscar/Enter/reset con exactamente un GET, página 1 y count=true; página 2 usa count=false; draft pendiente conserva resultados y sobrevive tamaño/sort; submit combinado de estado/cliente/id/pago en ventas; Enter desde vendedor; limpiar y repetir aplicaciones. Cero operaciones IndexedDB, cero errores de runtime y ninguna mutación de backend. No suite E2E completa.

Captura de requests: `C:/Users/Usuario/AppData/Local/Temp/callixto-manual-filter-requests.json`. Servidor temporal aislado 127.0.0.1:3107 detenido al terminar; cambio automático de tsconfig retirado.

## Git diff

Stat global solicitado; incluye cambios previos de esta branch. Archivos untracked no aparecen en `git diff --stat`.

```text
 src/api/brands.js                                  | 26 +++++---
 src/api/budgets.js                                 | 67 +++++++++-----------
 src/api/cashBalances.js                            | 24 +++-----
 src/api/common.js                                  | 23 ++++---
 src/api/customers.js                               | 28 ++++++---
 src/api/expenses.js                                | 22 +++----
 src/api/products.js                                | 32 ++++++----
 src/api/stock.js                                   | 11 +++-
 src/api/suppliers.js                               | 28 ++++++---
 src/api/users.js                                   | 24 +++-----
 src/app/(private)/cajas/page.jsx                   | 14 ++++-
 src/app/(private)/clientes/page.jsx                | 22 +++++--
 src/app/(private)/gastos/page.jsx                  | 14 ++++-
 src/app/(private)/historial-ventas/page.jsx        | 26 +++++---
 src/app/(private)/marcas/page.jsx                  | 14 ++++-
 src/app/(private)/productos/crear/page.jsx         |  8 +--
 src/app/(private)/productos/page.jsx               | 16 +++--
 src/app/(private)/proveedores/page.jsx             | 14 ++++-
 src/app/(private)/usuarios/page.jsx                | 14 ++++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    |  8 +--
 src/app/(private)/ventas/crear/page.jsx            |  8 +--
 src/app/(private)/ventas/page.jsx                  | 18 ++++--
 src/common/components/table/Filters.jsx            | 10 +--
 src/common/components/table/Pagination.jsx         | 24 ++++++--
 src/common/components/table/Table.jsx              | 54 ++++++++++++----
 src/components/brands/BrandsPage/index.jsx         | 14 ++---
 src/components/budgets/BudgetDeliveries/index.jsx  |  4 +-
 src/components/budgets/BudgetsPage/index.jsx       | 67 ++++++--------------
 .../cashBalances/CashBalancesPage/index.jsx        | 15 ++---
 src/components/customers/CustomersPage/index.jsx   | 16 +++--
 src/components/expenses/ExpensesPage/index.jsx     | 20 ++----
 src/components/layout/useListPageSideActions.jsx   | 13 ++--
 .../products/BatchImportProducts/index.jsx         |  6 +-
 src/components/products/ProductsPage/index.jsx     | 19 +++---
 src/components/settings/Entities/Budgets/index.jsx |  4 +-
 src/components/suppliers/SuppliersPage/index.jsx   | 14 ++---
 src/components/users/UserPage/index.jsx            | 14 ++---
 src/components/users/users.constants.js            |  2 +-
 src/hooks/useFilterParams.js                       |  6 +-
 src/hooks/useFilters.js                            | 71 +++++++++++++++++-----
 .../budgets-history-hard-deleted-filter.test.js    | 19 +-----
 tests/unit/stock-batching.test.js                  | 56 ++++++++++-------
 42 files changed, 526 insertions(+), 383 deletions(-)
```

## Estado Git

Sin `git add`, sin commit, sin push. Sin cambios staged. Branch `590-test-staging` conservada.
