# Marca/Proveedor: hasProducts como fuente de eliminación

Branch `590-test-staging`. Contrato confirmado por usuario: detalle de Marca y Proveedor incluye `hasProducts: boolean`. Backend sin modificaciones; validación con mocks.

## A. Lógica transitoria eliminada

Retirados `useProductAssociationCheck`, imports de ambas páginas y test de esa solución. Desaparecen query de catálogo para validación, refetch al click, recorridos de IDs por marca/proveedor, estados checking/clear/associated/error, deduplicación/cancelación/reintento y mensajes de errores de carga específicos de pre-check. Búsqueda de referencias al hook y `association.` en `src` y `tests`: cero coincidencias.

No se modifica catálogo global ni loader finito. Proveedor conserva su colección para herramientas explícitas; no participa en decisión de eliminar entidad.

## B. Archivos de esta corrección

- `src/app/(private)/marcas/[id]/page.client.jsx`
- `src/app/(private)/proveedores/[id]/page.client.jsx`
- `src/hooks/useProductAssociationCheck.js` (eliminado; era untracked)
- `tests/unit/product-association-check.test.js` (eliminado; era untracked)
- `tests/unit/entity-has-products.test.js` (nuevo)
- `tests/smoke/catalog-pagination.cjs`
- `docs/entity-has-products.md` (nuevo)
- `docs/entity-products-on-demand.md` (nota de reemplazo histórico)
- `docs/finite-product-catalog.md` (nota actualizada)

Cambios locales anteriores conservados.

## C–D. Uso de hasProducts

Marca calcula `canDeleteBrand = brand?.hasProducts === false`; Proveedor calcula `canDeleteSupplier = supplier?.hasProducts === false`.

`true`: botón Eliminar deshabilitado, tooltip/mensaje existente de productos asociados. `false`: botón habilitado según permisos/ocupación existentes; modal de confirmación normal y DELETE actual. Handler de click y confirmación también respetan el mismo flag, sin segunda consulta. Si entidad cambia mientras modal está abierto, confirmar sigue bloqueado al dejar de tener false.

La entidad de detalle ya llega completa desde `getEntityById`; no requiere modificar API, projections, listados ni filtros.

## E. Botonera y valor ausente

Restaurado bloqueo anticipado del botón Eliminar con mensaje de asociación usando **únicamente flag backend**, tanto tooltip normal como lateral colapsado. Retirado estado temporal de comprobación que afectaba acciones/modal. Activar/desactivar no espera comprobación de productos.

Stock, Excel, carga explícita, códigos y eliminación de lote del Proveedor conservan lógica/datos/requests previos. Variable local `hasAssociatedProducts` restante sólo decide herramientas que necesitan colección cargada; no decide eliminación del Proveedor. Test cambia flag entre true/false/undefined y confirma que descriptores de otras acciones permanecen iguales. Test de DELETE con flag false y colección de herramientas no vacía demuestra independencia de esa colección.

Campo faltante: no hay política global suficiente en detalles para interpretar ausencia como false; por ejemplo, Cliente usa truthiness de `hasBudgets`. Para estas dos vistas se elige permiso explícito: **sólo boolean false permite eliminar**. undefined, null, strings y números bloquean localmente con tooltip y aviso visible “Información de productos asociados no disponible”. No se consulta catálogo, Dexie ni endpoint alternativo. Otras acciones siguen disponibles según reglas propias.

## F. Requests

| Acción | GET products por validación | DELETE entidad |
| --- | --- | --- |
| Abrir/reload Marca | 0 | 0 |
| Abrir/reload Proveedor | 0 | 0 |
| Eliminar con hasProducts=true | 0 | 0; botón bloqueado |
| Eliminar con hasProducts=false | 0 | 1 tras confirmación normal |
| hasProducts ausente/null/inválido | 0 | 0; aviso local |

Requests normales del GET de detalle permanecen. Carga explícita de herramientas del Proveedor puede obtener productos, como antes; ninguna se origina por comprobación de eliminación.

## G. Presupuestos e infraestructura intactos

