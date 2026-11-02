# Legacy de la migración PostgreSQL

Registro único de piezas revisadas durante la migración. PR actual: **PR7 — Usuarios + Cajas, BLOQUEADA POR BACKEND** según pruebas reales del 02/11/2026. Historial, Usuarios y Cajas conservan sus consumidores legacy; no se implementa migración parcial.

- Con consumidores runtime: conservar y actualizar consumidores, motivo y PR prevista.
- Al retirar el último consumidor: buscar globalmente, eliminar código/imports/tests/comentarios huérfanos y marcar **ELIMINADO** en la misma PR.
- Definiciones, reexports, tests y este documento no cuentan como consumidores runtime.
- La PR prevista indica responsabilidad probable; no asigna números a PR futuras todavía no confirmadas.
- Un listado remoto no sustituye un catálogo completo ni convierte automáticamente sus consumidores.

| Legacy | Consumidores actuales | Motivo de conservación | PR prevista | Estado |
|---|---|---|---|---|
| `src/api/customers.js` — `useListCustomers`: catálogo legacy de Clientes. | 0: crear presupuesto, borrador y Configuración/Presupuestos usan `useCustomerCatalog`. | Eliminados hook, dependencia `listItems`/cursor y escrituras Dexie de Clientes. El nuevo catálogo completo numérico es transitorio, registrado debajo. | PR5 — retirado. | ELIMINADO |
| `src/api/suppliers.js` — carga legacy `listItems`/Dexie de `useListSuppliers`. | 0 consumidores de esa implementación; crear Producto conserva el hook, ahora con paginación numérica completa. | Eliminada dependencia del cursor y cache local; no se sustituyó catálogo por página 1. | PR4 — retirado. | ELIMINADO |
| `src/api/brands.js` — carga legacy `listItems`/Dexie de `useListBrands`. | 0 consumidores de esa implementación; crear Producto conserva el hook numérico completo. | Mismo contrato de colección para selector; publicación sólo tras validar todas las páginas. | PR4 — retirado. | ELIMINADO |
| `src/api/products.js` — `useListProducts` y sus keys/carga de listado local. | 0. Crear/borrador de Ventas, `BudgetDeliveries` e importaciones pasan a `useProductCatalog`; listado usa `usePagedProducts`. | Retirados hook, keys `LIST_PRODUCTS_QUERY_KEY` / `LIST_PRODUCTS_BY_SUPPLIER_QUERY_KEY`, parámetro de invalidación batch sin consumidores e imports asociados. `LIST_ATTRIBUTES` de Productos se conserva: `BudgetForm` deriva de ella los atributos del producto que guarda el presupuesto, excluyendo `stockControl`. | PR4 — retirado sólo listado legacy; contrato compartido de atributos conservado. | ELIMINADO |
| `src/api/products.js` — `useHasProductsByBrandId`: asociación descargando catálogo global. | 0. Detalle Marca usa exclusivamente `hasProducts` booleano backend. | Eliminado hook y loading dependiente del catálogo; flag ausente/inválido bloquea eliminación, sin fallback. | PR4 — retirado. | ELIMINADO |
| `src/api/products.js` — `useProductsBySupplierId`: catálogo global y filtro por prefijo. | 0. Detalle Proveedor usa `hasProducts`; herramientas cargan `/products?supplierId=...` bajo demanda. | Retirados hook, filtro local y refetch al montar. No existe hook `useHasProductsBySupplierId` ni botón manual de precarga en esta base. | PR4 — retirado. | ELIMINADO |
| `src/api/users.js` — `useListUsers`: listado/catálogo legacy de Usuarios. | `/usuarios`; selector de vendedores de `/historial-ventas`. `/ventas` mantiene input temporal y no consulta este hook. | Prueba real 02/11/2026: GET /users ignora paginación numérica, filtros probados y sorts username/id/lastName. Página 2 repite la colección completa de página 1, incluso con pageSize=1. Conservar flujo legacy; no compensar con paginación local. | PR7 — BLOQUEADA POR BACKEND hasta disponer del contrato remoto necesario. | PENDIENTE |
| `src/api/cashBalances.js` — `useListCashBalances`: listado legacy de Cajas. | `/cajas`. | Prueba real 02/11/2026: pageSize, count, filtro id y dirección por id funcionan, pero pageNumber no avanza; estado y métodos no filtran. Conservar flujo legacy sin migración parcial, híbrido cursor/pageNumber ni paginación local compensatoria. | PR7 — BLOQUEADA POR BACKEND hasta disponer del contrato remoto necesario. | PENDIENTE |
| `src/api/common.js` — `entityList` / `LastEvaluatedKey`. | `listItems`; `useListBudgetsHistory` en `src/api/budgets.js`. | Historial continúa por decisión de alcance; Usuarios y Cajas todavía usan cursor indirectamente. Ventas, Gastos y catálogo Clientes ya no lo usan. | Retiro de Historial después de las 7 PR + migración de entidades restantes. | PENDIENTE |
| `src/api/common.js` — `listItems`: sincronización incremental y lectura Dexie. | APIs `users`, `cashBalances`. | Dos consumidores runtime restantes tras migrar Gastos; conservar hasta migrarlos. | PR7 y cierre posterior; distribución a definir. | PENDIENTE |
| `src/api/common.js` — `activeVersion`, `LAST_UPDATED_AT`, `hardReset`, `startDate`/`updatedAt` de sincronización. | `listItems`; `src/hooks/useRestoreEntity.js` usa `LAST_UPDATED_AT` para restauración. | Determinan actualización incremental y reinicio de cache de consumidores legacy. Las pantallas remotas no los usan como fuente visual. | Retirada de sincronización Dexie tras últimos catálogos/listados. | PENDIENTE |
| `src/db.js` — tablas Dexie restantes y helpers de lectura/escritura/borrado. | Usuarios, Cajas; mutaciones de Budgets y bindings de restauración de `BudgetsPage`/`Filters` legacy. `lastUpdatedAt` mantiene sincronización/restauración. | Customers retirado por versión 3; Expenses por versión 4. Mutaciones de ambos omiten escrituras locales. Budgets conserva acoplamiento legacy de restauración/CRUD; ya no es fuente visual de Ventas. No se refactorizó Historial. | Últimos consumidores locales; revisar Budgets al retirar Historial. | PENDIENTE |
| `src/common/utils/index.js` — `getDefaultListParams`: proyección `attributes`. | APIs `users`, `cashBalances`. | Conserva dos consumidores. Proyecciones legacy de Budgets/Customers retiradas en PR5 y Expenses en PR6. | Migración de entidades restantes. | PENDIENTE |
| `src/components/customers/customers.constants.js` — `LIST_CUSTOMERS_QUERY_KEY` y `LIST_ATTRIBUTES`. | 0. Catálogo nuevo usa `CUSTOMER_CATALOG_QUERY_KEY`; mutaciones ya no proyectan/escriben Dexie. | Eliminados exports/imports antiguos tras búsqueda global. Contrato de atributos de Productos usado por `BudgetForm` se conserva. | PR5 — retirado. | ELIMINADO |
| `src/hooks/useFilters.js` — formulario y filtros locales. | `BudgetsPage` sólo para Historial; `ProductStock`, `UserPage`, `CashBalancesPage`, `CashBalanceMovements`. | Ventas y Gastos usan `useServerListFilters`. Consumidores legacy/embebidos siguen activos. | Entidades restantes + retiro de Historial después de las 7 PR. | PENDIENTE |
| `src/hooks/useFilterParams.js` — preferencias locales. | `useFilters`; `historial-ventas/page.jsx`. | Sigue activo en consumidores no migrados. Historial no se modifica en PR5. | Entidades restantes + retiro posterior de Historial. | PENDIENTE |
| `src/hooks/useRestoreEntity.js` — restauración de cache/fecha local. | `Filters.jsx`, `useListPageSideActions.jsx`, `BudgetsPage` legacy utilizado por Historial. | Ventas nuevas no activa ramas de restore; bindings legacy y otras entidades continúan. | Listados restantes y retiro posterior de Historial. | PENDIENTE |
| `Filters.jsx` y `useListPageSideActions.jsx` — actualización/export de colección filtrada local. | Historial a través de `BudgetsPage`; listados Usuarios y Cajas. El registro de acciones también sirve a páginas remotas. | Ventas y Gastos sólo registran acciones explícitas: sin export de página ni restore local. | Entidades restantes y retiro posterior de Historial. | PENDIENTE |
| `src/common/components/table/Table.jsx` — modo local (`filter`/`sort`/`slice`, `header.sortValue`). | Listados aún locales y tablas embebidas de contactos, movimientos y detalles de caja. | No todo modo local es deuda: formularios/tablas embebidas tienen usos legítimos aunque se migren todos los listados. Su retirada global requiere distinguir consumidores. | Cierre de listados: decidir qué bindings retirar conservando tablas locales legítimas. | NECESITA DECISIÓN |
| Bindings legacy de `/clientes`: `useListCustomers` en `src/app/(private)/clientes/page.jsx`; `useFilters`, `createFilter`, callbacks de colección local en `CustomersPage/index.jsx`. | 0 en el listado visual; catálogo compartido y hook local general continúan en filas anteriores. | Eliminados por PR3; pantalla y export ahora usan paginación numérica y filtros applied. | PR3 — retirado. | ELIMINADO |
| Bindings legacy de `/proveedores`: `useListSuppliers` en `src/app/(private)/proveedores/page.jsx`; `useFilters`, `createFilter`, callbacks de colección local en `SuppliersPage/index.jsx`. | 0 en el listado visual; catálogo compartido numérico continúa; asociación y detalle se migraron en PR4. | Eliminados por PR3; pantalla y export ya no recorren cursor. | PR3 — retirado. | ELIMINADO |
| Callbacks `sortValue` de `HEADERS` (Clientes), `SUPPLIERS_COLUMNS` y `BRAND_COLUMNS`, en sus archivos `*.constants.js`. | 0 invocaciones runtime: cada colección de columnas sólo se pasa a su listado con `serverPagination`. | Búsqueda global de referencias/imports y revisión de consumidores confirmó uso exclusivamente remoto. Retirados 8 callbacks; celdas y mapping de sort backend conservados. Incluye residuo de PR2 en Marcas. | PR3 — retirado. | ELIMINADO |
| `src/common/components/table/Filters.jsx` — mappings de restauración para Clientes, Proveedores y Marcas, con imports asociados. | 0: sus tres pantallas remotas usan `Filters` sin `entity`/`onRefetch`; restantes llamadas usan otras entidades o `STOCK`. | Retirados mappings/imports sin consumidor. Las constantes de queries completas siguen existiendo donde tienen consumidores reales. Incluye residuo de PR2. | PR3 — retirado. | ELIMINADO |
| `src/components/layout/OptionsHeader.jsx` — `OptionsDropdown`: antiguo menú de restauración Dexie. | 0 imports, reexports o referencias runtime. | Búsqueda global sólo encontró definición/export del propio archivo; sin tests/imports huérfanos adicionales. Archivo eliminado. | PR3 — retirado. | ELIMINADO |
| `src/db.js` — `bulkAddStorageItems`: wrapper de `bulkAdd`. | 0 llamadas, imports o reexports. | Búsqueda global sólo encontró declaración. Eliminado; se conserva `bulkPutStorageItems`, usado por `listItems`. | PR3 — retirado. | ELIMINADO |
| Bindings locales de `/productos`: `useFilters`, `createFilter`, copia `tableProducts`, export de página y mapping de restore en `Filters.jsx`. | 0. | Tabla recibe página backend sin filter/sort/slice; filtros draft no disparan GET. Removidos imports y handlers asociados. `PRODUCT_COLUMNS.sortValue` continúa usado por recuperación/selección local en modales: no es huérfano. | PR4 — retirado. | ELIMINADO |
| Tablas/escrituras Dexie de Productos, Marcas, Proveedores y Settings; borrado directo por prefijo de proveedor. | 0 lectores o escritores runtime nuevos de esas tablas. | Upgrade Dexie versión 2 elimina las cuatro tablas (`null`). Definiciones de versión 1 se conservan exclusivamente como historial necesario de migración, no como tablas activas. Mutaciones de esas entidades omiten escrituras locales. | PR4 — retirado. | ELIMINADO |
| `LIST_ATTRIBUTES` de Marcas/Proveedores y escritura proyectada asociada. | 0. | Eliminadas definiciones/imports; catálogos completos HTTP ya no necesitan proyección para Dexie. | PR4 — retirado. | ELIMINADO |
| Settings: `listItems`, restauración Dexie y refs de esa restauración en Configuración. | 0. | Una GET directa devuelve `settings`; sin contrato count/cursor. Refetch vuelve a ejecutar esa misma GET. | PR4 — retirado. | ELIMINADO |
| `removeStorageItemById` en `src/db.js` y rama `successfulDeletes` / `deleteCondition` de `useBatchDeleteItem`. | 0 consumidores después de retirar almacenamiento local de Productos; único llamador del batch helper era `useBatchDeleteProducts`. | Eliminados helper vacío, colección intermedia, condición, imports y parámetros de cache sin consumidores. Se conserva helper de DELETE por ID, recorrido y conteo de respuestas. | PR4 — retirado. | ELIMINADO |
| `src/api/budgets.js` — `useListBudgets` y proyección `budgets.constants.LIST_ATTRIBUTES` del listado completo. | 0. `/ventas` usa `usePagedBudgets`. | Eliminados hook, carga visual por cursor/Dexie y proyección sin otros consumidores. `LIST_BUDGETS_QUERY_KEY` permanece sólo en bindings de restauración del componente legacy. | PR5 — retirado listado normal. | ELIMINADO |
| `src/components/budgets/BudgetsPage` — filtros/sort/export locales y restauración Budgets. | `/historial-ventas` continúa usando componente y exportador legacy. | Se conserva intacto: no migrar ni refactorizar Historial en PR5. Tabla Budgets y key antigua mantienen estos bindings y sus mutaciones; no se declara ausencia de consumidores. Con PostgreSQL/server-side no hace falta una pantalla separada sólo para períodos históricos. | Después de las 7 PR: incorporar rango de fechas en `/ventas` según UX común y eliminar Historial cuando esté disponible. | PENDIENTE |
| `useCustomerCatalog` — colección completa TRANSITORIA. | Crear presupuesto, editar borrador, Configuración → Presupuestos → cliente por defecto. | Catálogo numérico completo, publicación atómica y cache React Query; requerido para conservar selectores actuales sin cursor. No usa Dexie. Solución actual aceptada y transitoria. | Patrón común de búsquedas/selectores remotos después de las 7 PR; parámetros aún por definir. | PENDIENTE |
| `useProductCatalog` — colección completa TRANSITORIA. | Ventas crear/borrador, entregas e importaciones identificadas en evidencia PR4. | Catálogo completo actual conservado; solución transitoria, no patrón final para selectores de colecciones grandes. | Búsqueda/selector remoto de Productos dentro del patrón común posterior a las 7 PR; revisar consumidores antes de retirar el catálogo. | PENDIENTE |
| Catálogos completos de Marcas/Proveedores en Productos. | Crear Producto → selectores de Marca y Proveedor. | Mantienen selectores actuales; evaluar estos casos junto con las demás colecciones grandes, sin rediseñarlos en PR5. | Patrón común de búsquedas/selectores remotos después de las 7 PR. | PENDIENTE |
| Catálogo de vendedores de Ventas. | `/ventas` no consulta `useListUsers`; filtro funcional `createdBy` mediante input de nombre completo temporalmente. Historial y `/usuarios` conservan `useListUsers` legacy. | Prueba real 02/11/2026: GET /users devuelve colecciones pequeñas completas, pero no ofrece paginación numérica confiable. Shape id/username/firstName/lastName/state/role confirmado; identidad de createdBy conservada como firstName + espacio + lastName. No crear catálogo basado en pocos usuarios actuales; inclusión de INACTIVE no comprobada. | Pendiente backend: paginación real, política ACTIVE/INACTIVE y filtros/identidad. Input temporal aceptado hasta resolver patrón global de búsquedas/selectores posterior a las 7 PR; no bloquea PR5. | PENDIENTE |
| Exports server-side, incluidos Ventas y Gastos, con snapshots históricos. | `/ventas` y `/gastos` muestran acción deshabilitada; exportador legacy sigue sólo en Historial y otros flujos conservan sus implementaciones actuales. | Pendiente transversal: colección filtrada completa, paginación server-side, snapshots históricos y comportamiento consistente entre entidades. No exportar sólo página visible ni reconstruir snapshots desde catálogo actual. | Resolver transversalmente después de las 7 PR; definir contratos/estrategia de export entonces. | PENDIENTE |
| `paymentStatus` remoto. | Ventas envía PAID/PENDING sólo con state=CONFIRMED. | **PENDIENTE BACKEND**. Mapping frontend confirmado: Pagados → PAID, Pendientes → PENDING. Según prueba real reportada por usuario, backend devuelve el mismo dataset para ambos. Sin compensación local. | Corrección backend y posterior validación; no implementar workaround frontend. | PENDIENTE |
| `skipStorageUpdate` en helpers CRUD compartidos. | Entidades sin tabla local, pagos/stock y mutaciones de Clientes y Gastos; otras entidades aún escriben Dexie. | Distingue escritores locales de mutaciones remotas. No puede retirarse globalmente mientras Usuarios/Cajas y bindings legacy conserven almacenamiento. | Cierre del último escritor local, no esta PR. | PENDIENTE |
| Gastos: `useListExpenses`, `LIST_EXPENSES_QUERY_KEY`, `LIST_ATTRIBUTES` y carga visual por cursor/Dexie. | 0: `/gastos` usa `usePagedExpenses`. | Búsqueda global confirmó último consumidor migrado. Eliminados loader, key, proyección y dependencias de sincronización del listado. | PR6 — retirado. | ELIMINADO |
| Gastos: tabla/escrituras Dexie, restore mapping, filtros/sort/paginación/export locales del listado. | 0. Crear/clonar, editar y anular usan skipStorageUpdate; listado recibe página backend. | Upgrade Dexie versión 4 retira expenses; versión 1 queda como historial de migración. Retirados createFilter, useFilters, callbacks sortValue y bindings locales, incluido mapping/import de Filters.jsx. Constantes de negocio y ExpenseForm conservados. | PR6 — retirado. | ELIMINADO |
| Filtro Categorías de `/gastos`. | Control visible deshabilitado; categorías del formulario múltiple y Settings siguen activos. | **PENDIENTE BACKEND**: categories=string no filtró en control negativo real; no había categorías para prueba positiva. No enviar categories ni filtrar una página localmente. | Confirmar key/serialización para UN nombre contenido en expense.categories y reactivar con mapping local pequeño. | PENDIENTE |
| Sorts de Gastos fuera de ID. | Nombre/Monto/Pagado/Pendiente/Categorías no ofrecen sort remoto. | name/amount indeterminados por dataset correlacionado con ID; paidAmount no funcional; pendingAmount calculado sin contrato; categories es colección. Sin compensación local. | Evidencia backend específica antes de ampliar whitelist; no bloquea PR6. | PENDIENTE |

