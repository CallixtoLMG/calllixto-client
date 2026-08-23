# Playwright E2E tests

Documentacion corta para correr los tests E2E del frontend.

## Requisitos previos

- Crear un archivo local `.env.e2e` en la raiz del proyecto.
- `.env.e2e` no debe subirse al repo. Esta ignorado por Git.
- Puede basarse en `.env.e2e.example`.
- No incluir credenciales reales en archivos versionados.

Variables esperadas:

```env
E2E_STABLE_PORT=3100
E2E_BASE_URL=http://127.0.0.1:3000
E2E_USER_EMAIL=
E2E_USER_PASSWORD=
E2E_ACCOUNT_MODULES_ENABLED=
E2E_ACCOUNT_MODULES_DISABLED=
```

La configuracion estable carga `.env.local` y luego `.env.e2e`. `.env.e2e` pisa valores locales para Playwright, `next build` y `next start`.

## Modalidades

### Estable

Usar para suite completa, CI y validacion antes de merge:

```bash
npm run test:e2e
```

Este comando ejecuta `next build`, luego Playwright levanta `next start` en `127.0.0.1:3100`, espera `/login`, corre los tests y cierra el servidor. No reutiliza servidores existentes.

Con navegador visible:

```bash
npm run test:e2e:headed
```

Por archivo:

```bash
npm run test:e2e -- tests/e2e/products-crud.spec.ts
```

Por nombre:

```bash
npm run test:e2e -- -g "creates and updates a product"
```

Varios archivos:

```bash
npm run test:e2e -- tests/e2e/customers-crud.spec.ts tests/e2e/products-crud.spec.ts
```

### Desarrollo

Usar solo para debugging rapido de specs aislados:

```bash
npm run test:e2e:dev -- tests/e2e/login.smoke.spec.ts
```

Esta modalidad usa `next dev` en `E2E_BASE_URL` o `http://127.0.0.1:3000`. No usar para suite completa: una corrida larga sobre `next dev` puede degradar el servidor y producir falsos fallos en cascada.

## HTTP 500 en `/login`

El helper de auth valida que `GET /login` responda con status menor que 500. Si aparece:

```text
Expected /login to render without a server error
Received: 500
```

Eso es error de servidor, no fallo de locator. Revisar logs de `next start` o `next dev` antes de tocar specs. En modalidad estable, un 500 de `/login` indica posible problema de render/produccion y debe investigarse con stack del servidor.

## Que cubre cada archivo

- `login.smoke.spec.ts`: abre la pantalla de login y verifica elementos basicos visibles.
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

- Durante desarrollo, correr el archivo de la entidad con `npm run test:e2e -- tests/e2e/archivo.spec.ts`.
- Para debugging rapido, usar `npm run test:e2e:dev -- tests/e2e/archivo.spec.ts`.
- Antes de cerrar un sprint o mergear, correr todos los tests con `npm run test:e2e`.
- Si muchos tests fallan, correr primero `npm run test:e2e -- tests/e2e/login.smoke.spec.ts`.

## Debug local

Se puede usar `test.only` para debug local, pero no debe commitearse.
