import { encodeUri } from "@/common/utils";
import { Icon, List, ListItem } from "semantic-ui-react";
import { Accent } from "../components/custom";
import { StyledListHeader, StyledModalContent } from "../components/modals/ModalShortcuts/styles";
import { ENTITIES } from "./entities";

export * from './dates';
export * from './entities';
export * from './semantic';
export * from './time';

export const DEFAULT_SELECTED_CLIENT = "callixto";

export const PAGES = {
  BASE: "/",
  CUSTOMERS: {
    BASE: "/clientes",
    CREATE: "/clientes/crear",
    UPDATE: (id) => `/clientes/${id}?update=true`,
    SHOW: (id) => `/clientes/${id}`,
    NAME: 'Clientes',
    SHORTKEYS: 'Control+1'
  },
  SUPPLIERS: {
    BASE: "/proveedores",
    CREATE: "/proveedores/crear",
    UPDATE: (id) => `/proveedores/${id}?update=true`,
    SHOW: (id) => `/proveedores/${id}`,
    NAME: 'Proveedores',
    SHORTKEYS: 'Control+2'
  },
  BRANDS: {
    BASE: "/marcas",
    CREATE: "/marcas/crear",
    UPDATE: (id) => `/marcas/${id}?update=true`,
    SHOW: (id) => `/marcas/${id}`,
    NAME: 'Marcas',
    SHORTKEYS: 'Control+3'
  },
  PRODUCTS: {
    BASE: "/productos",
    CREATE: "/productos/crear",
    UPDATE: (id) => `/productos/${id}?update=true`,
    SHOW: (id) => `/productos/${id}`,
    NAME: 'Productos',
    SHORTKEYS: 'Control+4'
  },
  BUDGETS: {
    BASE: "/ventas",
    CREATE: "/ventas/crear",
    CLONE: (id) => `/ventas/crear?clonar=${id}`,
    SHOW: (id) => `/ventas/${id}`,
    NAME: 'Ventas',
    SHORTKEYS: 'Control+5'
  },
  EXPENSES: {
    BASE: "/gastos",
    CREATE: "/gastos/crear",
    CLONE: (id) => `/gastos/crear?clonar=${id}`,
    UPDATE: (id) => `/gastos/${id}?update=true`,
    SHOW: (id) => `/gastos/${id}`,
    NAME: 'Gastos',
    SHORTKEYS: 'Control+6'
  },
  CASH_BALANCES: {
    BASE: "/cajas",
    CREATE: "/cajas/crear",
    UPDATE: (id) => `/cajas/${id}?update=true`,
    SHOW: (id) => `/cajas/${id}`,
    NAME: 'Cajas',
    SHORTKEYS: 'Control+8'
  },
  USERS: {
    BASE: "/usuarios",
    CREATE: "/usuarios/crear",
    SHOW: (id) => `/usuarios/${id}`,
    NAME: 'Usuarios',
    SHORTKEYS: 'Control+7'
  },
  BUDGETS_HISTORY: {
    BASE: "/historial-ventas",
  },
  LOGIN: {
    BASE: "/login"
  },
  SETTINGS: {
    BASE: "/configuracion",
    NAME: 'Configuración',
    SHORTKEYS: 'Control+9'
  },
  CHANGE_PASSWORD: {
    BASE: "/cambiar-contrasena"
  },
  RESTORE_PASSWORD: {
    BASE: "/recuperar-contrasena"
  },
  NOT_FOUND: {
    BASE: "/ups"
  },
};

export const PAGE_SIZE_OPTIONS = [
  { key: 10, text: '10', value: 10 },
  { key: 20, text: '20', value: 20 },
  { key: 50, text: '50', value: 50 },
  { key: 100, text: '100', value: 100 }
];

export const DEFAULT_PAGE_SIZE = 20;

export const EXTERNAL_APIS = {
  MAIL: (email, name) => `mailto:${email}?Subject=${encodeUri(`Hola estimado/a ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
  WSP: (phone, name) => `https://api.whatsapp.com/send?phone=${phone}&text=${encodeUri(`Hola estimado ${name}, aqui esta el presupuesto que nos has pedido!`)}`,
};