## Evidencia histórica de revisión en PR4 (previa a PR5)

- Corrección de compatibilidad: la limpieza inicial eliminó por error el export `LIST_ATTRIBUTES` de Productos aunque `BudgetForm/index.jsx` lo seguía importando. Restaurado array original compartido; no era una constante sin consumidores. Se conserva contrato de Presupuestos sin recuperar consultas legacy ni escrituras Dexie.
- `rg` global en `src/`: sin usos de hooks/keys/proyecciones retirados; comentarios históricos/tests/documentación no cuentan como consumidores.
- `listItems` sigue en Clientes, Ventas, Gastos, Usuarios y Cajas. `entityList` además sirve al Historial. No se eliminaron ni alteraron estos helpers compartidos.
- Auditoría de bloqueo Clientes: `entityList` copia `response.LastEvaluatedKey`, lo serializa con `JSON.stringify` en la siguiente GET y repite mientras sea truthy; sin límite numérico ni detección de cursor repetido. `retry: false` en `useListCustomers` no corta ese recorrido interno. Hook, parámetros, helpers y consumidor de Configuración coinciden con `origin/staging`; crear/borrador sólo cambiaron hook de Productos en PR4. `useProductCatalog` consulta exclusivamente `/products` con páginas numéricas y no dispara `/customers`. Bloqueo reportado corresponde al mecanismo legacy preexistente; no se ejecutó una reproducción independiente sobre staging ni se modificó runtime para resolverlo.
- No hay consultas de asociación ni refetch de productos en efectos de montaje de Marca/Proveedor. `hasProducts === true` habilita herramientas; `=== false` habilita eliminación. Resto bloqueado. No hay fallback de productos.
- Consumidores de catálogo global: `ventas/crear/page.jsx`, `ventas/[id]/borrador/page.jsx`, `BudgetDeliveries/index.jsx` y `BatchImportProducts/index.jsx`. Los tres primeros sólo cambian import/nombre del hook; no migran Ventas. Importador consulta exclusivamente al pulsar su acción.
- Catálogo y export reutilizan `fetchAllListPages`: primera página `count=true`, restantes `false`, tamaño 500, total normalizado con `Number`, fin calculado numéricamente e igualdad final entre cantidad y total. Un error corta y no publica parcial. `LastEvaluatedKey` de compatibilidad se ignora.
- Marcas/Proveedores completos sólo sirven a crear Producto. Usan la misma carga finita numérica, conservando forma `{ brands }` / `{ suppliers }`.
- Supplier tools: códigos, Excel, carga/descuento stock y confirmación de borrado masivo cargan sólo proveedor actual. Plantilla y activar/desactivar no consultan productos. Stock/Excel padre permite acceder a plantilla aunque no haya productos; cada herramienta dependiente lleva disabled propio y sin handler activo.
- Primera request de proveedor: `/products?supplierId=VA&pageNumber=1&pageSize=500&count=true`; páginas 2..N con `count=false`. Cache React Query `["supplierProducts", supplierId]`, staleTime 5 minutos. No Dexie ni catálogo global para herramientas.
- Crear/editar/eliminar/recuperar/cambiar estado/lotes de productos invalidan catálogo y listado remoto. Invalidación por proveedor deriva del ID con helper existente; borrado por proveedor y stock de proveedor usan supplierId explícito. Stock individual y consumo derivan proveedor desde productId. Sin identidad conocida se marca stale cache de proveedores, sin refetch global.
- Invalidación cancela cargas pendientes antes de marcar stale. Catálogos completos/proveedor usan `refetchType: "none"`; sólo listado paginado activo se refresca/recuenta. Batch de stock invalida también ante fallo posterior a escrituras previas; lotes de productos esperan que terminen requests pendientes antes de invalidar. Chunking, payloads y límites 500 / 250 / 500 conservados.
- Sort remoto Productos: `id`, `name`. `stock`/`price` no se ofrecen como sort remoto; sus callbacks se conservan para tablas locales de selección/recuperación. Export usa filtros applied y orden, no draft ni página visible.
- Sin nueva infraestructura cursor/Dexie. Los únicos consumidores auxiliares conservados tienen usos runtime identificados arriba.

