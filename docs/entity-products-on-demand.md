> Registro histórico: la comprobación transitoria de eliminación fue retirada. Estado actual: [Marca/Proveedor con hasProducts](entity-has-products.md).

# Marca/Proveedor: comprobar productos sólo al intentar eliminar

Branch `590-test-staging`. Solución transitoria autorizada; sin contrato backend inventado ni pruebas contra backend real.

## Causa original

Marca: `marcas/[id]/page.client.jsx:54` (antes) montaba `useHasProductsByBrandId` por permiso de eliminación. Ese hook (`products.js:44–54`, antes) obtenía catálogo completo y evaluaba `products.some(({ id }) => id?.substring(2,4) === String(brandId))`. Resultado condicionaba botón Eliminar antes de que usuario lo tocara.

Proveedor: `proveedores/[id]/page.client.jsx:29` (antes) montaba `useProductsBySupplierId`; `products.js:145–148` descargaba catálogo completo y luego filtraba localmente `product.id.startsWith(supplierId)`. Efecto de breadcrumbs (`:65–68`, antes) además forzaba refetch. React Query puede deduplicarlo, por lo que no se afirma que siempre duplicase toda la carga. `hasAssociatedProducts = !!products?.length` condicionaba eliminación y herramientas.

Loader numérico era finito, pero descargar más de 20 páginas era posible según count. El problema puntual era originar esa carga por visualizar entidad. Sin relación encontrada con hidratación. Snapshot previo al primer cambio conservado en `C:/Users/Usuario/AppData/Local/Temp/callixto-association-baseline`.

## Comportamiento final

1. Abrir/reload Marca o Proveedor: 0 requests products por validación, ninguna comprobación de asociaciones.
2. Click Eliminar: abre modal e inicia `useProductAssociationCheck.check()` desde handler del usuario.
3. Hook compartido usa `useProductCatalog({ enabled:false })`; únicamente `check()` ejecuta `refetch({ throwOnError:true })`. No fetch durante render/mount ni effects de comprobación.
4. Catálogo usa loader numérico actual: página 1, tamaño 500, count=true; luego páginas 2..ceil(total/tamaño) con count=false. Datos se reúnen completamente antes de comprobar asociaciones. Sin nuevos loops ni infraestructura de cursor.
5. Marca comprueba posiciones 2..4 del ID; Proveedor comprueba prefijo. Si hay asociación, mensaje correspondiente y confirmación bloqueada.
6. Si no hay asociación, habilita confirmación habitual escribiendo `eliminar`; después ejecuta DELETE actual de entidad. No elimina automáticamente al terminar carga.
7. Count inválido, error HTTP/lógico o página fallida corta carga, muestra error y bloquea ese intento. Cancelar y volver a intentar permite nueva verificación; no se acepta data vieja de una consulta fallida.

Se reemplazó bloqueo permanente provisional. Handler de confirmar también exige `canDelete`, además de botón deshabilitado durante verificación. Llamadas concurrentes comparten comprobación; cancelar/cambiar entidad invalida resultados tardíos. Resultado verificado no pasa a otra entidad. DELETE conserva handling de `statusOk=false`, errores HTTP y navegación al listado al tener éxito.

Proveedor mantiene herramientas con carga deshabilitada al montar. Acción explícita **Cargar productos del proveedor** sirve para Excel/stock/códigos. Pre-check de eliminación obtiene catálogo general finito independientemente de esas herramientas. Eliminación de lote conserva confirmación y refresco tras acción explícita.

## Backend pendiente: propuestas, no contratos implementados

Usuario confirmó falta de contrato para `brandId`/`supplierId` y ausencia de evidencia de protección específica de DELETE. Asociación codificada en ID y filtros locales no prueban soporte de filtros remotos. `DELETE /products/supplier/{id}` conocido para lotes tampoco demuestra existencia de un GET equivalente. Helpers actuales de DELETE sólo acreditan manejo genérico de respuesta; no garantía de integridad.

Mejora A: filtros documentados que permitan existencia con una request mínima:

```text
GET /products?brandId=...&pageNumber=1&pageSize=1
GET /products?supplierId=...&pageNumber=1&pageSize=1
```

Mejora B, preferida: DELETE de Marca/Proveedor protege integridad y devuelve error específico cuando entidad está en uso.

**Ninguna opción se implementa ni se asume hasta tener contrato confirmado.** No se enviaron esos params. N requests al click son costo transitorio aceptado; comprobación frontend no sustituye protección backend ante cambios concurrentes.

## Requests verificadas

| Acción | Products | DELETE entidad |
| --- | --- | --- |
| Abrir/reload Marca o Proveedor | 0 | 0 |
| Click Eliminar, count=1200, pageSize=500 | 3, sólo tras click | 0 antes de confirmar |
| Asociación encontrada | mismas 3 finitas | 0; confirmación bloqueada |
| Sin asociación | mismas 3 finitas | 1 tras confirmación habitual |
| Count ausente | 1 y error | 0 |
| Página 2 falla | 2, sin página 3 | 0 |
| Cargar herramientas del proveedor | N finitas por acción explícita | 0 |
| Crear/editar presupuesto | N finitas habituales | sin cambios |

GET del detalle de Marca/Proveedor permanece; cero corresponde a products.

## Catálogo e hidratación intactos

Cuerpo de `useProductCatalog` idéntico byte por byte al baseline. Loader, listItems, adaptación count y SearchControlled de presupuestos conservados. `src/api/products.js` no cambia en esta adaptación; conserva ajustes anteriores de herramientas bajo demanda.

