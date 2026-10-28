> Registro histórico de implementación previa. Carga completa de catálogos y evidencia de cursor fueron reemplazadas por paginación numérica finita; ver [corrección actual](finite-product-catalog.md).

# Paginación remota experimental — Callixto, 8 octubre 2026

Aplicación de filtros ahora manual: [Buscar/Enter y draft/applied](manual-list-filter-application.md). Debounce remoto y submits automáticos descritos en este informe histórico fueron retirados.

Actualización de conteo del 13 octubre: ver [contrato count y conservación de total](server-side-count-call.md). Ese informe reemplaza notas de metadata/requests correspondientes al ajuste de conteo.

Branch `590-test-staging`. Preparado para descubrir contrato real durante llamada con backend. Este informe reemplaza el anterior sobre filtros con paginación local.

## A. Arquitectura final de prueba

```text
LISTADOS
UI / React Hook Form
→ useFilters / useFilterParams (estado React + localStorage)
→ listFilters + listPagination (filtros + página + tamaño + sort/order)
→ usePagedList / listPage (un GET por consulta)
→ response backend
→ tabla con serverPagination (sin filtro, orden ni recorte local)

SELECTOR DE PRODUCTOS
useProductCatalog (queryKey separado)
→ listItems / entityList legacy
→ catálogo completo, cursor y sincronización Dexie
→ SearchControlled / productos del presupuesto
```

Listado remoto funciona con o sin filtros. No consulta `lastUpdatedAt`, no `bulkPut`, no `toArray`, no clear/refill, no sync incremental. No sigue `LastEvaluatedKey`. Actualización rápida/completa vuelve a consultar la página actual. Se conservó infraestructura Dexie y modo local de tabla.

Cache remota: `[LIST_ENTITY_QUERY_KEY, "page", requestParams]`. `requestParams` contiene página, tamaño, filtros activos, sort/order, atributos y fechas aplicables. Cache catálogo: `[LIST_ENTITY_QUERY_KEY, "catalog"]`. Ambos se invalidan con el prefijo existente de entidad, sin confundir sus datos. No se conserva la página anterior como respuesta de una consulta nueva. Ventas memoriza fecha inicial por rango configurado: navegar/filtrar no cambia rango con el reloj ni genera keys nuevas por render. Se eliminó refetch inicial duplicado del listado; React Query consulta al habilitarse.

## B. Entidades migradas

| Entidad / pantalla | Dexie listado | pageNumber | pageSize | Filtros enviados al backend |
|---|---|---|---|---|
| Ventas `/ventas` | No | Sí | Sí | id, customer, createdBy, state, paymentStatus |
| Historial `/historial-ventas` | No | Sí | Sí | Mismos + startDate/endDate |
| Productos `/productos` | No | Sí | Sí | id, name, state |
| Clientes `/clientes` | No | Sí | Sí | name, state |
| Proveedores `/proveedores` | No | Sí | Sí | id, name, state |
| Gastos `/gastos` | No | Sí | Sí | id, name, categories, state |
| Cajas `/cajas` | No | Sí | Sí | id, paymentMethods, state |
| Usuarios `/usuarios` | No | Sí | Sí | username, firstName, lastName, state |
| Marcas `/marcas` | No | Sí | Sí | id, name, state |

Filtros nuevos permanecen `confirmed: false` en `src/api/listFilters.js`: nombres enviados para experimento, soporte backend todavía no verificado. Se omiten null/undefined/cadena vacía/array vacío/`all`; campos desconocidos no viajan. `paymentStatus` sólo viaja con `state=CONFIRMED`, cuando control es visible. Vendedor envía nombre completo elegido por UI. Categoría/método de pago envían cadena seleccionada.

Texto: debounce 400 ms; selecciones y Buscar: inmediato. Filtro, tamaño o sort nuevo vuelve a página 1. Cambiar página dispara otra consulta. Historial conserva sus fechas y reinicia página cuando cambia rango. Filtros y página siguen persistiendo en localStorage; no es IndexedDB.