export const REGEX = {
  EMAIL: /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,10}))$/,
  TWO_DIGIT_ID: /^[A-Z0-9]{2}$/,
  MAX26_DIGIT_ID: /^[A-Za-z0-9\-\_]{1,26}$/,
};

export const RULES = {
  REQUIRED: {
    required: 'Campo requerido.'
  },
  REQUIRED_PRODUCT: (value) => ({
    required: value !== false ? 'Campo requerido.' : 'Es necesario elegir un producto',
  }),
  REQUIRED_POSITIVE_NUMBER: {
    required: "El monto es obligatorio",
    validate: (value) => {
      if (value === null || value === undefined || value === '') return "Debe ingresar un monto";
      if (isNaN(value)) return "El valor debe ser un número";
      if (Number(value) < 0) return "Debe ser un valor mayor o igual a cero";
      return true;
    }
  },
  REQUIRED_TWO_DIGIT: {
    required: 'Campo requerido.',
    pattern: { value: REGEX.TWO_DIGIT_ID, message: 'El id debe ser de 2 cifras alfanumérico' }
  },
  REQUIRED_BRAND_AND_SUPPLIER: (brand, supplier) => ({
    validate: (value) => {
      if (!brand?.id || !supplier?.id) {
        return 'Debe seleccionar un proveedor y una marca antes de ingresar un id';
      }
      if (!value) {
        return 'El id es requerido';
      }
      if (!REGEX.MAX26_DIGIT_ID.test(value)) {
        return 'El id no puede tener más de 26 caracteres alfanuméricos, incluyendo "-" y "_"';
      }
      return true;
    }
  }),
};

export const SHORTKEYS = {
  ENTER: "Control+Enter",
  ALT_ENTER: "Control+Alt+Enter",
  BACKSPACE: "Control+Backspace",
  RIGHT_ARROW: "Control+ArrowRight",
  LEFT_ARROW: "Control+ArrowLeft",
  DELETE: "Control+Delete",
};

export const DEFAULT_KEY = "id";
export const LAST_UPDATED_AT = "lastUpdatedAt";
export const COLORS = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
  ORANGE: 'orange',
  GREY: 'grey',
  BROWN: 'brown',
  TEAL: 'teal',
  YELLOW: "yellow"
};

export const SIZES = {
  MINI: 'mini',
  TINY: 'tiny',
  SMALL: 'small',
  LARGE: 'large',
  HUGE: 'huge',
};

export const SEMANTIC_COLORS = [
  { key: "yellow", text: "Amarillo", value: "yellow" },
  { key: "blue", text: "Azul", value: "blue" },
  { key: "brown", text: "Marrón", value: "brown" },
  { key: "grey", text: "Gris", value: "grey" },
  { key: "black", text: "Negro", value: "black" },
  { key: "olive", text: "Oliva", value: "olive" },
  { key: "orange", text: "Naranja", value: "orange" },
  { key: "pink", text: "Rosa", value: "pink" },
  { key: "purple", text: "Púrpura", value: "purple" },
  { key: "red", text: "Rojo", value: "red" },
  { key: "green", text: "Verde", value: "green" },
  { key: "teal", text: "Turquesa", value: "teal" },
  { key: "violet", text: "Violeta", value: "violet" },
];

