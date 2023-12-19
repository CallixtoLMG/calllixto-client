import { SHOW_PRODUCTS_HEADERS } from "@/components/budgets/budgets.common";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button as SButton, Dropdown as SDropdown, Form, Icon, Table } from "semantic-ui-react";
import {
  Button,
  Dropdown,
  Input,
  Cell,
  HeaderCell,
  TotalText,
  WarningMessage
} from "./styles";
import { formatedPrice, getTotal, getTotalSum } from "@/utils";

const BudgetForm = ({ onSubmit, products, customers }) => {
  const router = useRouter();
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
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

  const deleteProduct = (index) => {
    const newProducts = [...watchProducts];
    newProducts.splice(index, 1);
    setValue("products", newProducts);
  };

  const handleCreate = (data) => {
    onSubmit(data);
    setTimeout(() => {
      router.push(PAGES.BUDGETS.BASE);
    }, 500);
  };

  const calculateTotal = useCallback(() => getTotalSum(watchProducts), [watchProducts]);

  return (
    <Form onSubmit={handleSubmit(handleCreate)}>
      <Dropdown
        name={`customer`}
        placeholder='Clientes...'
        search
        selection
        minCharacters={2}
        noResultsMessage="No se ha encontrado cliente!"
        options={customers}
        onChange={(e, { value }) => {
          const customer = customers.find((opt) => opt.value === value);
          setValue(`customer.name`, customer.value);
          setValue(`customer.id`, customer.id);
        }}
      />
      <Button
        color="green"
        type="button"
        onClick={addProduct}
      >
        <Icon name="add" />Agregar producto
      </Button>
      <Table celled striped compact>
        <Table.Header>
          {SHOW_PRODUCTS_HEADERS.map((header) => {
            return (<HeaderCell $header key={header.id} >{header.name}</HeaderCell>)
          })}
        </Table.Header>
        <Table.Body>
          {watchProducts.map((product, index) => (
            <Table.Row key={`${product.code}-${index}`}>
              <Cell>
                <Controller
                  name={`products[${index}].name`}
                  control={control}
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
                          setTotal(calculateTotal());
                        }}
                      />
                      {triedToAddWithoutSelection && !watchProducts[index].code && (
                        <WarningMessage> Debe seleccionar un producto </WarningMessage>
                      )}
                    </>
                  )}
                />
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
                        setTotal(calculateTotal());
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
                        setTotal(calculateTotal());
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
                  onClick={() => deleteProduct(index)}
                  type="button"
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
      >
        <Icon name="add" />Crear presupuesto
      </Button>
    </Form>
  );
};

export default BudgetForm;
