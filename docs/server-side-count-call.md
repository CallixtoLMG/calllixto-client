> Registro histórico de implementación previa. Carga completa de catálogos y evidencia de cursor fueron reemplazadas por paginación numérica finita; ver [corrección actual](finite-product-catalog.md).

# Conteo remoto experimental — 13 octubre 2026

Aplicación de filtros ahora manual: [Buscar/Enter y draft/applied](manual-list-filter-application.md). Política count conservada; ese informe reemplaza referencias anteriores a aplicación automática.

Branch `590-test-staging`. Ajuste sobre paginación existente. Nueve listados comparten implementación; ningún listado vuelve a usar Dexie. `useProductCatalog` y catálogo legacy de productos no se modificaron en este ajuste.

## A. Estado anterior

`count` no se enviaba. `usePagedList` construía params comunes con `getDefaultListParams`, params base y `buildListPageParams`. Totales sólo provenían de la response de la página actual: una página posterior sin metadata perdía total anterior.

## B. Punto central modificado

- `src/api/listCounts.js`: decide `count` en `fetchCountedListPage`; guarda total en memoria por QueryClient, entidad, URL, filtros y fechas. Página/tamaño/sort/order/attributes/count no definen otro conjunto.
- `src/api/pagedLists.js`: integra esa política en todos los hooks remotos; agrega `count` al ejecutar request. `listPage` también tiene default explícito true. QueryKey de página conserva filtros/página/tamaño/sort/fechas y excluye `count`.
- `src/api/listPagination.js`: centraliza nombre de request y lectura/normalización de conteo. Array de items y orden backend permanecen intactos; sólo se normaliza metadata para UI. Response cruda permanece en Network y cache de consulta.
- `src/api/common.js`: CRUD exitoso invalida conteos de entidad antes de invalidar queries. Esto cubre ventas/historial incluso si sólo existe cache de historial y no coincide prefijo de ventas.
- El store escucha invalidaciones de queries con `meta.pagedListEntity` para cubrir invalidaciones directas de batch. Al vaciar QueryClient también vacía conteos. Una response iniciada antes de invalidación/reset no puede restituir conteo anterior.

Primera entrada al hook o cambio de filtros/fechas reinicia conteo del conjunto. Después de recibir un conteo válido, navegación/tamaño/sort lo reutilizan. Cambiar filtro y luego volver a un filtro anterior solicita otro conteo; no reutiliza silenciosamente uno viejo.

Correcciones necesarias encontradas: batch create de productos invalidaba `[[LIST_PRODUCTS_QUERY_KEY]]`, que no coincide con cache real; ahora usa `[LIST_PRODUCTS_QUERY_KEY]`. Mapping de ventas tenía `customerName` como clave UI, pero input/default usa `customer`: se alineó clave UI a `customer`, conservando query param `customerName` ya presente en esta branch.

## C. Matriz final

| Acción | count | pageNumber |
|---|---:|---:|
| Primera carga, estado inicial por defecto | true | 1 |
| Cambio filtro o rango de fechas | true | 1 |
| Limpiar/resetear filtro | true | 1 |
| Cambiar página | false* | destino |
| Cambiar pageSize | false* | 1 |
| Cambiar sort/order | false* | 1, comportamiento actual |
| Create/edit/delete exitoso | true en próximo refresh relevante | según flujo |

`*` Cuando existe total válido conocido. Si backend todavía no devolvió conteo, esas acciones siguen enviando `count=true`, conforme regla de solicitarlo mientras no exista. No se inventa total para poder usar false.

Mismo patrón en ventas, historial, productos, clientes, proveedores, usuarios, gastos, cajas y marcas. Paginación/filtros/debounce/sort y flujo legacy de selectores conservados.

## D. Response: nombre real pendiente

No se encontró contrato autenticado ni código backend en este repo que confirme nombre REAL de campo. Confirmado por usuario: request `count=true|false`. Response sigue siendo punto a confirmar.

