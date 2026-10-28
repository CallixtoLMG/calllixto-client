> Marca/Proveedor ahora usan hasProducts para eliminar; ver [comportamiento actual](entity-has-products.md). Catálogo finito de presupuestos sigue vigente.

# Catálogo finito y eliminación de paginación por cursor

Branch: `590-test-staging`. Corrección sobre cambios locales previos de filtros, count y paginación. Inspección estática realizada antes de ejecutar pruebas. Backend real no abierto; todas las requests de validación usaron respuestas simuladas.

## A. Causa raíz y secuencia

La condición insegura estaba en `src/api/common.js`, antigua función `entityList` (líneas 19–43 de HEAD). Su `do/while` volvía a ejecutar GET mientras la response mantuviera `LastEvaluatedKey`. Serializaba ese valor para la siguiente request, pero no enviaba ni incrementaba `pageNumber`. No verificaba avance del cursor, cantidad esperada de páginas ni límite de requests. Una response con el mismo valor no vacío repetía indefinidamente la misma request después del primer salto. Un backend numérico que ignore ese parámetro también vuelve a entregar la misma página si no recibe un número nuevo.

El defecto frontend quedó demostrado antes de corregirlo con un probe aislado: GET simulado devolviendo el mismo cursor y count=1200; corte forzado en el quinto GET. Ningún request avanzó página numérica; las requests posteriores al primer salto repetían los mismos parámetros. No existe captura autenticada del backend real: la condición exacta de sus responses sigue pendiente; no se afirma haber reproducido tráfico real.

Consumidores del helper completo, todos detrás de `listItems`: `useProductCatalog`, `useCustomerCatalog`, `useSupplierCatalog`, `useBrandCatalog`, `useProductsBySupplierId` y `useListSettings`.

Secuencias de productos:

| Entrada | Cadena antes de la corrección |
| --- | --- |
| Crear venta | `ventas/crear/page.jsx` → `useProductCatalog` → `listItems` → `entityList` → GET products repetido por condición de cursor |
| Borrador | `ventas/[id]/borrador/page.jsx` → misma cadena; selector necesita catálogo completo |
| Venta normal, pestaña Entregas | `ventas/[id]/page.client.jsx` → `BudgetView` → pestaña `Entregas` → `BudgetDeliveries` → `useProductCatalog` → misma cadena; consulta estado actual de control de stock |
| Marca | `marcas/[id]/page.jsx` obtiene marca → `page.client.jsx` → `useHasProductsByBrandId` → `useProductCatalog` → misma cadena |

Distinción solicitada:

- **A: carga intencional.** Selectores de creación/borrador y verificación de productos necesitan colección completa; conservados.
- **B: refetch redundante.** Crear y borrador llamaban además `refetchProductsData()` al montar, desde efecto de breadcrumbs. Retirado ese refetch y su dependencia. No era necesario para iniciar consulta ni constituía por sí solo condición infinita.
- **C: loop legacy.** La siguiente request se originaba dentro del helper, antes de resolver la query. Esta es la condición de repetición ilimitada encontrada.
- **D: invalidación repetida.** No encontrada en esas cadenas. Query de catálogo usa clave estable `[LIST_PRODUCTS_QUERY_KEY, "catalog"]`; verificación de marca y derivación de entregas no invalidan después del fetch. Cambios de breadcrumbs/nav no cambian parámetros de catálogo. Invalidaciones de mutaciones siguen asociadas a operaciones de escritura.

## B. Infraestructura eliminada y búsqueda

Eliminados export/helper `entityList`, variable de cursor, envío JSON, lectura de response y `do/while`. `listItems` conservado por su sincronización de catálogos; llama al nuevo loader numérico. Tests antiguos de recorrido por cursor reemplazados por contratos numéricos. Comentarios runtime relacionados actualizados.

```powershell
rg -n 'LastEvaluatedKey|entityList' src tests
```

Resultado: **0 coincidencias**. `rg` devuelve código 1 cuando no encuentra coincidencias. Búsqueda global sólo conserva explicaciones históricas en este informe y en `docs/server-side-filter-call.md` / `docs/server-side-count-call.md`, ambos marcados explícitamente como anteriores a esta corrección. Son documentación de causa/evidencia, sin envío, lectura, tipos ni lógica runtime.

## C. Catálogo completo, corte y errores

Punto central: `src/api/catalogLists.js`, `listCatalogPages`. El adaptador existente `readListTotal` / `readListPagination` centraliza `count`/`total` y conversión numérica de strings.

