import { useUserContext } from "@/User";
import { Button, FieldsContainer, Flex, FlexColumn, FormField, Icon, Message } from "@/common/components/custom";
import { DropdownControlled, TextControlled, TextField } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker";
import { ModalAction } from "@/common/components/modals";
import { Filters, Table } from "@/common/components/table";
import { COLORS, ICONS, RULES as VALIDATE_RULES } from "@/common/constants";
import { createFilter, preventSend } from "@/common/utils";
import { useFilters } from "@/hooks";
import { RULES } from "@/roles";
import { useMemo, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_STOCK_FILTERS, PRODUCTS_FILTERS_KEY, STOCK_TABLE_HEADERS, STOCK_TYPE_OPTIONS } from "../products.constants";
import { Header } from "./styles";

const product = {
  id: "prod-001",
  name: "Resma A4",
  description: "Resma de hojas A4 de 500 unidades",
  category: "Papelería",
  stock: [
    { quantity: 50, comments: "Ingreso inicial de stock", date: new Date("2024-01-10"), invoiceNumber: "000A52" },
    { quantity: -10, comments: "Salida por venta", date: new Date("2024-02-15"), invoiceNumber: "000A53" },
    { quantity: 20, comments: "Reposición", date: new Date("2024-03-05"), invoiceNumber: "000A55" },
    { quantity: -5, comments: "Uso interno", date: new Date("2024-04-20"), invoiceNumber: "000A57" },
  ],
};

const EMPTY_STOCK = () => ({
  amount: '',
  comments: '',
  date: new Date(),
  invoiceNumber: '',
});

const MODAL_CONFIG = {
  add: {
    title: "Ingreso de stock",
    icon: ICONS.ARROW_DOWN,
    color: COLORS.GREEN,
    confirmText: "Agregar",
  },
  out: {
    title: "Egreso de stock",
    icon: ICONS.ARROW_UP,
    color: COLORS.RED,
    confirmText: "Agregar",
  },
  edit: {
    title: "Editar ingreso",
    icon: ICONS.EDIT,
    color: COLORS.BLUE,
    confirmText: "Actualizar",
  },
  delete: {
    icon: ICONS.TRASH,
    color: COLORS.RED,
    confirmText: "Eliminar",
  },
};