export const ICONS = {
  X: 'x',
  TRASH: 'trash',
  CHECK: 'check',
  TRUCK: 'truck',
  HOURGLASS_HALF: "hourglass half",
  ADD: "add",
  UNDO: "undo",
  BAN: "ban",
  FILE_EXCEL: "file excel",
  FILE_EXCEL_OUTLINE: "file excel outline",
  SEND: "send",
  DOWNLOAD: "download",
  COPY: "copy",
  DOLLAR: "dollar",
  PLAY_CIRCLE: "play circle",
  PAUSE_CIRCLE: "pause circle",
  BOX: "box",
  QUESTION: "question",
  BARCODE: "barcode",
  LIST_UL: "list ul",
  INFO_CIRCLE: "info circle",
  WAREHOUSE: "warehouse",
  ARROW_LEFT: "arrow left",
  CANCEL: "cancel",
  DELETE: "delete",
  EDIT: "edit",
  TIMES: "times",
  KEYBOARD: "keyboard",
  REMOVE: "remove",
  SEARCH: "search",
  CHEVRON_RIGHT: "chevron right",
  USER: "user",
  USERS: "users",
  LOCK: "lock",
  PENCIL: "pencil",
  CUT: "cut",
  EDIT: "edit",
  EYE: "eye",
  EYE_SLASH: "eye slash",
  COG: "cog",
  EXCLAMATION_CIRCLE: "exclamation circle",
  TAGS: "tags",
  ADDRESS_CARD: "address card",
  ARCHIVE: "archive",
  OPTIONS: "options",
  REFRESH: "refresh",
  MAIL_SQUARE: "mail square",
  PERCENT: 'percent',
  SETTINGS: "settings",
  BULLHORN: "bullhorn",
  BOXES: "boxes",
  CLOSE: "close",
  ARROW_UP: "arrow up",
  ARROW_DOWN: "arrow down",
  CLOCK: "clock",
  MONEY: "money",
  CALCULATOR: "calculator",
  COPYRIGHT: "copyright",
  CLIPBOARD: "clipboard",
  MONEY_BILL_ALTERNATE: "money bill alternate",
};

export const ALL = "all";
export const ACTIVE = "active";
export const DELETE = "delete";
export const HARD_DELETED = "HARD_DELETED";
export const INACTIVE = "inactive";

export const CANCELLED = "cancelled";

export const CANCEL_ACTION = "cancel";

export const RECOVER = "recover";

export const LABELS = {
  ACTIVE: "Activado",
  INACTIVE: "Desactivado",
  UNKNOWN: "Desconocido",
};

export const PASSWORD_REQUIREMENTS = [
  { label: "Al menos 8 caracteres.", test: /.{8,}/ },
  { label: "Una letra mayúscula.", test: /[A-Z]/ },
  { label: "Una letra minúscula.", test: /[a-z]/ },
  { label: "Un número.", test: /\d/ },
  { label: "Un carácter especial.", test: /[@$!%*?&]/ },
];

export const SELECT_ALL_OPTION = { key: ALL, value: ALL, text: 'Todos' };

export const SORTING = {
  ASC: 'ascending',
  DESC: 'descending'
};

export const ENTITY_VIEW = {
  LIST: 'LIST',
  CREATE: 'CREATE',
  DETAIL: 'DETAIL',
};