1. GET con `pageNumber=1`, `pageSize=500`, `count=true`, conservando atributos/filtros/sort del consumidor.
2. Validar count/total entero no negativo y seguro. Ausente/inválido: error explícito después de esa única request.
3. `totalPages = Math.ceil(total / pageSize)`. Si backend devuelve tamaño efectivo de primera página, usarlo para cálculo y siguientes requests.
4. `for (pageNumber=2; pageNumber<=totalPages; pageNumber++)`, `count=false`.
5. Sólo al completar todas las páginas, `listItems` sincroniza Dexie y devuelve catálogo. Full refresh ya no borra tabla antes de obtener response válida. Sincronización incremental también reúne todas las páginas antes de escribir.

Defensas: máximo 1000 páginas, timeout de 15 segundos por request, deadline de 120 segundos por carga y propagación de AbortSignal de React Query. Un fallo HTTP/lógico, página repetida, número de página devuelto incorrecto, IDs ausentes/duplicados, tamaño/conteo cambiante o página incompleta corta inmediatamente y propaga error. No hay retry automático de los hooks de catálogo ni refetch al recuperar foco de ventana.

Para total=0 se consulta primera página vacía una vez. Conteo debe corresponder al dataset/filtros de la request, también en sincronización incremental; si count global y resultados filtrados discrepan, carga falla visiblemente. Sin contrato real confirmado no se acepta catálogo parcial como completo.

Crear, borrador, Entregas y Marca muestran error de catálogo. Marca además mantiene eliminación deshabilitada ante error/carga. Un error de página conserva datos previos de Dexie; no devuelve colección vacía como si hubiera tenido éxito.

## D. Por qué Marca solicita productos

`useHasProductsByBrandId` comprueba `product.id.substring(2, 4) === String(brandId)` para impedir eliminar una marca con productos asociados. Dependencia correcta para la acción de eliminar, excesiva para usuarios sin ese permiso. Ahora `page.client.jsx` habilita consulta sólo si `RULES.canRemove[role]`; el hook además exige ID. Roles de lectura: 0 requests de productos. Rol con eliminación: carga finita necesaria, salvo catálogo ya fresco en React Query.

No se reemplazó asociación por endpoint nuevo ni selector por búsqueda remota. No se agregó memoización indiscriminada.

## E. Requests esperadas

| Flujo sin cache React Query fresca | Requests products |
| --- | --- |
| Productos listado | 1 por página; tamaño actual del listado |
| Crear / editar borrador | `max(1, ceil(count / tamaño efectivo))` |
| Venta confirmada, pestaña inicial | 0 por catálogo; Entregas monta su consumidor al abrir pestaña |
| Venta confirmada, Entregas | mismo N finito |
| Marca con permiso de eliminar | mismo N finito, comprobación de asociaciones |
| Marca sin permiso | 0 |
| Catálogo sin count válido | 1 y error |

Ejemplos verificados: 1200/500 → páginas 1, 2, 3 solamente; 500/500 → una request. Primera count=true; restantes count=false. Con cache local válida, count corresponde a registros actualizados desde startDate y esa carga incremental también termina numéricamente. React Query fresco puede evitar nueva carga.

Los nueve listados remotos mantienen filtros draft/applied, Buscar/Enter/reset, pageNumber/pageSize/count/sort y adaptación existentes. Sin cambios de debounce en esta corrección; la aplicación manual de filtros de trabajo previo se conserva.

## F. Dexie restante

Lectura/sincronización de colecciones se mantiene para catálogos de productos, clientes, proveedores, marcas y settings vía `listItems`; asociación de proveedor también consume catálogo de productos. Selectores, verificaciones y refrescos de catálogos conservan flujo actual. CRUD y mantenimiento de cache locales existentes no fueron reestructurados.

Ventas, historial, productos listado, clientes listado, proveedores listado, gastos, cajas, usuarios y marcas listado siguen usando `usePagedList` y response de una página, sin leer/renderizar desde Dexie. Smoke de productos confirma cero operaciones IndexedDB.

## G. Validación segura

```powershell
node --test tests/unit/catalog-pagination.test.js tests/unit/list-remote-filters.test.js tests/unit/budget-deliveries-consume-response.test.js
```

