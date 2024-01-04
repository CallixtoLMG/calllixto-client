import { BUDGET_FORM_PRODUCT_COLUMNS, PAYMETHOD } from "@/components/budgets/budgets.common";
import { SendButton, SubmitAndRestore } from "@/components/common/buttons";
import { Button, ButtonsContainer, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { Cell } from "@/components/common/table";
import { PAGES } from "@/constants";
import { formatProductCode, formatedPercentage, formatedPhone, formatedPrice, getTotal, getTotalSum } from "@/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Icon, Popup, Button as SButton, Table } from "semantic-ui-react";
import ProductSearch from "../../common/search/search";
import { HeaderCell, TotalText, } from "./styles";
import { NoPrint, OnlyPrint } from "@/components/layout";
import PDFfile from "../PDFfile";

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: {
    name: '',
    address: '',
    phone: ''
  },
  products: [],
});

const BudgetForm = ({ onSubmit, products, customers, budget, user, readonly }) => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, setValue, watch, reset, formState: { isDirty, errors } } = useForm({
    defaultValues: budget ? {
      ...budget,
      seller: `${user?.firstName} ${user?.lastName}`
    } : EMPTY_BUDGET(user),
  });

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
  }, [watchProducts, calculateTotal])

  const handleCreate = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      push(PAGES.BUDGETS.BASE);
    }, 2000);
  };

  return (
    <>
      <NoPrint>
        <Form onSubmit={handleSubmit(handleCreate)}>
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
              <Label>Cliente</Label>
              {!readonly ? (
                <Controller
                  name={`customer.name`}
                  control={control}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Dropdown
                      name={`customer`}
                      placeholder='Clientes'
                      search
                      selection
                      minCharacters={2}
                      noResultsMessage="No se ha encontrado cliente!"
                      options={customers}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                        const customer = customers.find((opt) => opt.value === value);
                        setValue('customer.id', customer.id);
                        setValue('customer.address', customer.address ?? '');
                        setValue('customer.phone', customer.phone ?? '')
                      }}
                    />
                  )}
                />
              ) : (
                <Segment>{budget?.customer?.name}</Segment>
              )}
            </FormField>
            <FormField flex={1}>
              <Label>Dirección</Label>
              {!readonly ? (
                <Controller
                  name="customer.address"
                  control={control}
                  render={({ field: { value } }) => <Segment>{value}</Segment>}
                />
              ) : (
                <Segment>{budget?.customer?.address}</Segment>
              )}
            </FormField>
            <FormField width="200px">
              <Label>Teléfono</Label>
              {!readonly ? (
                <Controller
                  name="customer.phone"
                  control={control}
                  render={({ field: { value } }) => <Segment>{formatedPhone(value?.areaCode, value?.number)}</Segment>}
                />
              ) : (
                <Segment>{formatedPhone(budget?.customer?.phone?.areaCode, budget?.customer?.phone?.number)}</Segment>
              )}
            </FormField>
          </FieldsContainer>
          {!readonly ? (
            <FormField width="300px">
              <Label>Agregar Producto</Label>
              <ProductSearch
                products={products}
                onProductSelect={(selectedProduct) => {
                  setValue("products", [...watchProducts, selectedProduct])
                }}
              />
            </FormField>) : ("")}
          <Table celled striped compact>
            <Table.Header>
              <Table.Row>
                {BUDGET_FORM_PRODUCT_COLUMNS.map((column) => {
                  if (!column.hide?.(readonly)) return <HeaderCell $header key={column.id} >{column.title}</HeaderCell>;
                })}
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {watchProducts.map((product, index) => (
                <Table.Row key={`${product.code}-${index}`}>
                  <Cell align="left">
                    {product.name}
                  </Cell>
                  <Cell>
                    <Popup
                      size="tiny"
                      trigger={<span>{formatProductCode(product.code).formattedCode.substring(0, 2)}</span>}
                      position="top center"
                      on="hover"
                      content={`Brand: ${product.brandName}`}
                    />
                    {'-'}
                    <Popup
                      size="tiny"
                      trigger={<span>{formatProductCode(product.code).formattedCode.substring(3, 5)}</span>}
                      position="top center"
                      on="hover"
                      content={`Supplier: ${product.supplierName}`}
                    />
                    {'-'}
                    <span>{formatProductCode(product.code).formattedCode.substring(6)}</span>
                  </Cell>
                  <Cell width={2}>
                    {product.supplierCode}
                  </Cell>
                  <Cell width={1}>
                    {formatedPrice(product.price, product.brand)}
                  </Cell>
                  <Cell width={1}>
                    {!readonly ? (
                      <Controller
                        name={`products[${index}].quantity`}
                        control={control}
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
                        onClick={() => { watchProducts.length > 1 && deleteProduct(index) }}
                        type="button"
                        disabled={watchProducts.length <= 1}
                      />
                    </Cell>
                  )}
                </Table.Row>
              ))}
            </Table.Body>
            <Table.Footer>
              <Table.Row>
                <HeaderCell $right colSpan="6">
                  <TotalText>Total</TotalText>
                </HeaderCell>
                <HeaderCell $nonBorder>
                  <TotalText>{formatedPrice(total)}</TotalText>
                </HeaderCell>
                {!readonly && <HeaderCell />}
              </Table.Row>
            </Table.Footer>
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
            <FormField width="10">
              <Label>Metodos de pago</Label>
              {!readonly ? (
                <Controller
                  name={`paymentMethods`}
                  control={control}
                  rules={{ required: true }}
                  defaultValue={PAYMETHOD.map((method) => method.value)}
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
                      options={PAYMETHOD}
                      value={field.value}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                      }}
                    />
                  )}
                />
              ) : (
                <Segment>{budget?.customer?.name}</Segment>
              )}
            </FormField>
            <FormField flex="1">
              <RuledLabel title="Fecha de vencimiento" message={errors?.email?.message} />
              {!readonly ? (
                <Controller
                  name="expirationOffsetDays"
                  control={control}
                  render={({ field }) => <Input {...field} placeholder="Cantidad en días(p. ej: 3,10,12,etc)" />}
                />
              ) : (
                <Segment>{budget?.expirationOffsetDays}</Segment>
              )}
            </FormField>
          </FieldsContainer>
          {!readonly && (
            <SubmitAndRestore
              show={!readonly}
              isLoading={isLoading}
              isDirty={isDirty}
              onClick={() => reset(EMPTY_BUDGET(user))}
            />
          )}
        </Form>
        {readonly && (
          <ButtonsContainer marginTop="15px">
            <Button onClick={() => window.print()} color="blue">
              <Icon name="download" />Descargar PDF
            </Button>
            {(budget?.customer?.phone || budget?.customer?.email) && (
              <SendButton customerData={budget?.customer} />
            )}
          </ButtonsContainer>
        )}
      </NoPrint>
      <OnlyPrint>
        <PDFfile budget={budget} />
      </OnlyPrint>
    </>
  );
};

export default BudgetForm;