export const INFO = {
  HELP: {
    SECTIONS: {

      [ENTITIES.CUSTOMER]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USERS} color={COLORS.BLUE} /><strong>Clientes</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todos los clientes, activos o inactivos, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos filtrados.
                </ListItem>
                <ListItem>
                  Para crear un cliente, presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USERS} color={COLORS.BLUE} /><strong>Crear cliente</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USERS} color={COLORS.BLUE} /><strong>Detalle del cliente</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual del cliente. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                < ListItem >
                  En esta página se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Desactivar el cliente con el botón <Accent>Desactivar</Accent>, ingresando un motivo.
                    </ListItem>
                    <ListItem>
                      Eliminar el cliente con el botón <Accent>Eliminar</Accent> (Solo disponible para administradores. No se puede eliminar un cliente si existen presupuestos asociados).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.SUPPLIER]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.TRUCK} color={COLORS.BLUE} /><strong>Proveedores</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todos los proveedores, activos o inactivos, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos visibles.
                </ListItem>
                <ListItem>
                  Para crear un proveedor, presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.TRUCK} color={COLORS.BLUE} /><strong>Crear proveedor</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.TRUCK} color={COLORS.BLUE} /><strong>Detalle del proveedor</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual del proveedor. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                < ListItem >
                  En esta página se pueden se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Descargar los códigos de barra de los productos del proveedor con el botón <Accent>Ids</Accent>.
                    </ListItem>
                    <ListItem>
                      Desactivar el proveedor con el botón <Accent>Desactivar</Accent>, ingresando un motivo.
                    </ListItem>
                    <ListItem>
                      Descargar todos los productos del proveedor con el botón <Accent>Descargar productos</Accent>.
                    </ListItem>
                    <ListItem>
                      Eliminar todos los productos del proveedor con el botón <Accent>Eliminar productos</Accent>.
                    </ListItem>
                    <ListItem>
                      Eliminar el proveedor con el botón <Accent>Eliminar</Accent> (Solo disponible para administradores. No se puede eliminar un proveedor si existen productos asociados).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.BRAND]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.COPYRIGHT} color={COLORS.BLUE} /><strong>Marcas</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todas las marcas, activas o inactivas, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos visibles.
                </ListItem>
                <ListItem>
                  Para crear una marca, presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.COPYRIGHT} color={COLORS.BLUE} /><strong>Crear marca</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.COPYRIGHT} color={COLORS.BLUE} /><strong>Detalle de la marca</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual de la marca. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                < ListItem >
                  En esta página se pueden se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Desactivar la marca con el botón <Accent>Desactivar</Accent>, ingresando un motivo.
                    </ListItem>
                    <ListItem>
                      Eliminar la marca con el botón <Accent>Eliminar</Accent> (solo disponible para administradores. No se puede eliminar una marca si existen productos asociados).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.PRODUCT]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.BOX} color={COLORS.BLUE} /><strong>Productos</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todos los productos, ya sean activos, inactivos, eliminados o sin stock, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos visibles. Si hay filtros activos, solo se descarga lo filtrado.
                </ListItem>
                <ListItem>
                  Para crear un producto, presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.BOX} color={COLORS.BLUE} /><strong>Crear producto</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.BOX} color={COLORS.BLUE} /><strong>Detalle del producto</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual del producto. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                <ListItem>
                  En la pestaña <Accent>Producto</Accent> se muestran los datos generales, y si está habilitada la edición, algunos pueden modificarse.
                </ListItem>
                <ListItem>
                  En la pestaña <Accent>Historial de cambios</Accent> se muestra un listado de cambios realizados al producto.
                </ListItem>
                < ListItem >
                  En esta página se pueden se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Descargar los códigos de barra del producto con el botón <Accent>Códigos de barra</Accent>.
                    </ListItem>
                    <ListItem>
                      Marcar el producto como sin stock con el botón <Accent>Sin stock</Accent>.
                    </ListItem>
                    <ListItem>
                      Marcar el producto como disponible con el botón <Accent>En stock</Accent>.
                    </ListItem>
                    <ListItem>
                      Desactivar el producto con el botón <Accent>Desactivar</Accent>, ingresando un motivo.
                    </ListItem>
                    <ListItem>
                      Eliminar el producto con el botón <Accent>Eliminar</Accent> (solo disponible para administradores).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.BUDGET]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.CLIPBOARD} color={COLORS.BLUE} /><strong>Ventas</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todas las ventas: confirmadas, pendientes, borradores, anuladas o expiradas, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  En las ventas confirmadas, pasando el mouse sobre el ID, se podrá visualizar quién y cuándo se confirmó la venta. Si la venta está pagada en su totalidad, aparecerá el icono <Icon name={ICONS.DOLLAR} color={COLORS.GREEN} />.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos visibles.
                </ListItem>
                <ListItem>
                  En esta pantalla principal se muestran datos de los últimos 3 meses. Si necesitás datos posteriores, podés hacer clic en el botón <Accent>Historial</Accent>.
                </ListItem>
                <ListItem>
                  En la pantalla <Accent>Historial de ventas</Accent> podés definir rangos de fechas para obtener los datos necesarios. Podés usar las fechas predeterminadas o establecerlas manualmente. También podés aplicar filtros y descargar los datos como en la página principal.
                </ListItem>
                <ListItem>
                  Para crear una venta, presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.CLIPBOARD} color={COLORS.BLUE} /><strong>Crear venta</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>

              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.CLIPBOARD} color={COLORS.BLUE} /><strong>Detalle de la venta</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual de una venta.
                </ListItem >
                <ListItem>
                  En la pestaña <Accent>Presupuesto</Accent> se muestran los datos generales, y si está habilitada la edición, algunos pueden modificarse.
                </ListItem>
                <ListItem>
                  En la pestaña <Accent>Pagos</Accent> se muestran un listado de los pagos realizados. Tambien se puede agregar, quitar o modificar pagos.
                </ListItem>
                <ListItem>
                  En el caso de ventas en estado borrador, será posible modificar algunos datos. En ventas en estado pendiente o confirmadas, solo se podrán modificar aspectos menores. Las ventas confirmadas mostrarán pestañas de <Accent>Presupuestos</Accent> y <Accent>Pagos</Accent>.
                </ListItem>
                <ListItem>
                  En caso de querer crear una venta confirmada, podrás agregar uno o más pagos a la venta.
                </ListItem>
                < ListItem >
                  En la vista individual de la venta, dependiendo de su estado, podrás realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Ver y descargar el presupuesto en formato PDF con el botón <Accent>PDF</Accent>.
                    </ListItem>
                    <ListItem>
                      Enviar la venta por WhatsApp o correo electrónico con el botón <Accent>Enviar</Accent>. (Se recomienda descargar previamente el presupuesto para adjuntarlo).
                    </ListItem>
                    <ListItem>
                      Clonar la venta actual con el botón <Accent>Clonar</Accent>, lo que te redirigirá a una nueva venta, manteniendo todos los productos del original.
                    </ListItem>
                    <ListItem>
                      Anular la venta con el botón <Accent>Anular</Accent>, e ingresando un motivo.
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.EXPENSE]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.MONEY_BILL_ALTERNATE} color={COLORS.BLUE} /><strong>Gastos</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todos los gastos: pagados, pendientes o anulados, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos visibles.
                </ListItem>
                <ListItem>
                  Para crear un gasto, presioná el botón verde <Accent>Crear</Accent>. Podrás establecer el detalle (nombre), monto, fecha de vencimiento, categorías y etiquetas.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.MONEY_BILL_ALTERNATE} color={COLORS.BLUE} /><strong>Crear gasto</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>

              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.MONEY_BILL_ALTERNATE} color={COLORS.BLUE} /><strong>Detalle del gasto</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual de un gasto. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                <ListItem>
                  en esta página se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Clonar el gasto con el botón <Accent>Clonar</Accent>. Este proceso mantendrá todos los datos del gasto original, excepto los pagos.
                    </ListItem>
                    <ListItem>
                      Anular el gasto con el botón <Accent>Anular</Accent>, e ingresando un motivo.
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.CASH_BALANCE]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.CALCULATOR} color={COLORS.BLUE} /><strong>Caja</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todas las cajas: abiertas o cerradas, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos visibles.
                </ListItem>
                <ListItem>
                  Para crear una caja, presioná el botón verde <Accent>Abrir</Accent>.
                </ListItem>
                <ListItem>
                  En la ventana abierta <Accent>Crear caja</Accent>, completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.CALCULATOR} color={COLORS.BLUE} /><strong>Detalle de caja</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual de una caja.
                </ListItem >
                < ListItem >
                  En la pestaña<Accent>Caja</Accent> aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                < ListItem >
                  En la pestaña<Accent>Movimientos</Accent> se listan todos los<Accent>Gastos</Accent> y < Accent >Ventas</Accent> realizados mientras la caja estuvo abierta.Al hacer clic sobre un ítem, serás redirigido al detalle correspondiente.
                </ListItem >
                <ListItem>
                  En la vista individual de la caja se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Si no se estableció una fecha de cierre al crearla, podrás cerrar la caja manualmente desde el botón <Accent>Cerrar Caja</Accent>.
                    </ListItem>
                    <ListItem>
                      Eliminar la caja con el botón de <Accent>Eliminar</Accent> (solo disponible para administradores).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.USER]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USER} color={COLORS.BLUE} /><strong>Usuarios</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran todos los usuarios: activos o inactivos, según el filtro aplicado.
                </ListItem>
                <ListItem>
                  Debajo de la tabla se encuentra el botón <Accent>Descargar Excel</Accent>, que permite exportar los datos a un archivo. Si hay filtros activos, solo se descargan los elementos visibles.
                </ListItem>
                <ListItem>
                  Para crear un usuario, presioná el botón verde <Accent>Crear</Accent>. Podrás establecer el nombre del usuario (que debe ser un correo electrónico), el rol y otros datos personales.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
        CREATE: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USER} color={COLORS.BLUE} /><strong>Crear usuario</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  Estás en la pantalla de creación. Completá los datos, teniendo en cuenta que aquellos marcados con un asterisco rojo son obligatorios y no podrás finalizar la creación si falta alguno. Luego presioná el botón verde <Accent>Crear</Accent>.
                </ListItem>

              </List>
            </StyledModalContent>
          </>
        ),
        DETAIL: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.USER} color={COLORS.BLUE} /><strong>Detalle del usuario</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                < ListItem >
                  Esta es la vista individual de un usuario. Aqui se muestran los datos generales y, si la edición está habilitada, algunos de ellos pueden modificarse.
                </ListItem >
                < ListItem >
                  En esta página se pueden realizar las siguientes acciones:
                  <List list>
                    <ListItem>
                      Desactivar el usuario con el botón de <Accent>Desactivar</Accent>, ingresando un motivo.
                    </ListItem>
                    <ListItem>
                      Eliminar el usuario con el botón de <Accent>Eliminar</Accent> (solo disponible para administradores).
                    </ListItem>
                  </List>
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },

      [ENTITIES.SETTINGS]: {
        LIST: (
          <>
            <StyledModalContent>
              <StyledListHeader><Icon name={ICONS.SETTINGS} color={COLORS.BLUE} /><strong>Configuración</strong></StyledListHeader>
              <List relaxed bulleted as="ol">
                <ListItem>
                  En la pantalla principal se muestran las distintas pestañas con aspectos configurables. En cada una de ellas encontrarás elementos desplegables donde podrás definir parámetros específicos de cada sección.
                </ListItem>
                <ListItem>
                  Las etiquetas y categorías sirven para catalogar elementos. Para crear una etiqueta o categoría, ingresa un nombre, selecciona un color y agrega una descripción opcional. Luego, haz clic en el botón <Accent>Agregar</Accent>. Cuando hayas terminado, debajo de la tabla se encuentra el botón <Accent>Actualizar</Accent> para guardar los cambios.
                </ListItem>
                <ListItem>
                  Los productos bloqueados son una lista de IDs que no podrán ser agregados o creados. Para más información, pasa el mouse por encima del icono <Icon name={ICONS.INFO_CIRCLE} color={COLORS.BLUE} />.
                </ListItem>
                <ListItem>
                  En el apartado de ventas, encontrarás dos opciones: &quot;Al crear una venta&quot; y &quot;Al imprimir una venta&quot;. La primera te permite establecer valores predeterminados para las ventas, como el estado inicial o el método de entrega. La segunda te permite configurar la visualización del PDF al imprimir la venta, incluyendo si deseás mostrar o no los precios, y la posibilidad de agregar un texto en el PDF, a modo de descargo de responsabilidad, el cual solo será visible en el modo de visualización para el cliente.
                </ListItem>
                <ListItem>
                  En General, podés definir métodos de pago que estarán disponibles al elegir el método de pago. Simplemente escribí el nombre y hacé clic en <Accent>Agregar</Accent>. Luego, haz clic en <Accent>Actualizar</Accent> para guardar los cambios.
                </ListItem>
              </List>
            </StyledModalContent>
          </>
        ),
      },
    }
  }
};