50 tests focalizados pasan: loader finito y almacenamiento, count string/alias, 1200/500 y 500/500, vacío, errores de página, count ausente/inválido, datos repetidos, cancelación/deadline, límite máximo y permiso/ID de marca; además regresiones de aplicación manual, count de listados y entregas. Archivo nuevo: 10/10; ejecución final conjunta: 50/50. No suite E2E completa.

Lint: `npx next lint --file ...` sobre 13 archivos runtime tocados: sin warnings ni errores (`catalogLists`, `common`, `products`, `brands`, `customers`, `suppliers`, `settings`, `listPagination`, `pagedLists`, Marca client, crear venta, borrador y BudgetDeliveries). `git diff --check`: limpio. Script smoke validado por `node --check`.

Smoke ejecutado:

```powershell
$env:NODE_OPTIONS='--require=C:/Users/Usuario/AppData/Local/Temp/callixto-pagination-preload.cjs'
$env:NEXT_TELEMETRY_DISABLED='1'
$env:NEXT_PUBLIC_URL='http://127.0.0.1:3108/'
node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 --port 3107
# Otro proceso, con server anterior listo:
node tests/smoke/catalog-pagination.cjs
```

Preload usado sólo para aislar distDir `.next/pagination-smoke`; no cambios permanentes de configuración. Fake API local procesa tanto fetch SSR como Axios browser. Browser bloquea orígenes externos. Máximo 10 GET products por escenario, watchdog 30 segundos que cierra contexto inmediatamente; fallo corta resto de prueba. Sin sleeps largos.

7/7 escenarios pasan: crear=3, borrador=3, Marca admin=3, Marca lectura=0, Marca count ausente=1/error/eliminación bloqueada/sin escrituras Dexie, Entregas=3, productos listado=1/cero IndexedDB. Selector encuentra producto 1200 de última página. Primer intento abortó por compilación inicial de Next antes de requests API; un selector de test de Marca fue corregido para su campo visual deshabilitado. Resultado final completo pasó sin errores browser.

Requests guardadas en `C:/Users/Usuario/AppData/Local/Temp/callixto-finite-catalog-requests.json`. Browser, API simulada y Next aislado cerrados. Adición automática de Next a tsconfig retirada; archivo quedó sin cambios.

## H. Archivos de esta corrección

20 archivos, incluyendo documentación. Cambios locales anteriores conservados; inventario completo del workspace también disponible al final de este informe.

- `src/api/catalogLists.js` (nuevo)
- `src/api/common.js`
- `src/api/products.js`
- `src/api/brands.js`
- `src/api/customers.js`
- `src/api/suppliers.js`
- `src/api/settings.js`
- `src/api/listPagination.js` (comentario)
- `src/api/pagedLists.js` (comentario)
- `src/app/(private)/marcas/[id]/page.client.jsx`
- `src/app/(private)/ventas/crear/page.jsx`
- `src/app/(private)/ventas/[id]/borrador/page.jsx`
- `src/components/budgets/BudgetDeliveries/index.jsx`
- `tests/unit/list-remote-filters.test.js`
- `tests/unit/budget-deliveries-consume-response.test.js`
- `tests/unit/catalog-pagination.test.js` (nuevo)
- `tests/smoke/catalog-pagination.cjs` (nuevo)
- `docs/finite-product-catalog.md` (nuevo)
- `docs/server-side-filter-call.md` (nota histórica)
- `docs/server-side-count-call.md` (nota histórica)

## I. Git diff

`git diff --stat`: **45 archivos, 598 inserciones, 436 eliminaciones**. Incluye trabajo local previo y sólo archivos tracked; archivos nuevos/untracked no aparecen en ese stat. Salida completa abajo.

## J. Estado Git

Branch `590-test-staging`. Sin `git add`, commit ni push. 45 archivos tracked modificados y 12 untracked. Índice vacío (`git diff --cached --name-only` sin salida); todos los cambios permanecen locales. Backend sin modificaciones. Salida completa de `git status --short` abajo.

### git diff --stat