## Validación y alcance PR5

- Base inicial limpia: branch `596-ventas-historial`, HEAD = origin/staging `b95c371c`, 0/0. PR1–PR4 presentes.
- `/ventas` reutiliza `pagedLists`, `useServerListFilters` y `Table.serverPagination`. No se copió infraestructura experimental. `getBudgetListState` traduce customer → customerName y adapta order a booleano exclusivamente para Budgets, también antes de refresh para conservar la misma query key.
- Sort final confirmado por pruebas manuales contra backend real informadas por usuario: ID → sort=id y Fecha → sort=createdAt funcionan. Reemplaza evidencia experimental previa y pendiente de revalidación de Fecha. Cliente deshabilitado por contrato no confirmado; Total deshabilitado porque backend no ordenó correctamente en prueba. Pagado, Pendiente y Vendedor siguen deshabilitados. ASC → order=true, DESC → order=false continúa local a Budgets; infraestructura global intacta y sin sort local compensatorio.
- Consulta Budgets espera Settings real exitoso, sin placeholder y sin fetch pendiente. Rango se calcula una vez por valor de meses resuelto; no GET previa con fallback de 3 meses. Defaults sólo se aplican después de resolver respuesta real si falta valor configurado.
- Draft no cambia request. Buscar/Enter aplica página 1/recount; página siguiente usa count=false con total conocido. Fechas forman parte de identidad del dataset. No se agrega datepicker ni se elimina Historial.
- Catálogo Clientes: primera GET pageNumber=1/pageSize=500/count=true, siguientes 2..N con count=false; helper numérico existente valida total y cantidad final antes de publicar. Fallo intermedio propaga error y permite reintento. Cache de catálogo se cancela/invalida junto con listado Clientes al mutar; todas las mutaciones omiten Dexie Customers.
- Historial, su filtro HARD_DELETED y función `useListBudgetsHistory` permanecen intactos. No se filtran filas HARD_DELETED después de recibir página remota de Ventas. Estado de datos/backend sigue sin afirmarse resuelto.
- Producto/catálogos PR4 y batching 500/250/500 intactos. Sólo se ajusta invalidación de página Ventas tras consumo de stock; no se toca algoritmo de batching.
- Búsqueda global posterior: sin consumidores runtime de useListCustomers/useListBudgets ni sus proyecciones eliminadas. getBudgetColumns conserva callbacks sortValue porque Historial todavía los ejecuta localmente. LIST_ATTRIBUTES de Productos sigue en BudgetForm y no se elimina.

