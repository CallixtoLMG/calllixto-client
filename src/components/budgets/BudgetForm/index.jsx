import { GET_BUDGET_QUERY_KEY, LIST_BUDGETS_QUERY_KEY, edit } from "@/api/budgets";
import { PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { SendButton, SubmitAndRestore } from "@/components/common/buttons";
import { Button, ButtonsContainer, Checkbox, CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { RULES } from "@/constants";
import { actualDate, cleanValue, expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedSimplePhone, getTotal, getTotalSum, now, removeDecimal } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Box, Flex } from "rebass";
import { Icon, Popup } from "semantic-ui-react";
import ProductSearch from "../../common/search/search";
import PDFfile from "../PDFfile";
import ModalConfirmation from "./ModalConfirmation";
import ModalCustomer from "./ModalCustomer";
import { Container } from "./styles";

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: {
    name: '',
    address: '',
    phone: ''
  },
  products: [],
  comments: '',
  confirmed: false,
  globalDiscount: 0,
  paymentMethods: PAYMENT_METHODS.map((method) => method.value),
  expirationOffsetDays: ''
});

const BudgetForm = ({ onSubmit, products, customers, budget, user, readonly, isLoading }) => {
  console.log("budget", budget)
  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const [isModalCustomerOpen, setIsModalCustomerOpen] = useState(false);
  const [customerData, setCustomerData] = useState(budget?.customer);
  const [isModalConfirmationOpen, setIsModalConfirmationOpen] = useState(false);
  const [expiration, SetExpiration] = useState(false);
  const { control, handleSubmit, setValue, watch, reset, formState: { isDirty, errors, isSubmitted } } = useForm({
    defaultValues: budget ? {
      globalDiscount: budget?.globalDiscount,
      ...budget,
      confirmed: budget?.confirmed,
      seller: `${user?.firstName} ${user?.lastName}`,
    } : EMPTY_BUDGET(user),

  });
  console.log(budget)
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const queryClient = useQueryClient();
  const watchProducts = watch('products');
  const watchGlobalDiscount = watch('globalDiscount', 0);
  const watchConfirmed = watch('confirmed');
  const [total, setTotal] = useState(0);

  const calculateTotal = useCallback(() => {
    const totalSum = getTotalSum(watchProducts, watchGlobalDiscount);
    setTotal(totalSum);
  }, [watchProducts, watchGlobalDiscount]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const deleteProduct = useCallback((index) => {
    const newProducts = [...watchProducts];
    newProducts.splice(index, 1);
    setValue("products", newProducts);
  }, [watchProducts, setValue]);

  const actions = readonly ? [] : [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (element, index) => {
        deleteProduct(index);
      },
      tooltip: 'Eliminar'
    }
  ];

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const handleCreate = (data) => {
    if (!watchProducts.length) return;
    onSubmit(data);
  };

  const handleReset = useCallback(() => {
    setSelectedCustomer(null);
    reset(EMPTY_BUDGET(user));
  }, [reset, user]);

  const handleCheckboxChange = () => {
    if (!budget?.customer?.addresses[0] || !budget?.customer?.phoneNumbers[0]?.areaCode || !budget?.customer?.phoneNumbers[0]?.number) {
      setIsModalCustomerOpen(true);
      return;
    }
    setIsModalConfirmationOpen(true);
  };

  const handleModalCustomerClose = (openNextModal, customer) => {
    setIsModalCustomerOpen(false);
    if (openNextModal) {
      setCustomerData(customer);
      setIsModalConfirmationOpen(true);
    }
  };

  const handleModalConfirmationClose = () => {
    setIsModalConfirmationOpen(false);
  };

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Código",
        value: (product) => (
          <>
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
          </>
        ),
        id: 1,
        width: 1,
        align: 'left'
      },
      {
        title: "Nombre",
        value: (product) => (
          <Container>
            {product.name}
            {product.comments && (
              <Popup
                size="mini"
                content={product.comments}
                position="top center"
                trigger={
                  <Box marginX="5px">
                    <Icon name="info circle" color="yellow" />
                  </Box>
                }
              />
            )}
          </Container>
        ),
        id: 2,
        width: 7,
        align: 'left'
      },
      {
        title: "Precio",
        value: (product) => (
          <Flex alignItems="center" justifyContent="space-between">
            $
            <CurrencyFormatInput
              displayType="text"
              thousandSeparator={true}
              fixedDecimalScale={true}
              decimalScale={2}
              value={product.price}
            />
          </Flex>
        ),
        id: 3,
        width: 2,
      },
      {
        title: "Cantidad", value: (product, index) => (
          <>
            {!readonly ? (
              <Controller
                name={`products[${index}].quantity`}
                control={control}
                rules={RULES.REQUIRED}
                render={({ field: { onChange, ...rest } }) => (
                  <CurrencyFormatInput
                    {...rest}
                    height="35px"
                    shadow
                    thousandSeparator={true}
                    decimalScale={1}
                    displayType="input"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      const cleanedValue = cleanValue(rawValue);
                      if (cleanedValue < 0) {
                        onChange(Math.abs(cleanedValue));
                        return;
                      }
                      onChange(cleanedValue);
                      calculateTotal();
                    }}
                  />
                )}
              />
            ) : (
              <p>{product?.quantity}</p>
            )}
          </>
        ),
        id: 4,
        width: 2
      },
      {
        title: "Descuento",
        value: (product, index) => (
          <>
            {!readonly ? (
              <Controller
                name={`products[${index}].discount`}
                control={control}
                defaultValue={product.discount || 0}
                render={({ field: { onChange, ...rest } }) => (
                  <Input
                    {...rest}
                    height="35px"
                    center
                    fluid
                    type="number"
                    onFocus={(e) => e.target.select()}
                    onChange={(e) => {
                      let value = removeDecimal(e.target.value);
                      if (value > 100) return;
                      if (value < 0) {
                        onChange(Math.abs(value));
                        return;
                      }
                      onChange(value);
                      calculateTotal();
                    }}
                  />
                )}
              />
            ) : (
              <p>{formatedPercentage(product?.discount)}</p>
            )}
          </>
        ),
        id: 5,
        width: 1
      },
      {
        title: "Total",
        value: (product) => (
          <Flex alignItems="center" justifyContent="space-between">
            $
            <CurrencyFormatInput
              displayType="text"
              thousandSeparator={true}
              fixedDecimalScale={true}
              decimalScale={2}
              value={getTotal(product)}
            />
          </Flex>
        ),
        id: 6,
        width: 3
      },
    ];
  }, [control, calculateTotal, readonly]);

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const confirmationData = { confirmedBy: `${user.firstName} ${user.lastName}`, confirmedAt: now() };
      const { data } = await edit(confirmationData, budget?.id);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BUDGETS_QUERY_KEY] });
        queryClient.invalidateQueries({ queryKey: [GET_BUDGET_QUERY_KEY, budget?.id] });
        toast.success('Presupuesto confirmado!');
        setValue('confirmed', true);
        setIsModalConfirmationOpen(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <>
      <NoPrint>
        {readonly && (
          <>
            <ModalCustomer
              isModalOpen={isModalCustomerOpen}
              onClose={handleModalCustomerClose}
              customer={budget.customer}
            />
            <ModalConfirmation
              isModalOpen={isModalConfirmationOpen}
              onClose={handleModalConfirmationClose}
              customer={customerData}
              onConfirm={mutate}
              isLoading={isPending}
            />
          </>
        )}
        <Form onSubmit={handleSubmit(handleCreate)} >
          <FieldsContainer>
            <FormField width="300px">
              <Controller
                name="confirmed"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox
                    {...rest}
                    toggle
                    readOnly={readonly && value}
                    checked={value}
                    onChange={() => {
                      if (readonly) {
                        handleCheckboxChange();
                      } else {
                        onChange(!value);
                      }
                    }}
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
                  render={({ field: { value } }) => <Segment >{value}</Segment>}
                />
              ) : (
                <Segment >{budget?.seller}</Segment>
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
                      value={selectedCustomer}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                        const customer = customers.find((opt) => opt.value === value);
                        setValue('customer.id', customer?.id);
                        setValue('customer.address', customer?.addresses[0]?.address ?? '');
                        setValue('customer.phone', customer?.phoneNumbers[0] ?? '');
                        setSelectedCustomer(value);
                      }}
                    />
                  )}
                />
              ) : (
                <Segment >{budget?.customer?.name}</Segment>
              )}
            </FormField>
            <FormField width={5}>
              <RuledLabel title="Dirección" message={watchConfirmed && errors?.customer?.address?.message} required={watchConfirmed} />
              {!readonly ? (
                <Controller
                  name="customer.address"
                  control={control}
                  rules={watchConfirmed && RULES.REQUIRED}
                  render={({ field: { value } }) => <Segment >{value}</Segment>}
                />
              ) : (
                <Segment >{customerData?.addresses[0]?.address}</Segment>
              )}
            </FormField>
            <FormField width="200px">
              <RuledLabel title="Teléfono" message={errors?.customer?.phone?.message} required={watchConfirmed} />
              {!readonly ? (
                <Controller
                  name="customer.phone"
                  control={control}
                  rules={watchConfirmed && RULES.REQUIRED}
                  render={({ field: { value } }) => <Segment >{formatedSimplePhone(value)}</Segment>}
                />
              ) : (
                <Segment >{formatedSimplePhone(customerData?.phoneNumbers[0])}</Segment>
              )}
            </FormField>
          </FieldsContainer>
          {!readonly && (
            <FormField width="300px">
              <RuledLabel title="Agregar producto" message={!watchProducts?.length && isSubmitted && isDirty && 'Al menos 1 producto es requerido'} required />
              <ProductSearch
                products={products}
                onProductSelect={(selectedProduct) => {
                  setValue("products", [...watchProducts, { ...selectedProduct, quantity: 1, discount: 0, key: Date.now().toString(36) + selectedProduct.code }]);
                }}
              />
            </FormField>
          )}
          <Table
            mainKey="key"
            headers={BUDGET_FORM_PRODUCT_COLUMNS}
            elements={watchProducts}
            actions={actions}
            total={total}
            globalDiscount={watchGlobalDiscount}
            setGlobalDiscount={(value) => setValue('globalDiscount', value)}
            readOnly={readonly}
            showTotal={!!watchProducts.length}
          />
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
                      min
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
            {!readonly && (
              <>
                <FormField flex={1}>
                  <RuledLabel title="Días para el vencimiento" message={errors?.expirationOffsetDays?.message} required />
                  <Controller
                    name="expirationOffsetDays"
                    control={control}
                    rules={RULES.REQUIRED_THREE_NUMBERS}
                    render={({ field }) =>
                      <Input
                        {...field}
                        maxLength={50}
                        type="text"
                        placeholder="Cant. en días (p. ej: 3, 10, etc)"
                        onChange={(e) => {
                          let value = e.target.value;
                          value = value.replace(/\D/g, '');
                          field.onChange(value);
                          SetExpiration(value);
                        }}
                      />}
                  />
                </FormField>
              </>
            )}
            <FormField flex={1}>
              <Label>Fecha de vencimiento</Label>
              {!readonly ? (
                <Segment >{formatedDateOnly(expirationDate(actualDate.format(), expiration || 0))}</Segment>
              ) : (
                <Segment >{formatedDateOnly(expirationDate(budget?.createdAt, budget?.expirationOffsetDays))}</Segment>
              )}
            </FormField>
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
            {(budget?.customer?.phoneNumbers || budget?.customer?.email) && (
              <SendButton customerData={customerData} />
            )}
          </ButtonsContainer>
        )}
      </NoPrint >
      <OnlyPrint>
        <PDFfile total={total} budget={budget} client={user.client?.metadata} />
      </OnlyPrint>
    </>
  );
};

export default BudgetForm;