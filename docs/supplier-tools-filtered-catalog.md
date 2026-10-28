# Herramientas del proveedor: carga automática filtrada

Branch `590-test-staging`. Contrato confirmado por usuario: `GET /products` admite exactamente `supplierId`. Implementación y pruebas locales; backend sin modificaciones.

## A. Carga manual eliminada

Retirado botón **Cargar productos del proveedor** y tooltip que exigía cargar antes de usar stock, Excel y códigos. Las herramientas permanecen disponibles según permisos y estado de ocupación. Abrir detalle o expandir Stock/Excel no solicita productos.

## B. Herramientas auditadas

| Herramienta | Necesita productos | Momento de carga/uso |
| --- | --- | --- |
| Descargar productos a Excel | Sí | Click; espera colección completa y genera archivo automáticamente |
| Imprimir códigos | Sí | Click; espera colección completa y commit de contenido antes de imprimir |
| Cargar stock | Sí | Click; espera colección completa, abre selector de archivo y valida IDs/control de stock con esa colección |
| Descontar stock | Sí | Mismo flujo que carga de stock |
| Eliminar todos los productos del proveedor | Sí | Click; obtiene cantidad para confirmación actual de eliminación del lote |
| Descargar plantilla de stock | No | Genera plantilla estática |
| Activar/desactivar proveedor | No | Modal/mutación existentes |
| Eliminar proveedor | No | Exclusivamente `supplier.hasProducts`, modal y DELETE existentes |

Eliminar un lote de productos y eliminar la entidad Proveedor siguen siendo acciones distintas. Ninguna colección de herramientas participa en `canDeleteSupplier`.

## C. Helper/hook

- `src/api/supplierProducts.js`: opciones/key de React Query, carga e invalidación de herramientas.
- `useProductsBySupplierId` en `src/api/products.js`: query deshabilitada por defecto y en detalle; expone `loadProducts` e `invalidateProducts` estables.
- `loadSupplierProducts` utiliza `queryClient.fetchQuery` y el **loader existente** `listCatalogPages` de `src/api/catalogLists.js`, sin cambiarlo.
- Sustituido recorrido global `listItems` seguido de `product.id.startsWith(supplierId)`. Nueva consulta obtiene directamente datos filtrados por backend; no descarga colección global ni filtra asociaciones localmente.
- `runProductsTool` en detalle centraliza espera, bloqueo de doble click, spinner, ejecución y error.
- `BatchImportStock` prepara colección antes de abrir archivo. Conserva snapshot completo en ref para que parseo no dependa de un render posterior de React Query.
- `BatchImport` permite cancelar preparación devolviendo `false` y muestra spinner opcional. Otros consumidores conservan comportamiento por defecto.

## D–E. Requests y páginas

```http
GET /products?supplierId=VA&pageNumber=1&pageSize=500&count=true
GET /products?supplierId=VA&pageNumber=2&pageSize=500&count=false
GET /products?supplierId=VA&pageNumber=3&pageSize=500&count=false
```

Ejemplo `count="1200"`: adaptador central normaliza conteo; loader calcula `Math.ceil(1200 / 500)`, solicita exactamente tres páginas y devuelve 1200 productos. `count=500`: exactamente una página. `count=0`: una respuesta vacía y aviso local al intentar herramienta.

Todas las páginas llevan `supplierId`. Se mantienen controles existentes de identidad, duplicados, cantidad esperada, cambios de metadata, límite de páginas, cancelación y timeout. Sin LastEvaluatedKey ni loops abiertos.

## F. Cache

Key: `[LIST_PRODUCTS_QUERY_KEY, "supplier-tools", supplierId]`. React Query/memoria, `staleTime=5 minutos`, `retry=false`, `refetchOnWindowFocus=false` y observer deshabilitado en detalle.

`fetchQuery` reutiliza respuesta completa fresca y deduplica cargas concurrentes. Proveedores diferentes tienen keys diferentes. Cache vencida/invalidada se obtiene al próximo click, nunca automáticamente por montar detalle. Sin Dexie para obtener o cachear esta colección.

## G. Invalidación