## Pendientes funcionales al cierre de PR5

Registro de decisiones y pendientes, sin diseño ni implementación en PR5. Las pruebas manuales mencionadas aquí fueron informadas por el usuario.

### 1. Búsquedas/selectores remotos — PENDIENTE POSTERIOR A LAS 7 PR

Unificar búsquedas/selectores de colecciones grandes mediante un patrón común. Casos a contemplar:

- Ventas crear → Clientes.
- Ventas crear → Productos.
- Configuración / Presupuestos → Cliente por defecto.
- Productos → Marcas.
- Productos → Proveedores.
- Ventas listado → Vendedores.

Los catálogos completos actuales de Clientes y Productos son **TRANSITORIOS**. Los demás casos conservan sus catálogos o soluciones temporales actuales hasta definir el patrón común.

Idea inicial, **NO contrato definitivo**: escribir aproximadamente 3 caracteres → request server-side → aproximadamente 20 coincidencias → dropdown/select de resultados → selección de entidad. Objetivo: evitar cargar miles de registros completos en memoria al montar.

Antes de implementar, definir de forma común: mínimo de caracteres; debounce vs búsqueda explícita; pageSize/límite; búsqueda por ID/nombre; loading; empty state; limpieza; cache; entidades activas/inactivas; shape e identidad de cada selector. No diseñar ni implementar ahora.

