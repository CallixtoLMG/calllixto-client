import { Button, FieldsContainer, Flex, FlexColumn, FormField, Icon, Message } from "@/common/components/custom";
import { DropdownControlled, NumberField, TextControlled, TextField } from "@/common/components/form";
import { DatePicker } from "@/common/components/form/DatePicker";
import { ModalAction } from "@/common/components/modals";
import { Filters, Table } from "@/common/components/table";
import { ALL, COLORS, ICONS, IN, OUT, RULES as VALIDATE_RULES } from "@/common/constants";
import { createFilter } from "@/common/utils";
import { useFilters } from "@/hooks";
import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { EMPTY_STOCK, EMPTY_STOCK_FILTERS, PRODUCTS_FILTERS_KEY, STOCK_FLOWS_MODAL_CONFIG, STOCK_MODAL_MODES, STOCK_TABLE_HEADERS, STOCK_TYPE_OPTIONS } from "../products.constants";
import { Header } from "./styles";

const ProductStock = ({ onCreateStockFlow, product, isLoading, stockFlows }) => {

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    setFilters,
    methods: filterMethods,
  } = useFilters({ defaultFilters: EMPTY_STOCK_FILTERS, key: PRODUCTS_FILTERS_KEY });

  const onFilter = createFilter(filters, {
    invoiceNumber: {},
    comments: {},
    type: {
      skipAll: true,
      custom: (item) => {
        const type = filters.type;

        if (type === ALL) return true;
        if (type === IN) return item.inflow === true;
        if (type === OUT) return item.inflow === false;

        return true;
      },
    },
  });
  const [showModal, setShowModal] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [modalMode, setModalMode] = useState();
  const [stock, setStock] = useState(EMPTY_STOCK());

  const isValidStockInput = () => {
    const hasDate = stock.date instanceof Date && !isNaN(stock.date);
    const amount = Number(stock.amount);
    const hasAmount = Number.isFinite(amount) && amount >= 1;
    return hasDate && hasAmount;
  };

  const resetModalState = () => {
    setShowErrors(false);
    setShowModal(false);
    setModalMode(undefined);
    setStock(EMPTY_STOCK());
  };

  const handleConfirm = () => {
    setShowErrors(true);

    if (!isValidStockInput()) return;

    if (modalMode === STOCK_MODAL_MODES.ADD || modalMode === STOCK_MODAL_MODES.OUT) {
      onCreateStockFlow({
        product,
        quantity: Math.abs(Number(stock.amount)),
        date: stock.date,
        inflow: modalMode === STOCK_MODAL_MODES.ADD,
        comments: stock.comments || undefined,
        invoiceNumber: stock.invoiceNumber || undefined,
      });
    }

    setShowErrors(false);
    setShowModal(false);
    setStock(EMPTY_STOCK());
  };

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
      <NumberField
        width="150px"
        label="Cantidad"
        value={stock.amount}
        placeholder="Ej: 50"
        onChange={(value) =>
          setStock({ ...stock, amount: value })
        }
        error={
          showErrors && (!stock.amount || Number(stock.amount) <= 0)
            ? "Debe ingresar una cantidad mayor a 0."
            : undefined
        }
      />

      <TextField
        width="150px"
        label="Factura"
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
      <FlexColumn $rowGap="15px">
        <Flex $justifyContent="space-between">
          <Header center>Movimientos de stock</Header>
          <Flex $columnGap="15px">
            <Button
              labelPosition="left"
              icon={ICONS.ARROW_DOWN}
              color={COLORS.GREEN}
              content="Ingreso"
              disabled={isLoading}
              onClick={() => {
                setStock(EMPTY_STOCK());
                setModalMode(STOCK_MODAL_MODES.ADD);
                setShowModal(true);
              }} />
            <Button
              labelPosition="left"
              icon={ICONS.ARROW_UP}
              color={COLORS.RED}
              content="Egreso"
              disabled={isLoading}
              onClick={() => {
                setStock(EMPTY_STOCK());
                setModalMode(STOCK_MODAL_MODES.OUT);
                setShowModal(true);
              }} />
            <Message padding="0.5rem 1rem" margin="0" color={COLORS.BLUE} >
              <Icon name={ICONS.BOXES} /> Stock Total: {product?.stock ?? 0}
            </Message>
          </Flex>
        </Flex>
        <FormProvider {...filterMethods}>
          <Form onSubmit={onSubmit}>
            <Filters entity="STOCK" onRestoreFilters={onRestoreFilters}>
              <DropdownControlled
                width="fit-content"
                name="type"
                options={STOCK_TYPE_OPTIONS}
                label="Tipo"
                defaultValue={EMPTY_STOCK_FILTERS.type}
                afterChange={() => {
                  onSubmit();
                }}
              />
              <TextControlled name="invoiceNumber" label="N° Factura" placeholder="A0001" width="150px" />
              <TextControlled name="comments" label="Comentarios" placeholder="Uso interno" width="200px" />
            </Filters>
          </Form>
        </FormProvider>
      </FlexColumn>
      <Table
        paginate
        headers={STOCK_TABLE_HEADERS}
        elements={stockFlows}
        $deleteButtonInside
        onFilter={onFilter}
        filters={filters}
        setFilters={setFilters}
      />
      <ModalAction
        title={STOCK_FLOWS_MODAL_CONFIG[modalMode]?.title}
        isLoading={isLoading}
        titleIcon={STOCK_FLOWS_MODAL_CONFIG[modalMode]?.icon}
        titleIconColor={STOCK_FLOWS_MODAL_CONFIG[modalMode]?.color}
        confirmButtonText={STOCK_FLOWS_MODAL_CONFIG[modalMode]?.confirmText}
        showModal={showModal}
        setShowModal={(open) => {
          if (!open) resetModalState();
        }}
        onConfirm={handleConfirm}
        noConfirmation
        bodyContent={getModalContent()}
      />
    </FlexColumn>
  );
};

export default ProductStock;