- Cargar/descontar stock: `onSettled` marca únicamente cache de ese proveedor stale con `refetchType:"none"`, incluso ante fallo porque lotes previos podrían haberse aplicado. Próxima herramienta obtiene datos nuevos.
- Eliminación exitosa de lote: invalida cache del proveedor y refresca detalle para actualizar `hasProducts`; se elimina refetch inmediato del catálogo.
- Crear/editar/eliminar/recuperar/cambiar estado de producto e importaciones masivas ya invalidan prefijo `[LIST_PRODUCTS_QUERY_KEY]`. La nueva key participa de esa invalidación existente. No se agregan invalidaciones globales ni refetch global nuevo. APIs de stock y mutaciones de productos permanecen sin cambios.
- Plantilla, Excel y códigos no invalidan porque no modifican productos.

## H. Error y UX

Una ref bloquea doble ejecución incluso antes del siguiente render; `activeAction`/`isPreparing` muestran loading con botones existentes. Fallo de cualquier página rechaza carga completa: se detiene recorrido, toast existente muestra error y se libera bloqueo para reintentar. Herramienta no recibe datos parciales. Query no publica un array parcial como resultado válido; reintento empieza por página 1. Si stock no puede prepararse, no se abre selector de archivo.

Impresión espera actualización de `printProducts` mediante `onBeforeGetContent` antes de que react-to-print capture DOM. Opciones memoizadas evitan que su callback cambiante provoque actualizaciones repetidas de botonera.

## I. Invariantes verificadas

- Abrir/reload Proveedor: cero requests `/products` de herramientas.
- Todas las cargas de herramientas usan `supplierId`.
- Marca y Proveedor conservan `hasProducts`: true bloquea; false permite; ausente/null/inválido bloquea localmente. Cero requests products por validación de eliminación.
- `useProductCatalog` idéntico byte a byte a baseline de inicio: SHA-256 `4c6fe6e3ef2519bb4ba7121498e78db4bbbb3c09b200d77bf1ff38d4bf8d3f23`.
- Loader finito, adaptadores, filtros/count/paginación/hidratación, detalle Marca y crear/editar presupuesto: hashes iguales a baseline. `src/api/stock.js` también idéntico a baseline.

## J. Tests/lint

```powershell
node --test tests/unit/supplier-products.test.js tests/unit/catalog-pagination.test.js tests/unit/entity-has-products.test.js tests/unit/list-remote-filters.test.js tests/unit/stock-batching.test.js tests/unit/filter-persistence-hydration.test.js
node node_modules/next/dist/bin/next lint --file 'src/app/(private)/proveedores/[id]/page.client.jsx' --file src/api/products.js --file src/api/supplierProducts.js --file src/components/products/BatchImport/index.jsx --file src/components/products/BatchImportStock/index.jsx
```

**78/78 tests pasan; lint sin warnings/errors.** Cobertura incluye loader filtrado, 1200/500, 500/500, cache y concurrencia, aislamiento VA/RB, error página 2 sin cache parcial y reintento, invalidación dirigida y por prefijo, mount sin carga, herramientas, doble click, impresión con datos recién cargados y hasProducts. Regresiones focalizadas de filtros/count, persistencia/hidratación y lotes de stock pasan.

Smoke real de navegador con Next aislado 3107 y API simulada 3108:

```powershell
$env:SMOKE_FILTER='supplier-tools'
node tests/smoke/catalog-pagination.cjs
$env:SMOKE_FILTER='^(brand|supplier)-(admin|readonly|unused|missing-flag|null-flag)$'
node tests/smoke/catalog-pagination.cjs
# Casos agregados después de la primera corrida:
$env:SMOKE_FILTER='supplier-tools-stock'
node tests/smoke/catalog-pagination.cjs
```

**16 escenarios pasan**, sin errores `pageerror`:

- Diez casos de Marca/Proveedor: abrir/reload/lectura, hasProducts true/false/ausente/null; cero products. DELETE simulado sólo tras confirmación con false.
- Excel 1200 filas: tres requests filtradas; Stock reutiliza cache, importa producto de última página mediante POST simulado, invalida sin GET automático; siguiente Excel solicita tres páginas; códigos imprime 1200 imágenes y eliminación de lote confirma cantidad 1200 reutilizando cache. Total seis GET products.
- Una página: dos descargas Excel con 500 productos usan un GET.
- Sin count: un GET, error visible, herramienta reintentable.
- Fallo página 2 de Excel: dos GET, ningún archivo; reintento exitoso solicita páginas 1/2/3. Total cinco GET.
- Stock como primera herramienta: tres GET antes de abrir selector; Excel posterior reutiliza cache.
- Fallo página 2 de Stock: no abre archivo; reintento desde página 1 abre selector y permite Excel con cache. Total cinco GET.