### 2. Vendedor en Ventas — PENDIENTE, NO BLOQUEA PR5

Estado actual: filtro funcional mediante input de nombre completo. Dropdown completo pendiente. La prueba real del 02/11/2026 confirmó que GET /users no ofrece paginación numérica confiable; las colecciones pequeñas completas actuales no constituyen un contrato para construir el catálogo. Pendientes backend: paginación real, política ACTIVE/INACTIVE y filtros/identidad. Input temporal aceptado hasta resolver el patrón global de búsquedas/selectores posterior a las 7 PR.

Requisito futuro: volver a selector/dropdown con todos los usuarios que corresponda, preferentemente dentro del mismo patrón común de búsquedas/selectores remotos. Conservar identidad esperada por `createdBy` y definir política de activos/inactivos sin cambios implícitos.

### 3. Payment status — PENDIENTE BACKEND

Frontend confirmado: Pagados → `paymentStatus=PAID`; Pendientes → `paymentStatus=PENDING`, sólo cuando corresponde a `state=CONFIRMED`. Backend real actualmente devuelve el mismo dataset para ambos según prueba manual informada. Pendiente backend; no compensar localmente.

### 4. Historial de Ventas — PENDIENTE DE ELIMINACIÓN

Decisión de producto: eliminar `/historial-ventas` posteriormente. PostgreSQL/server-side permite consultar períodos históricos sin mantener una pantalla separada sólo para ese propósito.