Hashes idénticos de useFilterParams, useFilters, Table, Pagination, listPagination, pagedLists, listCounts, crear presupuesto y editar borrador. Sin cambios de hydrated, persistencia page/pageSize/sorting ni solución SSR. Cambio automático de tsconfig durante Next aislado retirado.

## Validación

```powershell
node --test tests/unit/product-association-check.test.js tests/unit/catalog-pagination.test.js tests/unit/list-remote-filters.test.js
npx next lint --file src/hooks/useProductAssociationCheck.js --file 'src/app/(private)/marcas/[id]/page.client.jsx' --file 'src/app/(private)/proveedores/[id]/page.client.jsx'
node tests/smoke/catalog-pagination.cjs
git diff --check
```

43/43 unitarios pasan. Cinco tests nuevos cubren mount sin requests, asociación marca/proveedor, vacío, fallo sin reutilizar resultado previo, reintento exitoso, deduplicación, cancelación/resultado tardío y cambio de entidad. Archivo nuevo revalidado al final: 5/5. Lint sin warnings/errors; whitespace limpio.

Smoke 14/14 con API local simulada para SSR y browser. Marca/Proveedor: 0 products al abrir, 3 sólo tras Eliminar, bloqueo con asociación y reload sin nueva carga. Roles de lectura: 0. Otros dos casos usan 1200 productos de entidades distintas: habilitan confirmación y envían un DELETE simulado por entidad. Count ausente corta tras 1 request; fallo de página 2 corta tras 2, sin DELETE. Herramientas funcionan bajo demanda.

Crear y editar presupuesto encuentran producto de página 3; Entregas conserva catálogo. Productos listado consulta una página sin IndexedDB. Máximo 10 products por escenario, watchdog 30 segundos, sin sleeps largos ni backend real. Fake API sólo permite DELETE de las dos fixtures explícitas sin asociación; otras escrituras abortan. Browser y Next aislados cerrados. No suite E2E completa.

Captura: `C:/Users/Usuario/AppData/Local/Temp/callixto-finite-catalog-requests.json`. Next 3107, API simulada 3108; NEXT_PUBLIC_URL sólo apuntó al mock.

## Archivos y Git

Esta adaptación toca ambos detalles client, agrega `src/hooks/useProductAssociationCheck.js` y `tests/unit/product-association-check.test.js`, actualiza `tests/smoke/catalog-pagination.cjs` y este informe. Cambios locales anteriores conservados.

`git diff --stat`: 46 archivos tracked, 690 inserciones, 531 eliminaciones. Incluye trabajo anterior; untracked no aparecen en stat. Salida completa abajo.

Branch `590-test-staging`. Sin git add, commit ni push. Índice vacío; backend sin modificaciones.

```text
 src/api/brands.js                                  |  31 ++++--
 src/api/budgets.js                                 |  67 +++++-------
 src/api/cashBalances.js                            |  24 ++---
 src/api/common.js                                  |  61 ++++-------
 src/api/customers.js                               |  31 ++++--
 src/api/expenses.js                                |  22 ++--
 src/api/products.js                                |  59 ++++++-----
 src/api/settings.js                                |   5 +-
 src/api/stock.js                                   |  11 +-
 src/api/suppliers.js                               |  33 ++++--
 src/api/users.js                                   |  24 ++---
 src/app/(private)/cajas/page.jsx                   |  14 ++-
 src/app/(private)/clientes/page.jsx                |  22 +++-
 src/app/(private)/gastos/page.jsx                  |  14 ++-
 src/app/(private)/historial-ventas/page.jsx        |  26 +++--
 src/app/(private)/marcas/[id]/page.client.jsx      |  52 +++++-----
 src/app/(private)/marcas/page.jsx                  |  14 ++-
 src/app/(private)/productos/crear/page.jsx         |   8 +-
 src/app/(private)/productos/page.jsx               |  16 ++-
 src/app/(private)/proveedores/[id]/page.client.jsx | 114 +++++++++++----------
 src/app/(private)/proveedores/page.jsx             |  14 ++-
 src/app/(private)/usuarios/page.jsx                |  14 ++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    |  18 ++--
 src/app/(private)/ventas/crear/page.jsx            |  18 ++--
 src/app/(private)/ventas/page.jsx                  |  18 +++-
 src/common/components/table/Filters.jsx            |  10 +-
 src/common/components/table/Pagination.jsx         |  24 +++--
 src/common/components/table/Table.jsx              |  58 ++++++++---
 src/components/brands/BrandsPage/index.jsx         |  14 ++-
 src/components/budgets/BudgetDeliveries/index.jsx  |  12 ++-
 src/components/budgets/BudgetsPage/index.jsx       |  72 ++++---------
 .../cashBalances/CashBalancesPage/index.jsx        |  15 +--
 src/components/customers/CustomersPage/index.jsx   |  16 ++-
 src/components/expenses/ExpensesPage/index.jsx     |  20 ++--
 src/components/layout/useListPageSideActions.jsx   |  13 ++-
 .../products/BatchImportProducts/index.jsx         |   6 +-
 src/components/products/ProductsPage/index.jsx     |  19 ++--
 src/components/settings/Entities/Budgets/index.jsx |   4 +-
 src/components/suppliers/SuppliersPage/index.jsx   |  14 ++-
 src/components/users/UserPage/index.jsx            |  14 ++-
 src/components/users/users.constants.js            |   2 +-
 src/hooks/useFilterParams.js                       |  25 +++--
 src/hooks/useFilters.js                            |  76 ++++++++++----
 .../budget-deliveries-consume-response.test.js     |   2 +-
 .../budgets-history-hard-deleted-filter.test.js    |  19 +---
 tests/unit/stock-batching.test.js                  |  56 ++++++----
 46 files changed, 690 insertions(+), 531 deletions(-)
```
