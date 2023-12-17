import { SHOWPRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Button, Dropdown, Form, Icon, Table } from "semantic-ui-react";
import {
  HeaderContainer,
  ModButton,
  ModDropdown,
  ModInput, ModTableCell,
  ModTableFooter,
  ModTableHeaderCell,
  ModTableRow,
  TotalText,
  WarningMessage
} from "./styles";

const BudgetForm = ({ onSubmit, products, customers }) => {
  const router = useRouter();
  const { control, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      products: [
        {
          name: '',
          quantity: 1,
          discount: 0,
          price: '0',
          hasSelectedProduct: false,
        },
      ],
    },
  });
  const [triedToAddWithoutSelection, setTriedToAddWithoutSelection] = useState(false);
  const watchProducts = watch('products', [{
    name: '',
    price: "0",
    total: "0",
    quantity: 1,
    discount: 0,
    hasSelectedProduct: false,
  }]);

  const addProduct = () => {
    const lastProduct = watchProducts[watchProducts.length - 1];
    if (lastProduct.hasSelectedProduct) {
      setValue('products', [
        ...watchProducts,
        { name: '', quantity: 1, discount: 0, hasSelectedProduct: false, price: "0" },
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

  const calculateTotal = () => {
    let total = 0;
    watchProducts.forEach((product, index) => {
      const subtotal = watch(`products[${index}].total`) || 0;
      total += parseFloat(subtotal);
    });
    return total.toFixed(2);
  };

  const handleCreate = (data) => {
    onSubmit(data);
    setTimeout(() => {
      router.push(PAGES.BUDGETS.BASE);
    }, 500);
  };

  const locale = "es-AR"
  const currency = "ARS"

  return (
    <>
      <HeaderContainer>
        <PageHeader title={"Crear presupuesto"} />
      </HeaderContainer >
      <Form onSubmit={handleSubmit(handleCreate)}>
        <ModDropdown
          name={`customer`}
          placeholder='Clientes...'
          search
          selection
          minCharacters={2}
          noResultsMessage="No se ha encontrado cliente!"
          options={customers}
          onChange={(e, { name, value }) => {
            setValue(name, value);
            const customer = customers.find((opt) => opt.value === value);
            setValue(`customer.name`, customer.value);
            setValue(`customer.id`, customer.id);
          }}
        />
        <ModButton
          color="green"
          type="button"
          onClick={addProduct}
        >
          <Icon name="add" />Agregar producto
        </ModButton>
        <Table celled>
          <Table.Header>
            <ModTableRow>
              {SHOWPRODUCTSHEADERS.map((header) => {
                return (<ModTableHeaderCell $header key={header.id} >{header.name}</ModTableHeaderCell>)
              })}
            </ModTableRow>
          </Table.Header>
          <Table.Body>
            {watchProducts.map((product, index) => (
              <Table.Row key={`${product.code}-${index}`}>
                <ModTableCell>
                  <Controller
                    name={`products[${index}].name`}
                    control={control}
                    render={({ field }) => (
                      <>
                        <Dropdown
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
                            setValue(`products[${index}].hasSelectedProduct`, true);
                          }}
                        />
                        {triedToAddWithoutSelection && !watchProducts[index].hasSelectedProduct && (
                          <WarningMessage> Debe seleccionar un producto </WarningMessage>
                        )}
                      </>
                    )}
                  />
                </ModTableCell>
                <ModTableCell $nonBorder>
                  <CurrencyInput
                    value={watch(`products[${index}].price`)}
                    locale={locale}
                    currency={currency}
                    onChangeValue={(value) => {
                      field.onChange(value);
                    }}
                    InputElement={<ModInput $nonBorder readOnly />}
                  />
                </ModTableCell>
                <ModTableCell>
                  <Controller
                    name={`products[${index}].quantity`}
                    control={control}
                    defaultValue={product.quantity || 1}
                    render={({ field }) => (
                      <ModInput
                        type="number"
                        min="0"
                        {...field}
                      />
                    )}
                  />
                </ModTableCell>
                <ModTableCell $nonBorder>
                  <CurrencyInput
                    value={watch(`products[${index}].quantity`) *
                      watch(`products[${index}].price`) || "0"}
                    locale={locale}
                    currency={currency}
                    onChangeValue={(_, value) => {
                      field.onChange(value);
                    }}
                    InputElement={<ModInput $nonBorder readOnly />}
                  />
                </ModTableCell>
                <ModTableCell>
                  <Controller
                    name={`products[${index}].discount`}
                    control={control}
                    defaultValue={product.discount || 0}
                    render={({ field }) => (
                      <ModInput
                        fluid
                        type="number"
                        min="0"
                        max="100"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          const quantity =
                            watch(`products[${index}].quantity`) || 0;
                          const price = watch(`products[${index}].price`) || 0;
                          const discount = parseFloat(e.target.value) || 0;
                          const total = quantity * price * (1 - discount / 100);
                          setValue(
                            `products[${index}].total`,
                            total.toFixed(2),
                          );
                        }}
                      />
                    )}
                  />
                </ModTableCell>
                <ModTableCell $nonBorder>
                  <CurrencyInput
                    value={watch(`products[${index}].quantity`) *
                      watch(`products[${index}].price`) * (1 - (watch(`products[${index}].discount`) || 0) / 100) || "0"}
                    locale={locale}
                    currency={currency}
                    onChangeValue={(_, value) => {
                      field.onChange(value);
                    }}
                    InputElement={<ModInput $nonBorder readOnly />}
                  />
                </ModTableCell>
                <ModTableCell >
                  <Button
                    icon="trash"
                    color="red"
                    onClick={() => deleteProduct(index)}
                    type="button"
                  />
                </ModTableCell>
              </Table.Row>
            ))}
          </Table.Body>
          <ModTableFooter>
            <Table.Row>
              <ModTableHeaderCell $right colSpan="5">
                <TotalText>Total</TotalText>
              </ModTableHeaderCell>
              <ModTableHeaderCell $nonBorder>
                <CurrencyInput
                  value={watchProducts.reduce((acc, product) => {
                    const total = parseFloat(product.total) || 0;
                    return acc + total;
                  }, 0).toFixed(2)}
                  locale={locale}
                  currency={currency}
                  onChangeValue={(_, value) => {
                    field.onChange(value);
                  }}
                  InputElement={<ModInput $greyBack $nonBorder readOnly />}
                />
              </ModTableHeaderCell>
              <ModTableHeaderCell >
              </ModTableHeaderCell>
            </Table.Row>
          </ModTableFooter>
        </Table>
        <ModButton
          floated="right"
          type="submit"
          color="green"
        >
          <Icon name="add" />Crear presupuesto
        </ModButton>
      </Form>
    </>
  );
};

export default BudgetForm;