Después de las 7 PR, incorporar filtro/rango de fechas directamente en `/ventas`; la consulta usará fecha/rango según UX que se defina. Eliminar Historial cuando esa funcionalidad esté disponible. No migrarlo ahora ni retirar sus dependencias mientras tenga consumidores.

### 5. Exports — PENDIENTE TRANSVERSAL POSTERIOR A LAS 7 PR

Export de Ventas queda pendiente. Resolver exports transversalmente entre entidades después de las 7 PR: dataset completo filtrado, paginación server-side, snapshots históricos y comportamiento consistente. No exportar únicamente página visible. No implementar ahora ni reconstruir productos históricos desde el catálogo actual.

### 6. Sort de Ventas — ESTADO FINAL CONFIRMADO

| Columna | Mapping remoto | Estado PR5 |
|---|---|---|
| ID | `id` | Funciona contra backend real. |
| Fecha | `createdAt` | Funciona contra backend real. |
| Cliente | Sin mapping habilitado. | Deshabilitado; contrato no confirmado. |
| Total | Sin mapping habilitado; se probó `total`. | Deshabilitado; backend no ordenó correctamente en prueba. |
| Pagado | Sin mapping habilitado. | Deshabilitado. |
| Pendiente | Sin mapping habilitado. | Deshabilitado. |
| Vendedor | Sin mapping habilitado. | Deshabilitado. |

Budgets mantiene adaptación **local**: ASC → `order=true`; DESC → `order=false`. Infraestructura global sin cambios; sin compensación mediante sort local.

## Validación y alcance PR6 — Gastos