## C. Productos y selector

`/productos` usa `useListProducts` → `usePagedList`, devuelve exactamente `response.products`. El selector usa `useProductCatalog` explícitamente en `/ventas/crear` y `/ventas/[id]/borrador`. Conserva colección completa, filtros locales propios del selector y Dexie legacy. No comparte cache de página con catálogo.

Importación masiva también necesita catálogo completo; `BatchImportProducts` lo habilita sólo al abrirse. Su presencia en acciones de `/productos` ya no lanza catálogo ni toca Dexie con modal cerrado. Asociaciones por marca y productos de proveedor conservan sus consultas completas.

## D. Requests generadas por código

Ejemplos de parámetros funcionales; se omite prefijo API/cuenta y, para legibilidad, `attributes` codificado que los listados habituales conservan. Fechas dependen del rango elegido/configurado.

```http
GET /products?pageNumber=2&pageSize=20&name=coca&state=ACTIVE
GET /products?pageNumber=1&pageSize=50&name=coca&state=ACTIVE&sort=id&order=true
GET /customers?pageNumber=1&pageSize=20&name=Mart%C3%ADn&state=ACTIVE
GET /budgets?pageNumber=1&pageSize=20&customer=Mart%C3%ADn%20Bueno&sort=id&order=false&startDate=2026-10-01T00%3A00%3A00.000Z&endDate=2026-10-08T23%3A59%3A59.000Z
```

`pageNumber/pageSize`, `sort/order` y traducción de dirección centralizados en `src/api/listPagination.js`. ASC → `order=true`; DESC → `order=false`. No `sortDirection`. Ventas/historial conservan `sort=createdAt` como base; estado UI actual por defecto (`id`, DESC) lo reemplaza. Todos los encabezados ordenables envían su key al backend; jamás se usa orden local como sustituto.

Usuario confirmó contrato legacy `sort/order` y sorts al menos `id`, `createdAt`, `customerId`, `state`, `publicHash`, `updatedAt`. Otros keys de encabezados (p. ej. name/price/stock) y cambios del nuevo backend quedan pendientes. No se asume soporte sólo porque UI ofrece encabezado.

## E. Response backend: evidencia y adaptación

Evidencia disponible: contrato legacy `statusOk`, array de entidad y opcional `LastEvaluatedKey`. No hubo JSON autenticado nuevo ni prueba contra backend real. Usuario autorizó seguir experimentalmente. Ejemplo válido:

```json
{"statusOk": true, "budgets": []}
```

`listPage` conserva objeto response y array completos. No oculta `HARD_DELETED`, no infiere total y no sigue cursor. Error explícito `statusOk=false` o falta de array producen error de consulta; array vacío es página vacía válida.

`readListPagination`, único adaptador de metadata, consume opcionalmente campos raíz `total`, `totalPages`, `pageNumber`, `pageSize`, `hasNext` sólo si existen y son válidos. Los nombres son candidatos autorizados para cuando backend los devuelva; no son contrato autenticado confirmado. Acepta enteros numéricos/cadenas numéricas; no interpreta booleanos, arrays ni vacíos como total. Cambiar naming/envelope posteriormente se resuelve allí.

Sin total/totalPages:

```js
previousEnabled = pageNumber > 1;
nextEnabled = hasNext ?? (items.length === pageSize);
```

UI indica página actual, registros recibidos y «Total no informado». No muestra cantidad total de páginas inventada. `totalPages` devuelto permite navegación numérica; `total` devuelto permite calcular `ceil(total/pageSize)`. Si ambos faltan, `hasNext` tiene prioridad sobre heurística. Loading deshabilita Anterior/Siguiente. Si última página tiene exactamente pageSize filas, Siguiente puede devolver []; fallback temporal aceptado, Anterior permite volver.

