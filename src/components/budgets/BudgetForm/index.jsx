import { BUDGET_FORM_PRODUCT_COLUMNS } from "@/components/budgets/budgets.common";
import { PAGES } from "@/constants";
import { formatedPhone, formatedPrice, getTotal, getTotalSum } from "@/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon, Popup, Button as SButton, Dropdown as SDropdown, Table } from "semantic-ui-react";
import { Button, Input, Cell, Dropdown, FieldsContainer, FormField, HeaderCell, TotalText, WarningMessage, Label } from "./styles";
import { Flex, Box } from "rebass";
import { Segment } from "@/components/common/forms";

const BudgetForm = ({ onSubmit, products, customers, budget, user }) => {
  const { push } = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { control, handleSubmit, setValue, watch, formState: { isDirty } } = useForm({
    defaultValues: budget ? {
      ...budget,
      seller: `${user.firstName} ${user.lastName}`
    } : {
      seller: `${user.firstName} ${user.lastName}`,
      products: [
        {
          name: '',
          quantity: 1,
          discount: 0,
          price: 0,
        },
      ],
    },
  });

  const [triedToAddWithoutSelection, setTriedToAddWithoutSelection] = useState(false);
  const watchProducts = watch('products', [{
    name: '',
    price: 0,
    total: 0,
    quantity: 1,
    discount: 0,
  }]);
  const [total, setTotal] = useState(0);

  const addProduct = () => {
    const lastProduct = watchProducts[watchProducts.length - 1];
    if (lastProduct?.code || !lastProduct) {
      setValue('products', [
        ...watchProducts,
        { name: '', quantity: 1, discount: 0, price: 0 },
      ]);
      setTriedToAddWithoutSelection(false);
    } else {
      setTriedToAddWithoutSelection(true);
    };
  };

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
    <Form onSubmit={handleSubmit(handleCreate)}>
      <FieldsContainer>
        <FormField>
          <Label>Vendedor</Label>
          <Controller
            name="seller"
            control={control}
            rules={{ required: 'Campo requerido' }}
            render={({ field: { value }}) => <Segment>{value}</Segment>}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer marginY={15}>
        <FormField>
          <Label>Cliente</Label>
          <Controller
            name={`customer.name`}
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <Dropdown
                name={`customer`}
                placeholder='Clientes...'
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
        </FormField>
        <FormField flex={1}>
          <Label>Dirección</Label>
          <Controller
            name="customer.address"
            control={control}
            render={({ field: { value }}) => <Segment>{value}</Segment>}
          />
        </FormField>
        <FormField width="200px">
          <Label>Teléfono</Label>
          <Controller
            name="customer.phone"
            control={control}
            render={({ field: { value }}) => <Segment>{formatedPhone(value?.areaCode, value?.number)}</Segment>}
          />
        </FormField>
      </FieldsContainer>
      <Button
        color="green"
        type="button"
        onClick={addProduct}
      >
        <Icon name="add" />Agregar producto
      </Button>
      <Table celled striped compact>
        <Table.Header>
          {BUDGET_FORM_PRODUCT_COLUMNS.map((column) => (
            <HeaderCell $header key={column.id} >{column.title}</HeaderCell>
          ))}
        </Table.Header>
        <Table.Body>
          {watchProducts.map((product, index) => (
            <Table.Row key={`${product.code}-${index}`}>
              <Cell>
                <Flex alignItems="center">
                  <Controller
                    name={`products[${index}].name`}
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <>
                        <SDropdown
                          fluid
                          search
                          selection
                          noResultsMessage="No se ha encontrado producto!"
                          options={products}
                          {...field}
                          onChange={(e, { value }) => {
                            field.onChange(value);
                            const product = products.find((opt) => opt.value === value);
                            setValue(`products[${index}].price`, product.price);
                            setValue(`products[${index}].code`, product.code);
                            setValue(`products[${index}].quantity`, 1);
                            setValue(`products[${index}].comments`, product.comments);
                            calculateTotal();
                          }}
                        />
                        {triedToAddWithoutSelection && !watchProducts[index].code && (
                          <WarningMessage> Debe seleccionar un producto </WarningMessage>
                        )}
                      </>
                    )}
                  />
                  {product.comments && (
                    <Popup
                      size="mini"
                      content={product.comments}
                      position="top center"
                      trigger={
                        <Box marginX="5px">
                          <Icon name="info circle" color="red" size="large" />
                        </Box>
                      }
                    />
                  )}
                </Flex>
              </Cell>
              <Cell>
                {formatedPrice(product.price)}
              </Cell>
              <Cell>
                <Controller
                  name={`products[${index}].quantity`}
                  control={control}
                  render={({ field }) => (
                    <Input
                      type="number"
                      min={0}
                      defaultValue={1}
                      onChange={(e) => {
                        const value = e.target.value;
                        field.onChange(value);
                        calculateTotal();
                      }}
                    />
                  )}
                />
              </Cell>
              <Cell>
                {formatedPrice(product.price * product.quantity)}
              </Cell>
              <Cell>
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
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        calculateTotal();
                      }}
                    />
                  )}
                />
              </Cell>
              <Cell>
                {formatedPrice(getTotal(product))}
              </Cell>
              <Cell >
                <SButton
                  icon="trash"
                  color="red"
                  onClick={() => { watchProducts.length > 1 && deleteProduct(index) }}
                  type="button"
                  disabled={watchProducts.length <= 1}
                />
              </Cell>
            </Table.Row>
          ))}
        </Table.Body>
        <Table.Footer>
          <Table.Row>
            <HeaderCell $right colSpan="5">
              <TotalText>Total</TotalText>
            </HeaderCell>
            <HeaderCell $nonBorder>
              <TotalText>{formatedPrice(total)}</TotalText>
            </HeaderCell>
            <HeaderCell >
            </HeaderCell>
          </Table.Row>
        </Table.Footer>
      </Table>
      <Button
        floated="right"
        type="submit"
        color="green"
        disabled={isLoading || !isDirty}
        loading={isLoading}
      >
        <Icon name="add" />Crear presupuesto
      </Button>
    </Form>
  );
};

export default BudgetForm;