- Base limpia: branch `597-gastos-filtros-especiales`, HEAD = origin/staging `36a273ed`; PR5 incluida. Sin copiar infraestructura experimental ni modificar pagedLists, useServerListFilters o Table.
- Evidencia previa real: GET /expenses pageNumber=1/pageSize=1/count=true devolvió un gasto y count numérico 2; página 2 con count=false devolvió otro gasto y omitió count. LastEvaluatedKey puede aparecer como compatibilidad, pero se ignora y nunca se reenvía en el flujo nuevo. Navegación UI a página 2 no pudo validarse entonces: sólo dos gastos y mínimo visual 20.
- `/gastos` usa useServerListFilters → usePagedExpenses → pagedLists → Table.serverPagination. Tabla recibe exactamente página backend; sin colección completa, Dexie, filter/sort/slice local ni refetch extra de montaje.
- Filtros confirmados: id, name y state. Todos omite state; categorías antiguas de storage no viajan ni cuentan como filtro activo. Escribir/seleccionar/limpiar draft no consulta; Buscar/Enter aplica página 1 y recount; reset limpia y recuenta. No hay afterChange automático de Estado.
- Primera carga solicita count=true; siguientes páginas con total conocido usan count=false. Tamaño/sort vuelven a página 1 según infraestructura común. Refresh utiliza la misma normalización local de filtros/order que la consulta, evitando identidades distintas al repetir Buscar.
- Whitelist exclusiva: UI id → backend id; ASC → order=true, DESC → order=false, adaptación sólo de Expenses. Backend real confirmó id; no afirmar soporte de name/amount por coincidencia de sus valores con orden de ID. Pagado falló en prueba real; Pendiente no se probó ni se intenta resolver aquí.
- Categorías del listado: control deshabilitado y rotulado no disponible, sin request adicional de Settings para opciones inutilizables, sin parámetro remoto ni filtro local. Crear/editar conserva ExpenseForm, Settings y useSettingArrayField intactos: expense.categories sigue siendo array múltiple de objetos name/color/description, incluidas opciones históricas del gasto.
- Pregunta pendiente: ¿Qué key y serialización requiere GET /expenses para filtrar por UN nombre de categoría contenido en expense.categories? Control negativo categories=__AUDIT_NO_EXISTE__ devolvió dos gastos con categories=[] y count=2; no se inventan formatos alternativos.
- Crear/clonar, editar y anular Expense omiten Dexie e invalidan páginas/count mediante invalidateServerLists. Se conservan invalidaciones de detalle existentes. Crear/editar/eliminar pagos sólo agrega esa invalidación cuando entity=expense y statusOk; payloads, endpoints e invalidación de pagos se conservan, sin ampliar comportamiento de otras entidades.
- Export de Gastos queda deshabilitado, sin handler, export parcial ni carga de todas las páginas. Continúa pendiente transversal posterior a las 7 PR, junto con Ventas y demás exports.
- Búsqueda global posterior: useListExpenses y LIST_EXPENSES_QUERY_KEY sin consumidores runtime; ExpensesPage es único consumidor de sus HEADERS. listItems/getDefaultListParams continúan en Users/CashBalances; entityList además en Historial. LAST_UPDATED_AT, Dexie, skipStorageUpdate, useFilters/useFilterParams, restore y Table local se conservan por consumidores reales. Sin nuevo legacy innecesario.

## PR7 — Usuarios + Cajas — evidencia backend real del 02/11/2026

**ESTADO: BLOQUEADA POR BACKEND. USERS: C — BLOQUEADO POR BACKEND. CASH: C — BLOQUEADO POR BACKEND.**

No es un bloqueo de infraestructura frontend: ya existen `pagedLists`, `useServerListFilters` y `Table.serverPagination`. La migración podrá retomarse cuando los endpoints cumplan el contrato remoto necesario. No implementar migración parcial, workarounds frontend ni cambios de infraestructura para compensar estos resultados.

Las pruebas se realizaron mediante HTTP autenticado contra el backend real configurado, desde la experimental `590-test-staging` (commit `ccbeec23d76bb5081b8bd3d77a93497a665c5523`). Este registro documenta sus resultados en la branch limpia `598-usuarios-cajas`; no traslada implementación experimental.

### Users — bloqueo backend

Requests de paginación probadas, sin reenviar cursor:

- `GET /users?pageNumber=1&pageSize=1&count=true`
- `GET /users?pageNumber=2&pageSize=1&count=false`

**CONFIRMADO:** `count=true` devuelve el total como `number`; `count=false` omite `count`. La respuesta incluye `id`, `username`, `firstName`, `lastName`, `state` y `role`.

**NO FUNCIONAL:** `pageNumber`; `pageSize` como paginación real; filtros `username`, `id`, `firstName`, `lastName`, `state`; sorts `username`, `id`, `lastName` con `order=true/false`.

Evidencia concreta:

- Cuenta `callixto`: ambas páginas devuelven los mismos 6 usuarios, en el mismo orden, aunque pageSize=1; primera respuesta count=6, segunda sin count. Sin LastEvaluatedKey.
- Cuenta `maderera-las-tapias`: mismo comportamiento con 9 usuarios; primera respuesta count=9. Página 2 repite exactamente la colección de página 1. Confirma el fallo en otra cuenta.
- Con pageNumber=1/pageSize=500/count=true, username e id se probaron individualmente con `miltonbarraza90@gmail.com`, firstName con `Milton`, lastName con `Barraza`: todos devuelven los 6 usuarios y count=6. `state=ACTIVE` y `state=INACTIVE` devuelven los mismos 6 ACTIVE.
- Sort username/id conserva orden descendente incluso con order=true; lastName no queda ordenado en ninguna dirección. Sort state: **INDETERMINADO POR DATASET**, todos los usuarios observados son ACTIVE.