## F. Tabla

`CustomTable` recibe `serverPagination` explícito. Página y tamaño provienen del estado controlado, con metadata devuelta válida si existe. En este modo `filteredElements` retorna `elements` directamente y `currentPageElements` retorna esa misma página: nunca llama `.filter`, `.sort` ni `.slice`. Los padres de listados ya no pasan `createFilter`; historial sólo agrega href a cada presupuesto, sin descartar filas. Selección/acciones siguen usando filas actuales.

Encabezados cambian sort y página 1; paginador y atajos actualizan el mismo estado que construye request. Tamaño cambia página 1. Modo local conserva su filtro, orden y slice para otros consumidores, incluyendo tablas de productos del presupuesto.

## G. Dexie que permanece

| Flujo / hook | Motivo |
|---|---|
| `useProductCatalog` en creación/borrador de ventas | Selector necesita productos fuera de primera página |
| `useProductCatalog` en `BudgetDeliveries` | Validación/selección de productos del catálogo |
| `useCustomerCatalog` en creación/borrador de ventas | Selector de clientes completo |
| `useCustomerCatalog` en settings de presupuestos | Opciones de clientes para defaults |
| `useBrandCatalog` / `useSupplierCatalog` en creación de producto | Selectores completos |
| `useProductCatalog` en `BatchImportProducts`, sólo abierto | Detectar/importar contra catálogo completo |
| `useHasProductsByBrandId` → catálogo | Verificar asociación antes de acciones de marca |
| `useProductsBySupplierId` → legacy completo | Productos asociados de detalle de proveedor |
| `useListSettings` y CRUD legacy de entidades | Infraestructura previa, fuera de loader de página remoto |

`src/db.js` intacto. Mutaciones/detalles legacy no se refactorizaron globalmente. Corrección mínima en `listItems`: catálogo vacío ya no falla al desestructurar `values[0]`; no escribe timestamp inventado cuando no hay registros.

## H. Riesgos conocidos

- Exportaciones mantienen botones, formatos y lógica. Reciben sólo página actual; no exportan dataset completo ni siguen cursores ocultos. Único cambio defensivo: traducción de estado desconocido en Excel de ventas usa estado original, evitando excepción al mostrar response sin excluir HARD_DELETED.
- Filtros nuevos pueden ser ignorados/rechazados por backend. Esto queda visible, sin segunda pasada local.
- Sorts fuera de evidencia legacy requieren confirmación; backend puede ignorarlos. El orden recibido se conserva.
- Metadata nueva no autenticada. Totales y envoltorio final pendientes en adaptador central.
- Fallback Siguiente puede tener falso positivo en última página completa.
- Opciones de vendedor en ventas/historial usan `useListUsers` remoto por defecto (primera página, 20); no garantizan catálogo completo de vendedores. Se evitó Dexie auxiliar en estas pantallas.
- Si backend ignora pageNumber/pageSize y devuelve toda colección, tabla mostrará toda esa respuesta. No la recorta para ocultar incumplimiento.
- Infraestructura legacy de catálogo mantiene sus limitaciones previas; no es rediseño general de sincronización ni de mutaciones.

## I. Archivos modificados

Cambios de esta implementación y primera parte de filtros en esta conversación:

```text
src/api/brands.js
src/api/budgets.js
src/api/cashBalances.js
src/api/common.js
src/api/customers.js
src/api/expenses.js
src/api/products.js
src/api/suppliers.js
src/api/users.js
src/api/listFilters.js (nuevo)
src/api/listPagination.js (nuevo)
src/api/pagedLists.js (nuevo)
src/app/(private)/cajas/page.jsx
src/app/(private)/clientes/page.jsx
src/app/(private)/gastos/page.jsx
src/app/(private)/historial-ventas/page.jsx
src/app/(private)/marcas/page.jsx
src/app/(private)/productos/page.jsx
src/app/(private)/productos/crear/page.jsx
src/app/(private)/proveedores/page.jsx
src/app/(private)/usuarios/page.jsx
src/app/(private)/ventas/page.jsx
src/app/(private)/ventas/crear/page.jsx
src/app/(private)/ventas/[id]/borrador/page.jsx
src/common/components/table/Filters.jsx
src/common/components/table/Pagination.jsx
src/common/components/table/Table.jsx
src/components/brands/BrandsPage/index.jsx
src/components/budgets/BudgetDeliveries/index.jsx
src/components/budgets/BudgetsPage/index.jsx
src/components/cashBalances/CashBalancesPage/index.jsx
src/components/customers/CustomersPage/index.jsx
src/components/expenses/ExpensesPage/index.jsx
src/components/layout/useListPageSideActions.jsx
src/components/products/BatchImportProducts/index.jsx
src/components/products/ProductsPage/index.jsx
src/components/settings/Entities/Budgets/index.jsx
src/components/suppliers/SuppliersPage/index.jsx
src/components/users/UserPage/index.jsx
src/components/users/users.constants.js
src/hooks/useFilterParams.js
src/hooks/useFilters.js
tests/unit/budgets-history-hard-deleted-filter.test.js
tests/unit/list-remote-filters.test.js (nuevo)
docs/server-side-filter-call.md (nuevo)
```

También había cambios previos en `src/api/stock.js`, `tests/unit/stock-batching.test.js` y batch de 500 en `src/api/products.js`; se preservaron, no se atribuyen a paginación. Estado Git global incluye esos archivos. Scripts/servidor de smoke quedan en carpeta temporal del usuario, fuera del repo.

## J. Validaciones

- `node --test tests/unit/list-remote-filters.test.js tests/unit/budgets-history-hard-deleted-filter.test.js`: 19/19 pasan. Incluye todas las keys de API, raw response con cursor/HARD_DELETED, metadata ausente/válida, debounce, reset, catálogo legacy, actualización completa remota/legacy y tabla remota/local ejecutadas.
- ESLint sobre 43 archivos JS/JSX modificados/nuevos, con `no-undef=error`: 0 errores, 0 advertencias.
- `node C:/Users/Usuario/AppData/Local/Temp/callixto-pagination-smoke.cjs --sales-only`: PASS corrección final de ventas: una request inicial, una request de filtro, mismo startDate tras cambiar segundo del reloj y cero operaciones IndexedDB.
- `git diff --check`: pasa.
- `node C:/Users/Usuario/AppData/Local/Temp/callixto-pagination-smoke.cjs`: PASS nueve listados, páginas/tamaño/filtros/sort/order, metadata presente/ausente, hasNext y cero operaciones IndexedDB en listados. PASS selector de creación y borrador: búsqueda/selección de producto fuera de primera página. Cero errores de runtime. Servidor temporal 127.0.0.1:3107, output aislado mediante preload temporal en `.next/pagination-smoke`; detenido al finalizar. Cambio automático de tsconfig por Next revertido. API interceptada/simulada; no demuestra soporte del backend real. No guardó presupuestos ni ejecutó escrituras de API. No suite E2E completa.

## K. Git diff

Salida final de `git diff --stat`. Incluye cambios previos preservados; Git no incluye untracked en esta salida. Los cinco archivos nuevos se enumeran en I.

```text
 src/api/brands.js                                  | 26 ++++++---
 src/api/budgets.js                                 | 67 +++++++++-------------
 src/api/cashBalances.js                            | 24 ++++----
 src/api/common.js                                  |  7 ++-
 src/api/customers.js                               | 28 ++++++---
 src/api/expenses.js                                | 22 +++----
 src/api/products.js                                | 30 ++++++----
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
 42 files changed, 503 insertions(+), 352 deletions(-)
```

## L. Estado Git

Sin `git add`, sin commit, sin push. Backend intacto. Branch actual conservada. Sin cambios staged.
