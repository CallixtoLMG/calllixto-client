import { BUDGET_FORM_PRODUCT_COLUMNS, PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { SendButton, SubmitAndRestore } from "@/components/common/buttons";
import { Button, ButtonsContainer, Checkbox, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { Cell, TableFooter, TableHeader } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { PAGES, RULES } from "@/constants";
import { actualDate, expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedPhone, formatedPrice, getTotal, getTotalSum } from "@/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Icon, Popup, Button as SButton, Table } from "semantic-ui-react";
import ProductSearch from "../../common/search/search";
import PDFfile from "../PDFfile";
import ModalConfirmation from "./ModalConfirmation";
import ModalCustomer from "./ModalCustomer";
import { HeaderCell, TotalText } from "./styles";

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: {
    name: '',
    address: '',
    phone: ''
  },
  products: [],
  comments: '',
  paymentMethods: PAYMENT_METHODS.map((method) => method.value),
  expirationOffsetDays: ""
});

const BudgetForm = ({ onSubmit, products, customers, budget, user, readonly }) => {
  const formattedPaymentMethods = budget?.paymentMethods.join(' - ');
  const { push } = useRouter();
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [customerData, setCustomerData] = useState(budget?.customer);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expiration, SetExpiration] = useState(false);
  const [isConfirmChecked, setIsConfirmChecked] = useState(false);
  const { control, handleSubmit, setValue, watch, reset, formState: { isDirty, errors, isSubmitted } } = useForm({

    defaultValues: budget ? {
      ...budget,
      seller: `${user?.firstName} ${user?.lastName}`
    } : EMPTY_BUDGET(user),
  });
  const customerRef = useRef(null);

  const watchProducts = watch('products');
  const [total, setTotal] = useState(0);
  const calculateTotal = useCallback(() => {
    setTotal(getTotalSum(watchProducts), [watchProducts]);
  }, [setTotal, watchProducts]);

  const deleteProduct = useCallback((index) => {
    const newProducts = [...watchProducts];
    newProducts.splice(index, 1);
    setValue("products", newProducts);
  }, [watchProducts, setValue]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const handleCreate = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      push(PAGES.BUDGETS.BASE);
    }, 2000);
  };

  const handleReset = useCallback(() => {
    customerRef.current.clearValue();
    reset(EMPTY_BUDGET(user));
  }, [reset, user]);

  const handleCheckboxChange = (e) => {
    if (!budget?.customer?.address && !budget?.customer?.phone?.areaCode && !budget?.customer?.phone?.number) {
      setIsModalCustomerOpen(true);
    } else {
      setIsModalConfirmationOpen(true);
    };
  };

  const handleModalCustomerClose = (openNextModal, customer) => {
    setIsModalCustomerOpen(false);
    if (openNextModal) {
      setCustomerData(customer)
      setIsModalConfirmationOpen(true);
    };
  };

  const handleModalConfirmationClose = (confirmed) => {
    setIsModalConfirmationOpen(false);
    if (confirmed) {
      setIsConfirmChecked(true);
    };
  };

  return (
    <>
      <NoPrint>
        {readonly && (
          <>
            <ModalCustomer
              budgetId={budget.id}
              readonly={readonly}
              isModalOpen={isModalCustomerOpen}
              onClose={handleModalCustomerClose}
              customer={budget.customer}
              setIsConfirmChecked={setIsConfirmChecked}
            />
            <ModalConfirmation
              budgetId={budget.id}
              readonly={readonly}
              isModalOpen={isModalConfirmationOpen}
              onClose={handleModalConfirmationClose}
              customer={customerData}
            />
          </>
        )}
        <Form onSubmit={handleSubmit(handleCreate)} >
          <FieldsContainer>
            <FormField width="300px">
              <Controller
                name="confirmed"
                control={control}
                render={({ field: { value } }) => (
                  <Checkbox
                    toggle
                    checked={isConfirmChecked || value}
                    readOnly={value}
                    onChange={handleCheckboxChange}
                    label={value ? "Confirmado" : "Confirmar presupuesto"}
                  />
                )}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <Label>Vendedor</Label>
              {!readonly ? (
                <Controller
                  name="seller"
                  control={control}
                  rules={{ required: 'Campo requerido' }}
                  render={({ field: { value } }) => <Segment>{value}</Segment>}
                />
              ) : (
                <Segment>{budget?.seller}</Segment>
              )}
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <RuledLabel title="Cliente" message={errors?.customer?.name?.message} required />
              {!readonly ? (
                <Controller
                  name={`customer.name`}
                  control={control}
                  rules={RULES.REQUIRED}
                  render={({ field }) => (
                    <Dropdown
                      name={`customer`}
                      placeholder='Clientes'
                      search
                      selection
                      minCharacters={2}
                      noResultsMessage="No se ha encontrado cliente!"
                      options={customers}
                      ref={customerRef}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                        const customer = customers.find((opt) => opt.value === value);
                        setValue('customer.id', customer?.id);
                        setValue('customer.address', customer?.address ?? '');
                        setValue('customer.phone', customer?.phone ?? '')
                      }}
                    />
                  )}
                />
              ) : (
                <Segment>{budget?.customer?.name}</Segment>
              )}
            </FormField>
            <FormField width={5}>
              <RuledLabel title="Dirección" message={errors?.customer?.address?.message} required={isConfirmChecked} />
              {!readonly ? (
                <Controller
                  name="customer.address"
                  control={control}
                  rules={isConfirmChecked && RULES.REQUIRED}
                  render={({ field: { value } }) => <Segment>{value}</Segment>}
                />
              ) : (
                <Segment>{customerData?.address}</Segment>
              )}
            </FormField>
            <FormField width="200px">
              <RuledLabel title="Teléfono" message={errors?.customer?.phone?.message} required={isConfirmChecked} />
              {!readonly ? (
                <Controller
                  name="customer.phone"
                  control={control}
                  rules={isConfirmChecked && RULES.REQUIRED}
                  render={({ field: { value } }) => <Segment>{formatedPhone(value?.areaCode, value?.number)}</Segment>}
                />
              ) : (
                <Segment>{formatedPhone(customerData?.phone?.areaCode, customerData?.phone?.number)}</Segment>
              )}
            </FormField>
          </FieldsContainer>
          {!readonly ? (
            <FormField width="300px">
              <RuledLabel title="Agregar producto" message={!watchProducts.length && isSubmitted && isDirty && 'Al menos 1 producto es requerido'} required />
              <ProductSearch
                products={products}
                onProductSelect={(selectedProduct) => {
                  setValue("products", [...watchProducts, { ...selectedProduct, quantity: 1 }])
                }}
              />
            </FormField>) : ("")}
          <Table celled striped compact>
            <TableHeader>
              <Table.Row>
                {BUDGET_FORM_PRODUCT_COLUMNS.map((column) => {
                  if (!column.hide?.(readonly)) return <HeaderCell $header key={column.id} >{column.title}</HeaderCell>;
                })}
              </Table.Row>
            </TableHeader>
            <Table.Body>
              {watchProducts.map((product, index) => (
                <Table.Row key={`${product.code}-${index}`}>
                  <Cell align="left">
                    {product.name}
                  </Cell>
                  <Cell width={2}>
                    <Popup
                      size="tiny"
                      trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(0, 2)}</span>}
                      position="top center"
                      on="hover"
                      content={product.brandName}
                    />
                    {'-'}
                    <Popup
                      size="tiny"
                      trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(3, 5)}</span>}
                      position="top center"
                      on="hover"
                      content={product.supplierName}
                    />
                    {'-'}
                    <span>{formatProductCodePopup(product.code).formattedCode.substring(6)}</span>
                  </Cell>
                  <Cell width={1}>
                    {formatedPrice(product.price, product.brand)}
                  </Cell>
                  <Cell width={1}>
                    {!readonly ? (
                      <Controller
                        name={`products[${index}].quantity`}
                        control={control}
                        rules={RULES.REQUIRED}
                        render={({ field }) => (
                          <Input
                            type="number"
                            min={0}
                            defaultValue={1}
                            height="40px"
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(value);
                              calculateTotal();
                              console.log(errors)
                            }}
                          />
                        )}
                      />
                    ) : (
                      <p>{product?.quantity}</p>
                    )}
                  </Cell>
                  <Cell width={1}>
                    {!readonly ? (
                      <Controller
                        name={`products[${index}].discount`}
                        control={control}
                        defaultValue={product.discount || 0}
                        render={({ field }) => (
                          <Input
                            fluid
                            type="number"
                            min={0}
                            max={100}
                            height="40px"
                            {...field}
                            onChange={(e) => {
                              field.onChange(e.target.value);
                              calculateTotal();
                            }}
                          />
                        )}
                      />
                    ) : (
                      <p>{formatedPercentage(product?.discount)}</p>
                    )}
                  </Cell>
                  <Cell width={2}>
                    {formatedPrice(getTotal(product))}
                  </Cell>
                  {!readonly && (
                    <Cell width={1}>
                      <SButton
                        icon="trash"
                        color="red"
                        onClick={() => { deleteProduct(index) }}
                        type="button"
                      />
                    </Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
            <TableFooter>
              <Table.Row>
                <HeaderCell $right colSpan="5">
                  <TotalText>Total</TotalText>
                </HeaderCell>
                <HeaderCell $nonBorder>
                  <TotalText>{formatedPrice(total)}</TotalText>
                </HeaderCell>
                {!readonly && <HeaderCell />}
              </Table.Row>
            </TableFooter>
          </Table>
          <FieldsContainer>
            <Label>Comentarios</Label>
            <Controller
              name="comments"
              control={control}
              render={({ field }) => (
                <TextArea
                  {...field}
                  maxLength="2000"
                  placeholder="Comentarios"
                  disabled={readonly}
                  readonly
                />
              )}
            />
          </FieldsContainer>
          <FieldsContainer>
            <FormField flex={3}>
              <Label>Metodos de pago</Label>
              {!readonly ? (
                <Controller
                  name={`paymentMethods`}
                  control={control}
                  rules={{ required: true }}
                  defaultValue={PAYMENT_METHODS.map((method) => method.value)}
                  render={({ field }) => (
                    <Dropdown
                      minHeight="50px"
                      height="fit-content"
                      name={`paymentMethods`}
                      placeholder='Metodos de pago'
                      multiple
                      selection
                      fluid
                      minCharacters={2}
                      noResultsMessage="No se ha encontrado metodo!"
                      options={PAYMENT_METHODS}
                      value={field.value}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              ) : (
                <Segment >{formattedPaymentMethods}</Segment>
              )}
            </FormField>
            {!readonly ? (
              <>
                <FormField flex={1} >
                  <RuledLabel title="Días para el vencimiento" message={errors?.expirationOffsetDays?.message} required />
                  <Controller
                    name="expirationOffsetDays"
                    control={control}
                    rules={RULES.REQUIRED_THREE_NUMBERS}
                    render={({ field }) =>
                      <Input
                        maxLength={50}
                        {...field}
                        placeholder="Cantidad en días(p. ej: 3, 10, 30, etc)"
                        onChange={(e, { value }) => {
                          field.onChange(value);
                          SetExpiration(value);
                        }}
                      />}
                  />
                </FormField>
                <FormField flex={1}>
                  <Label>Fecha de vencimiento</Label>
                  <Segment>{formatedDateOnly(expirationDate(actualDate.format(), expiration || 0))}</Segment>
                </FormField>
              </>
            ) : (
              <FormField flex={1}>
                <Label>Fecha de vencimiento</Label>
                <Segment>{formatedDateOnly(expirationDate(actualDate.format(), expiration || 0))}</Segment>
              </FormField>
            )}
          </FieldsContainer>
          {!readonly && (
            <SubmitAndRestore
              show={!readonly}
              isLoading={isLoading}
              isDirty={isDirty}
              onClick={handleReset}
            />
          )}
        </Form >
        {readonly && (
          <ButtonsContainer marginTop="15px">
            <Button onClick={() => window.print()} color="blue">
              <Icon name="download" />Descargar PDF
            </Button>
            {(budget?.customer?.phone || budget?.customer?.email) && (
              <SendButton customerData={budget?.customer} />
            )}
          </ButtonsContainer>
        )
        }
      </NoPrint >
      <OnlyPrint>
        <PDFfile total={total} budget={budget} />
      </OnlyPrint>
    </>
  );
};

export default BudgetForm;