Conclusión: `/usuarios` no puede migrarse correctamente a `Table.serverPagination` hasta que backend propague y aplique paginación, filtros y sorts. No implementar paginación local sobre la respuesta completa como compensación.

### Seller catalog — pendiente

El dropdown completo de vendedores de Ventas sigue pendiente. GET /users devuelve hoy colecciones pequeñas completas, con el shape requerido, pero carece de contrato numérico paginable confiable. Con pageSize=500, count=true en primera página y count=false en segunda, la segunda repite los mismos 6/9 usuarios; no permite construir un catálogo general completo sin cursor. No crear catálogo basado en el comportamiento accidental de que actualmente haya pocos usuarios.

Pendientes backend: paginación real, política ACTIVE/INACTIVE y filtros/identidad. No hubo usuarios INACTIVE observables; su inclusión permanece **INDETERMINADA POR DATASET**. El input temporal de nombre completo en Ventas sigue aceptado hasta resolver el patrón global de búsquedas/selectores posterior a las 7 PR.

### Cash — bloqueo backend

Requests de paginación probadas, sin reenviar cursor:

- `GET /cash-balances?pageNumber=1&pageSize=1&count=true`
- `GET /cash-balances?pageNumber=2&pageSize=1&count=false`

**CONFIRMADO:** pageSize funciona; count=true devuelve total `number`; count=false omite count; filtro id funciona; sort=id y order=true/false funcionan para ID.

**NO FUNCIONAL:** pageNumber; state=OPEN/CLOSED; paymentMethod; paymentMethods; sorts updatedAt, startDate, initialAmount, currentAmount y closeDate.

**INDETERMINADO POR DATASET:** sorts state y createdAt. En los registros disponibles coinciden con el orden por ID; esa correlación no confirma que backend aplique el sort solicitado. No equiparar startDate con createdAt.

Evidencia concreta:

- Cuenta `maderera-las-tapias`: páginas 1 y 2 devuelven A0017, ambas con LastEvaluatedKey={"id":"A0017"}; primera count=17, segunda sin count. pageSize=500 devuelve 17 cajas.
- Cuenta `callixto`: páginas 1 y 2 devuelven A0003 y cursor A0003; total numérico 2. id=A0002 restringe a esa única caja y count=1.
- En ambas cuentas, state=OPEN y state=CLOSED devuelven la colección con los dos estados, sin restringirla.
- La experimental envía `paymentMethods` como string escalar. Se probaron individualmente `paymentMethod=Mercado+Pago+Adri` y `paymentMethods=Mercado+Pago+Adri` en Callixto: ambos devuelven las 2 cajas, incluida A0002 con sólo Efectivo. Parámetros ignorados, sin error.
- En Maderera, ambos candidatos con Efectivo devuelven las 17 cajas, incluida A0004 con sólo Transferencia Bancaria. Existen 11 cajas con paymentMethods=[]; no aparecieron cajas con paymentMethods=null. El parámetro ignorado impide concluir semántica de [] como comodín; semántica de null no probada.
- Todos los sorts se probaron con order=true y order=false. ID devuelve A0001…A0017 y su reverso; los sorts no funcionales mantienen esa secuencia aunque sus fechas/importes quedan desordenados.

Conclusión: aunque algunas capacidades funcionan, `/cash-balances` no puede migrarse correctamente mientras pageNumber no avance. LastEvaluatedKey puede venir por compatibilidad, pero la migración nueva no debe volver a cursor. No implementar híbrido cursor/pageNumber ni paginar localmente una colección completa como reemplazo.

### Necesidades pendientes de backend

USERS:

- Habilitar propagación/aplicación real de pageNumber/pageSize.
- Definir filtro canónico Usuario.
- Soportar firstName/lastName/state.
- Definir whitelist de sorts/order.
- Definir política ACTIVE/INACTIVE para catálogo de vendedores.

CASH:

- Habilitar pageNumber.
- Soportar state.
- Definir paymentMethod vs paymentMethods y semántica de []/null.
- Definir whitelist definitiva de sorts.

### Legacy conservado — PENDIENTE

No se retiró ningún consumidor runtime en PR7. Mantener como **PENDIENTE**, con los consumidores de la tabla principal:

- `useListUsers`: `/usuarios` y selector de vendedores de Historial.
- `useListCashBalances`: `/cajas`.
- `listItems`: APIs Users y CashBalances.
- `entityList` y `LastEvaluatedKey`: listItems y useListBudgetsHistory.
- Dexie `users`/`cashBalances`, `lastUpdatedAt`, sincronización y restore legacy relacionado: listados y bindings activos de restauración; no retirar helpers compartidos.

Historial de Ventas sigue siendo consumidor legacy. Su eliminación posterior mantiene la decisión de producto registrada en PR5: incorporar consulta por fecha/rango en Ventas y después eliminar Historial. No eliminar legacy para avanzar artificialmente una PR bloqueada ni introducir legacy nuevo.