Hashes comparados contra baseline de inicio de esta tarea: `src/api/products.js`, `catalogLists.js`, `common.js`, `listPagination.js`, `pagedLists.js`, `listCounts.js`, `listFilters.js`, `useFilters.js`, `useFilterParams.js`, Table, Pagination, crear presupuesto y editar borrador: idénticos. Por tanto useProductCatalog, loader finito, SearchControlled, paginación/filtros/count e hidratación permanecen intactos.

## H. Tests y lint

```powershell
node --test tests/unit/entity-has-products.test.js tests/unit/catalog-pagination.test.js tests/unit/list-remote-filters.test.js
npx next lint --file 'src/app/(private)/marcas/[id]/page.client.jsx' --file 'src/app/(private)/proveedores/[id]/page.client.jsx'
node tests/smoke/catalog-pagination.cjs
git diff --check
```

47/47 unitarios pasan. Nueve nuevos tests ejecutan componentes reales con hooks/servicios aislados: true bloquea, false permite modal/DELETE, ausencia/null/no boolean bloquea sin fallback, cambio de flag durante confirmación mantiene guard, otras acciones del Proveedor independientes del flag. Resto cubre catálogo finito y regresiones de listados/filtros/count.

Lint sin warnings/errors; whitespace limpio. Smoke **16/16** pasa con backend local simulado para SSR y browser:

- Marca y Proveedor con true, false, campo ausente y null: 0 products, incluso intento de click en acción bloqueada.
- False: un DELETE simulado por entidad después de confirmación; backend mock aborta inmediatamente si validación intenta GET products.
- Abrir/reload con true y roles de lectura: 0 products.
- Herramientas Proveedor: carga explícita funciona; error de carga sigue manejado; botón de eliminar sigue dependiendo del flag.
- Crear, editar borrador y Entregas: tres páginas finitas para 1200 productos; selectores encuentran producto de página 3. Listado products mantiene una página y cero operaciones IndexedDB.

Límite 10 requests por escenario y watchdog 30 segundos. Primer intento cortó por compilación inicial de Next antes de requests API; siguiente ejecución completa pasó. Sin sleeps largos ni suite E2E completa. Ninguna prueba tocó backend real. Browser y servidor aislado cerrados. Adición automática de Next a tsconfig retirada; archivo sin cambios.

Captura: `C:/Users/Usuario/AppData/Local/Temp/callixto-finite-catalog-requests.json`. Next 3107, API simulada 3108.

## I. Git diff

`git diff --stat`: **46 archivos tracked, 714 inserciones, 526 eliminaciones**. Incluye cambios locales anteriores; untracked no aparecen en stat. Salida completa abajo.

## J. Git

Sin git add, commit ni push. Índice vacío; branch `590-test-staging`. Backend sin modificaciones.

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
 src/app/(private)/marcas/[id]/page.client.jsx      |  54 ++++++----
 src/app/(private)/marcas/page.jsx                  |  14 ++-
 src/app/(private)/productos/crear/page.jsx         |   8 +-
 src/app/(private)/productos/page.jsx               |  16 ++-
 src/app/(private)/proveedores/[id]/page.client.jsx | 117 ++++++++++++---------
 src/app/(private)/proveedores/page.jsx             |  14 ++-
 src/app/(private)/usuarios/page.jsx                |  14 ++-
 src/app/(private)/ventas/[id]/borrador/page.jsx    |  18 ++--
 src/app/(private)/ventas/crear/page.jsx            |  18 ++--
 src/app/(private)/ventas/page.jsx                  |  18 +++-
 src/common/components/table/Filters.jsx            |  10 +-
 src/common/components/table/Pagination.jsx         |  24 +++--
 src/common/components/table/Table.jsx              |  58 +++++++---
 src/components/brands/BrandsPage/index.jsx         |  14 ++-
 src/components/budgets/BudgetDeliveries/index.jsx  |  12 ++-
 src/components/budgets/BudgetsPage/index.jsx       |  86 ++++++---------
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
 src/hooks/useFilters.js                            |  76 +++++++++----
 .../budget-deliveries-consume-response.test.js     |   2 +-
 .../budgets-history-hard-deleted-filter.test.js    |  19 +---
 tests/unit/stock-batching.test.js                  |  56 ++++++----
 46 files changed, 714 insertions(+), 526 deletions(-)
```