Única adaptación: `readListTotal` en `src/api/listPagination.js`, con `LIST_COUNT_RESPONSE_FIELDS = ["total", "count"]`. Busca primer entero no negativo válido; acepta strings numéricos y cero. Rechaza booleanos, vacío, null, objetos, arrays, negativos y fracciones. `total` tiene prioridad si ambos campos existen. Ambos nombres son candidatos experimentales, no evidencia de contrato real.

Si backend usa otro campo/envelope, ajustar `readListTotal`/lista central. No cambiar nueve pantallas. El adapter debe recibir conteo del conjunto completo; significado exacto del campo también se confirma durante llamada.

Response `count=false` sin campo de conteo conserva último valor válido. Response inválida tampoco lo reemplaza. Cambiar filtros o invalidar entidad descarta conteo anterior; si siguiente response omite conteo, UI vuelve al fallback. No se calcula total desde cantidad de items.

## E. Requests observadas

Proyección de requests reales capturadas durante smoke con API simulada. Se omite prefijo API/cuenta y `attributes` para legibilidad. `count` se serializa como `true`/`false`, incluido false explícitamente.

```http
GET /budgets?sort=id&startDate=2026-10-01T00%3A00%3A00.000Z&endDate=2026-10-13T23%3A59%3A59.000Z&pageNumber=1&pageSize=20&order=false&count=true
GET /budgets?sort=id&startDate=2026-10-01T00%3A00%3A00.000Z&endDate=2026-10-13T23%3A59%3A59.000Z&pageNumber=2&pageSize=20&order=false&count=false
GET /products?state=ACTIVE&pageNumber=1&pageSize=20&count=true
GET /products?state=ACTIVE&pageNumber=2&pageSize=20&count=false
GET /products?state=ACTIVE&pageNumber=1&pageSize=50&count=false
GET /products?name=coca&state=ACTIVE&pageNumber=1&pageSize=50&sort=id&order=true&count=true
GET /customers?state=ACTIVE&pageNumber=1&pageSize=20&count=true
```

Captura completa: `C:/Users/Usuario/AppData/Local/Temp/callixto-count-requests.json`. Ningún request de catálogo de productos se originó al abrir listado. No se siguió `LastEvaluatedKey`.

## F. UI y cache

Ejemplo verificado: primer conteo 347, página 2 sin conteo mantiene 347. Con tamaño 20, 18 páginas; con tamaño 50, 7 páginas, sin volver a contar. `withListTotal` incorpora metadata normalizada a resultado del hook y calcula `ceil(total/pageSize)`; tabla usa total como fuente principal para cantidad de páginas.

Diseño actual equivalente conservado: contador `21 - 40 de 347` y paginador numérico. Ya no muestra «Total no informado» al navegar con total conocido. Navegación respeta límites y loading. Sin conteo disponible mantiene Anterior/Siguiente experimental y texto de total desconocido.

Metadata de una query cacheada no revive conteo invalidado: se retira total anterior y, si pertenecía a ese conteo, su totalPages. No existen dos caches de página por `count=true`/`count=false`, ni queries auxiliares de conteo. Store sólo vive en memoria; ninguna persistencia Dexie/localStorage adicional.

## G. Tests y validaciones

```powershell
node --test tests/unit/list-remote-filters.test.js tests/unit/budgets-history-hard-deleted-filter.test.js tests/unit/stock-batching.test.js
```

**38/38 pasan**: 26 de paginación/filtros/historial, 12 de regresión stock. Casos de count: primera carga, página siguiente, tamaño, sort, filtro, limpiar, total ausente/inválido/cero, CRUD, batch create, invalidación por entidad, reset de sesión, response en vuelo, ausencia de count en queryKey y serialización false con Axios. También conserva validaciones de catálogo legacy y tabla local/remota.

ESLint sobre siete archivos JS/JSX de este ajuste, con `no-undef=error`: cero errores y advertencias. `git diff --check`: pasa.

```powershell
node C:/Users/Usuario/AppData/Local/Temp/callixto-count-smoke.cjs
```

**PASS nueve pantallas**, API interceptada/simulada: count explícito inicial/filtro; productos mantienen total en página/tamaño/sort, recalculan páginas, limpian filtros, preservan fallback al no devolver conteo; ventas/historial navegan con `count=false` y vuelven a página 1 con filtro/count=true. Cero errores de runtime y cero operaciones IndexedDB en listados. Sin mutaciones de API en navegador. Smoke no demuestra contrato real backend.

