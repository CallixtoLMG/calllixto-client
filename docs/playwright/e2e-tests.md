# Playwright E2E tests

Documentacion corta para correr los tests E2E del frontend.

## Requisitos previos

- Crear un archivo local `.env.e2e` en la raiz del proyecto.
- `.env.e2e` no debe subirse al repo. Esta ignorado por Git.
- Puede basarse en `.env.e2e.example`.
- No incluir credenciales reales en archivos versionados.

Variables esperadas:

```env
E2E_BASE_URL=http://127.0.0.1:3000
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
```

## Comandos principales

Correr todos los tests:

```bash
npm run test:e2e
```

Correr todos los tests con navegador visible:

```bash
npm run test:e2e:headed
```

Correr todos los tests con la UI de Playwright:

```bash
npm run test:e2e:ui
```

## Correr por archivo

Customers:

```bash
npm run test:e2e:headed -- tests/e2e/customers-crud.spec.ts
```

Suppliers / Proveedores:

```bash
npm run test:e2e:headed -- tests/e2e/suppliers-crud.spec.ts
```

Supplier actions / Acciones de proveedores:

```bash
npm run test:e2e:headed -- tests/e2e/suppliers-actions.spec.ts
```

Brands / Marcas:

```bash
npm run test:e2e:headed -- tests/e2e/brands-crud.spec.ts
```

Expenses / Gastos:

```bash
npm run test:e2e:headed -- tests/e2e/expenses-crud.spec.ts
```

Expense payments / Pagos de gastos:

```bash
npm run test:e2e:headed -- tests/e2e/expenses-payments.spec.ts
```

Products / Productos:

```bash
npm run test:e2e:headed -- tests/e2e/products-crud.spec.ts
```

Product actions / Acciones de productos:

```bash
npm run test:e2e:headed -- tests/e2e/products-actions.spec.ts
```

Budgets / Ventas:

```bash
npm run test:e2e:headed -- tests/e2e/budgets-crud.spec.ts
```

Budget actions / Acciones de budgets:

```bash
npm run test:e2e:headed -- tests/e2e/budgets-actions.spec.ts
```

Settings / Configuracion:

```bash
npm run test:e2e:headed -- tests/e2e/settings.spec.ts
```

Cash Balances / Cajas:

```bash
npm run test:e2e:headed -- tests/e2e/cash-balances.spec.ts
```

Cash balance movements / Movimientos de caja:

```bash
npm run test:e2e:headed -- tests/e2e/cash-balances-movements.spec.ts
```

Excel exports:

```bash
npm run test:e2e:headed -- tests/e2e/exports-excel.spec.ts
```

Login real:

```bash
npm run test:e2e:headed -- tests/e2e/login.spec.ts
```

Login smoke:

```bash
npm run test:e2e:headed -- tests/e2e/login.smoke.spec.ts
```

Correr varios archivos especificos:

```bash
npm run test:e2e:headed -- tests/e2e/customers-crud.spec.ts tests/e2e/suppliers-crud.spec.ts
```

## Correr por nombre

Un test individual:

```bash
npm run test:e2e:headed -- -g "logs in with E2E credentials"
npm run test:e2e:headed -- -g "creates, updates, and deletes a customer"
```

Grupos por coincidencia de nombre:

```bash
npm run test:e2e:headed -- -g "customer"
npm run test:e2e:headed -- -g "supplier"
npm run test:e2e:headed -- -g "deletes all products for a supplier"
npm run test:e2e:headed -- -g "prints supplier product barcodes"
npm run test:e2e:headed -- -g "brand"
npm run test:e2e:headed -- -g "expense"
npm run test:e2e:headed -- -g "expense payment"
npm run test:e2e:headed -- -g "product"
npm run test:e2e:headed -- -g "prints product barcode"
npm run test:e2e:headed -- -g "shows product change history after updates"
npm run test:e2e:headed -- -g "budget"
npm run test:e2e:headed -- -g "voids a confirmed budget"
npm run test:e2e:headed -- -g "clones a confirmed budget"
npm run test:e2e:headed -- -g "settings"
npm run test:e2e:headed -- -g "cash balance"
npm run test:e2e:headed -- -g "cash balance movements"
npm run test:e2e:headed -- -g "exports"
npm run test:e2e:headed -- -g "exports customers"
npm run test:e2e:headed -- -g "exports cash balances"
npm run test:e2e:headed -- -g "login"
```

El `--` en comandos npm sirve para pasar argumentos al comando interno del script. Por ejemplo, en `npm run test:e2e:headed -- -g "login"`, el `-g "login"` se envia a Playwright.

## Que cubre cada archivo

- `login.smoke.spec.ts`: abre la pantalla de login y verifica que carguen elementos basicos visibles.
- `login.spec.ts`: hace login real usando variables de entorno y verifica acceso a la app.
- `customers-crud.spec.ts`: cubre CRUD basico, datos ampliados, y activar/desactivar clientes.
- `suppliers-crud.spec.ts`: cubre CRUD basico y activar/desactivar proveedores.
- `suppliers-actions.spec.ts`: cubre eliminacion de productos del proveedor e impresion de codigos de barra.
- `brands-crud.spec.ts`: cubre CRUD basico y activar/desactivar marcas.
- `expenses-crud.spec.ts`: cubre creacion, edicion, anulacion y clonacion de gastos.
- `expenses-payments.spec.ts`: cubre creacion, edicion y eliminacion de pagos dentro del detalle de un gasto.
- `products-crud.spec.ts`: cubre creacion, edicion, activar/desactivar, stock y eliminacion logica/permanente de productos.
- `products-actions.spec.ts`: cubre impresion de codigo de barra e historial de cambios de producto.
- `budgets-crud.spec.ts`: cubre creacion de venta en borrador, pasaje a pendiente y confirmacion.
- `budgets-actions.spec.ts`: cubre anulacion de budget confirmado y clonado con modal de cambios de producto.
- `settings.spec.ts`: cubre carga de etiquetas, categorias, productos bloqueados y metodos de pago en configuracion.
- `cash-balances.spec.ts`: cubre apertura de caja desde modal, navegacion al detalle y cierre de caja.
- `cash-balances-movements.spec.ts`: cubre movimientos de caja generados por pago de budget y pago de gasto.
- `exports-excel.spec.ts`: cubre descarga Excel en listados principales y compara filas exportadas contra el total filtrado de la tabla.

## Flujo recomendado

- Durante desarrollo, correr el archivo de la entidad que se esta modificando.
- Antes de cerrar un sprint o mergear, correr todos los tests con `npm run test:e2e`.
- Si muchos tests fallan, correr primero `login.smoke.spec.ts` y luego `login.spec.ts` para descartar problemas de login/auth.

## Debug local

Se puede usar `test.only` para debug local, pero no debe commitearse.