```text
 src/api/brands.js                                  | 31 +++++++---
 src/api/budgets.js                                 | 67 +++++++++-----------
 src/api/cashBalances.js                            | 24 +++-----
 src/api/common.js                                  | 61 ++++++------------
 src/api/customers.js                               | 31 +++++++---
 src/api/expenses.js                                | 22 +++----
 src/api/products.js                                | 52 +++++++++++-----
 src/api/settings.js                                |  5 +-
 src/api/stock.js                                   | 11 +++-
 src/api/suppliers.js                               | 33 +++++++---
 src/api/users.js                                   | 24 +++-----
 src/app/(private)/cajas/page.jsx                   | 14 ++++-
 src/app/(private)/clientes/page.jsx                | 22 +++++--
 src/app/(private)/gastos/page.jsx                  | 14 ++++-
 src/app/(private)/historial-ventas/page.jsx        | 26 +++++---
 src/app/(private)/marcas/[id]/page.client.jsx      | 14 ++++-
 src/app/(private)/marcas/page.jsx                  | 14 ++++-
 src/app/(private)/productos/crear/page.jsx         |  8 +--
 src/app/(private)/productos/page.jsx               | 16 +++--
 src/app/(private)/proveedores/page.jsx             | 14 ++++-
 src/app/(private)/usuarios/page.jsx                | 14 ++++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    | 18 ++++--
 src/app/(private)/ventas/crear/page.jsx            | 18 ++++--
 src/app/(private)/ventas/page.jsx                  | 18 ++++--
 src/common/components/table/Filters.jsx            | 10 +--
 src/common/components/table/Pagination.jsx         | 24 ++++++--
 src/common/components/table/Table.jsx              | 54 ++++++++++++----
 src/components/brands/BrandsPage/index.jsx         | 14 ++---
 src/components/budgets/BudgetDeliveries/index.jsx  | 12 +++-
 src/components/budgets/BudgetsPage/index.jsx       | 72 ++++++----------------
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
 src/hooks/useFilters.js                            | 71 ++++++++++++++++-----
 .../budget-deliveries-consume-response.test.js     |  2 +-
 .../budgets-history-hard-deleted-filter.test.js    | 19 +-----
 tests/unit/stock-batching.test.js                  | 56 ++++++++++-------
 45 files changed, 598 insertions(+), 436 deletions(-)
```

### git status --short --untracked-files=all

```text
 M src/api/brands.js
 M src/api/budgets.js
 M src/api/cashBalances.js
 M src/api/common.js
 M src/api/customers.js
 M src/api/expenses.js
 M src/api/products.js
 M src/api/settings.js
 M src/api/stock.js
 M src/api/suppliers.js
 M src/api/users.js
 M src/app/(private)/cajas/page.jsx
 M src/app/(private)/clientes/page.jsx
 M src/app/(private)/gastos/page.jsx
 M src/app/(private)/historial-ventas/page.jsx
 M src/app/(private)/marcas/[id]/page.client.jsx
 M src/app/(private)/marcas/page.jsx
 M src/app/(private)/productos/crear/page.jsx
 M src/app/(private)/productos/page.jsx
 M src/app/(private)/proveedores/page.jsx
 M src/app/(private)/usuarios/page.jsx
 M src/app/(private)/ventas/[id]/borrador/page.jsx
 M src/app/(private)/ventas/crear/page.jsx
 M src/app/(private)/ventas/page.jsx
 M src/common/components/table/Filters.jsx
 M src/common/components/table/Pagination.jsx
 M src/common/components/table/Table.jsx
 M src/components/brands/BrandsPage/index.jsx
 M src/components/budgets/BudgetDeliveries/index.jsx
 M src/components/budgets/BudgetsPage/index.jsx
 M src/components/cashBalances/CashBalancesPage/index.jsx
 M src/components/customers/CustomersPage/index.jsx
 M src/components/expenses/ExpensesPage/index.jsx
 M src/components/layout/useListPageSideActions.jsx
 M src/components/products/BatchImportProducts/index.jsx
 M src/components/products/ProductsPage/index.jsx
 M src/components/settings/Entities/Budgets/index.jsx
 M src/components/suppliers/SuppliersPage/index.jsx
 M src/components/users/UserPage/index.jsx
 M src/components/users/users.constants.js
 M src/hooks/useFilterParams.js
 M src/hooks/useFilters.js
 M tests/unit/budget-deliveries-consume-response.test.js
 M tests/unit/budgets-history-hard-deleted-filter.test.js
 M tests/unit/stock-batching.test.js
?? docs/finite-product-catalog.md
?? docs/manual-list-filter-application.md
?? docs/server-side-count-call.md
?? docs/server-side-filter-call.md
?? src/api/catalogLists.js
?? src/api/listCounts.js
?? src/api/listFilters.js
?? src/api/listPagination.js
?? src/api/pagedLists.js
?? tests/smoke/catalog-pagination.cjs
?? tests/unit/catalog-pagination.test.js
?? tests/unit/list-remote-filters.test.js
```