Mock limita diez GET products por escenario y watchdog de treinta segundos. Browser bloquea orígenes externos. No se usó backend real ni suite E2E completa. Servidores/browser cerrados; cambio automático de tsconfig retirado.

`git diff --check`: sin errores. Diff global incluye trabajo local previo; los archivos untracked no figuran en `git diff --stat`.

## K. Git diff

La salida exacta de `git diff --stat` se incluye al final de este documento.

## L. Estado Git

Sin `git add`, commit ni push. Índice sin cambios staged; branch `590-test-staging`. Se preservan modificaciones locales anteriores.


```text
 src/api/brands.js                                  |  31 ++-
 src/api/budgets.js                                 |  67 +++----
 src/api/cashBalances.js                            |  24 +--
 src/api/common.js                                  |  61 ++----
 src/api/customers.js                               |  31 ++-
 src/api/expenses.js                                |  22 +--
 src/api/products.js                                |  68 +++----
 src/api/settings.js                                |   5 +-
 src/api/stock.js                                   |  11 +-
 src/api/suppliers.js                               |  33 +++-
 src/api/users.js                                   |  24 +--
 src/app/(private)/cajas/page.jsx                   |  14 +-
 src/app/(private)/clientes/page.jsx                |  22 ++-
 src/app/(private)/gastos/page.jsx                  |  14 +-
 src/app/(private)/historial-ventas/page.jsx        |  26 ++-
 src/app/(private)/marcas/[id]/page.client.jsx      |  54 ++---
 src/app/(private)/marcas/page.jsx                  |  14 +-
 src/app/(private)/productos/crear/page.jsx         |   8 +-
 src/app/(private)/productos/page.jsx               |  16 +-
 src/app/(private)/proveedores/[id]/page.client.jsx | 220 ++++++++++-----------
 src/app/(private)/proveedores/page.jsx             |  14 +-
 src/app/(private)/usuarios/page.jsx                |  14 +-
 src/app/(private)/ventas/[id]/borrador/page.jsx    |  18 +-
 src/app/(private)/ventas/crear/page.jsx            |  18 +-
 src/app/(private)/ventas/page.jsx                  |  18 +-
 src/common/components/table/Filters.jsx            |  10 +-
 src/common/components/table/Pagination.jsx         |  24 ++-
 src/common/components/table/Table.jsx              |  58 ++++--
 src/components/brands/BrandsPage/index.jsx         |  14 +-
 src/components/budgets/BudgetDeliveries/index.jsx  |  12 +-
 src/components/budgets/BudgetsPage/index.jsx       |  86 ++++----
 .../cashBalances/CashBalancesPage/index.jsx        |  15 +-
 src/components/customers/CustomersPage/index.jsx   |  16 +-
 src/components/expenses/ExpensesPage/index.jsx     |  20 +-
 src/components/layout/useListPageSideActions.jsx   |  13 +-
 src/components/products/BatchImport/index.jsx      |   5 +-
 .../products/BatchImportProducts/index.jsx         |   6 +-
 src/components/products/BatchImportStock/index.jsx |  35 +++-
 src/components/products/ProductsPage/index.jsx     |  19 +-
 src/components/settings/Entities/Budgets/index.jsx |   4 +-
 src/components/suppliers/SuppliersPage/index.jsx   |  14 +-
 src/components/users/UserPage/index.jsx            |  14 +-
 src/components/users/users.constants.js            |   2 +-
 src/hooks/useFilterParams.js                       |  25 ++-
 src/hooks/useFilters.js                            |  76 +++++--
 .../budget-deliveries-consume-response.test.js     |   2 +-
 .../budgets-history-hard-deleted-filter.test.js    |  19 +-
 tests/unit/stock-batching.test.js                  |  56 +++---
 48 files changed, 783 insertions(+), 609 deletions(-)
```