const ProductStock = () => {
  // agregar product cuando este hecho y borrar el Mock linea 18!
  // El llamado se deberia hacer cuando se haga click en la tab de este componente
  const methods = useForm({ defaultValues: { stock: product.stock } });

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods: filterMethods,
  } = useFilters({ defaultFilters: EMPTY_STOCK_FILTERS, key: PRODUCTS_FILTERS_KEY });

  const onFilter = createFilter(filters, ['invoiceNumber', 'comments']);
  const [showModal, setShowModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const { control } = methods;
  const { fields: stockList, append, remove } = useFieldArray({ control, name: "stock" });
  const { role } = useUserContext();
  const [modalMode, setModalMode] = useState();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [stock, setStock] = useState(EMPTY_STOCK());

  const totalStock = useMemo(() => stockList.reduce((acc, item) => acc + (parseFloat(item.quantity) || 0), 0), [stockList]);

  const filteredStockList = useMemo(() => {
    return stockList.filter((item) => {
      const matchesType = filters.type === "all"
        || (filters.type === "in" && item.quantity > 0)
        || (filters.type === "out" && item.quantity < 0);
      const matchesInvoice = item.invoiceNumber?.toLowerCase().includes(filters.invoiceNumber?.toLowerCase() || "");
      const matchesComments = item.comments?.toLowerCase().includes(filters.comments?.toLowerCase() || "");
      return matchesType && matchesInvoice && matchesComments;
    });
  }, [filters, stockList]);

  const elementsWithActions = useMemo(() => {
    const actions = RULES.canRemove[role] ? [
      {
        id: 1,
        icon: ICONS.EDIT,
        width: "100%",
        color: COLORS.GREEN,
        onClick: (item, index) => {
          setStock({ ...item, amount: item.quantity });
          setSelectedIndex(index);
          setModalMode("edit");
          setShowModal(true);
        },
        tooltip: "Editar",
      },
      {
        id: 2,
        icon: ICONS.TRASH,
        color: COLORS.RED,
        onClick: (item, index) => {
          setStock({ ...item });
          setSelectedIndex(index);
          setModalMode("delete");
          setShowModal(true);
        },
        tooltip: "Eliminar",
      }
    ] : [];
  
    return filteredStockList.map(item => ({
      ...item,
      _actions: item.quantity > 0 ? actions : []
    }));
  }, [filteredStockList, role]);

  const handleConfirm = () => {
    setShowErrors(true);
    const hasDate = stock.date instanceof Date && !isNaN(stock.date);
    const hasAmount = stock.amount !== '' && !isNaN(parseFloat(stock.amount));
    if ((["add", "out", "edit"].includes(modalMode)) && (!hasDate || !hasAmount)) return;

    const handlers = {
      add: () => append({ ...stock, quantity: parseFloat(stock.amount) }),
      out: () => append({ ...stock, quantity: -Math.abs(parseFloat(stock.amount)) }),
      edit: () => selectedIndex !== null && methods.setValue(`stock.${selectedIndex}`, {
        ...stock,
        quantity: parseFloat(stock.amount),
      }),
      delete: () => selectedIndex !== null && remove(selectedIndex),
    };

    handlers[modalMode]?.();
    setShowErrors(false);
    setShowModal(false);
    setSelectedIndex(null);
    setStock(EMPTY_STOCK());
  };

  const getModalTitle = () =>
    modalMode === "delete"
      ? `¿Está seguro que desea eliminar el ingreso con detalle ${stock.invoiceNumber} del ${new Date(stock.date).toLocaleDateString()}?`
      : MODAL_CONFIG[modalMode]?.title;

  const getModalContent = () => (
    <FieldsContainer className="ui form">
      <FormField
        selected={stock.date}
        onChange={(date) => setStock({ ...stock, date })}
        dateFormat="dd-MM-yyyy"
        maxDate={new Date()}
        label="Fecha"
        $width="150px"
        control={DatePicker}
        error={showErrors && !(stock.date instanceof Date && !isNaN(stock.date)) ? VALIDATE_RULES.REQUIRED.required : undefined}
      />
      <TextField
        width="150px"
        label="Cantidad"
        value={stock.amount}
        placeholder="Ej: 50"
        onChange={(e) => setStock({ ...stock, amount: e.target.value })}
        error={showErrors && (!stock.amount || isNaN(parseFloat(stock.amount))) ? VALIDATE_RULES.REQUIRED.required : undefined}
      />
      <TextField
        width="150px"
        label="Detalle"
        value={stock.invoiceNumber}
        onChange={(e) => setStock({ ...stock, invoiceNumber: e.target.value })}
        placeholder="Ej: 000A12"
      />
      <TextField
        flex="1"
        label="Comentarios"
        value={stock.comments}
        onChange={(e) => setStock({ ...stock, comments: e.target.value })}
      />
    </FieldsContainer>
  );

  return (
    <FlexColumn $rowGap="15px">
      <FormProvider {...filterMethods}>
        <Form onSubmit={onSubmit}>
          <FlexColumn $rowGap="15px">
            <Flex $justifyContent="space-between">
              <Header center>Movimientos de stock</Header>
              <Flex $columnGap="15px">
                <Button labelPosition="left" icon={ICONS.ARROW_DOWN} color={COLORS.GREEN} content="Ingreso" onClick={() => {
                  setStock(EMPTY_STOCK());
                  setModalMode("add");
                  setShowModal(true);
                }} />
                <Button labelPosition="left" icon={ICONS.ARROW_UP} color={COLORS.RED} content="Egreso" onClick={() => {
                  setStock(EMPTY_STOCK());
                  setModalMode("out");
                  setShowModal(true);
                }} />
                <Message padding="0.5rem 1rem" margin="0" color={COLORS.BLUE} >
                  <Icon name={ICONS.BOX} /> Stock Total: {totalStock}
                </Message>
              </Flex>
            </Flex>
            <Filters entity="STOCK" onRefetch={() => { }} onRestoreFilters={onRestoreFilters} update={false}>
              <DropdownControlled
                width="200px"
                name="type"
                options={STOCK_TYPE_OPTIONS}
                defaultValue={EMPTY_STOCK_FILTERS.type}
                afterChange={() => {
                  onSubmit();
                }}
              />
              <TextControlled name="invoiceNumber" placeholder="Detalle" width="200px" />
              <TextControlled name="comments" placeholder="Comentarios" width="300px" />
            </Filters>
          </FlexColumn>
        </Form>
      </FormProvider>

      <FormProvider {...methods}>
        <Form onKeyDown={preventSend}>
          <Table
            paginate
            headers={STOCK_TABLE_HEADERS}
            elements={elementsWithActions}
            actions={(element) => element._actions}
            $deleteButtonInside
            onFilter={onFilter}
            filters={filters}
            setFilters={setFilters}
          />
        </Form>
      </FormProvider>

      <ModalAction
        title={getModalTitle()}
        titleIcon={MODAL_CONFIG[modalMode]?.icon}
        titleIconColor={MODAL_CONFIG[modalMode]?.color}
        confirmButtonText={MODAL_CONFIG[modalMode]?.confirmText}
        showModal={showModal}
        setShowModal={setShowModal}
        onConfirm={handleConfirm}
        noConfirmation={modalMode !== "delete"}
        bodyContent={modalMode !== "delete" && getModalContent()}
      />
    </FlexColumn>
  );
};

export default ProductStock;