Servidor de smoke aislado en `127.0.0.1:3107`, output `.next/pagination-smoke`; detenido al terminar. Cambio automático de tsconfig por Next retirado. No se corrió suite E2E completa.

Archivos de este ajuste:

```text
src/api/listCounts.js (nuevo)
src/api/pagedLists.js
src/api/listPagination.js
src/api/listFilters.js
src/api/common.js
src/api/products.js (invalidación batch, catálogo intacto)
src/common/components/table/Table.jsx
tests/unit/list-remote-filters.test.js
docs/server-side-count-call.md (nuevo)
docs/server-side-filter-call.md (referencia a este informe)
```

## H. Git diff

`git diff --stat` global debajo: incluye trabajo experimental previo y cambios de stock ya existentes. Git no incluye untracked en este stat; archivos nuevos enumerados arriba y en informe anterior.

```text
 src/api/brands.js                                  | 26 ++++++---
 src/api/budgets.js                                 | 67 +++++++++-------------
 src/api/cashBalances.js                            | 24 ++++----
 src/api/common.js                                  | 23 +++++---
 src/api/customers.js                               | 28 ++++++---
 src/api/expenses.js                                | 22 +++----
 src/api/products.js                                | 32 +++++++----
 src/api/stock.js                                   | 11 +++-
 src/api/suppliers.js                               | 28 ++++++---
 src/api/users.js                                   | 24 ++++----
 src/app/(private)/cajas/page.jsx                   | 14 ++++-
 src/app/(private)/clientes/page.jsx                | 22 +++++--
 src/app/(private)/gastos/page.jsx                  | 14 ++++-
 src/app/(private)/historial-ventas/page.jsx        | 26 ++++++---
 src/app/(private)/marcas/page.jsx                  | 14 ++++-
 src/app/(private)/productos/crear/page.jsx         |  8 +--
 src/app/(private)/productos/page.jsx               | 16 ++++--
 src/app/(private)/proveedores/page.jsx             | 14 ++++-
 src/app/(private)/usuarios/page.jsx                | 14 ++++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    |  8 +--
 src/app/(private)/ventas/crear/page.jsx            |  8 +--
 src/app/(private)/ventas/page.jsx                  | 18 ++++--
 src/common/components/table/Filters.jsx            |  7 ++-
 src/common/components/table/Pagination.jsx         | 24 ++++++--
 src/common/components/table/Table.jsx              | 54 +++++++++++++----
 src/components/brands/BrandsPage/index.jsx         | 13 ++---
 src/components/budgets/BudgetDeliveries/index.jsx  |  4 +-
 src/components/budgets/BudgetsPage/index.jsx       | 58 +++++--------------
 .../cashBalances/CashBalancesPage/index.jsx        | 13 ++---
 src/components/customers/CustomersPage/index.jsx   | 13 ++---
 src/components/expenses/ExpensesPage/index.jsx     | 18 ++----
 src/components/layout/useListPageSideActions.jsx   | 13 +++--
 .../products/BatchImportProducts/index.jsx         |  6 +-
 src/components/products/ProductsPage/index.jsx     | 13 ++---
 src/components/settings/Entities/Budgets/index.jsx |  4 +-
 src/components/suppliers/SuppliersPage/index.jsx   | 13 ++---
 src/components/users/UserPage/index.jsx            | 13 ++---
 src/components/users/users.constants.js            |  2 +-
 src/hooks/useFilterParams.js                       |  6 +-
 src/hooks/useFilters.js                            | 63 ++++++++++++++++----
 .../budgets-history-hard-deleted-filter.test.js    | 19 +-----
 tests/unit/stock-batching.test.js                  | 56 +++++++++++-------
 42 files changed, 513 insertions(+), 360 deletions(-)
```

## I. Estado Git

Branch `590-test-staging` conservada. Sin `git add`, sin commit, sin push. Sin cambios staged. Backend y catálogo legacy de productos intactos en este ajuste.
