import { SHOWPRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import ButtonGoTo from "@/components/buttons/GoTo";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Button, Dropdown, Form, Icon, Table } from "semantic-ui-react";
import {
  HeaderContainer,
  ModButton,
  ModDropdown,
  ModInput, ModTableCell, ModTableHeaderCell,
  ModTableRow,
  TotalText
} from "./styles";

const BudgetForm = ({ onSubmit, products, customers }) => {
  const router = useRouter();
  const { control, handleSubmit, setValue, watch, register } = useForm();
  const watchProducts = watch("products", [{
    name: "",
    quantity: 0,
    discount: 0,
  }]);
  const addProduct = () => {
    setValue("products", [...watchProducts, {
      name: "",
      quantity: 1,
      discount: 0,
    }]);
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
        <ButtonGoTo goTo={PAGES.BUDGETS.BASE} iconName="chevron left" text="Volver atrás" color="green" />
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
            console.log(customer)
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
                      <Dropdown
                        fluid
                        search
                        selection
                        noResultsMessage="No se ha encontrado producto!"
                        options={products}
                        {...field}
                        onChange={(e, { value }) => {
                          field.onChange(value);
                          const product = products.find((opt) =>
                            opt.value === value
                          );
                          setValue(`products[${index}].price`, product.price);
                          setValue(`products[${index}].code`, product.code);
                        }}
                      />
                    )}
                  />
                </ModTableCell>
                <ModTableCell>
                  <Controller
                    name={`products[${index}].price`}
                    control={control}
                    defaultValue={product.price || 0}
                    render={({ field }) => (
                      <CurrencyInput
                        value={field.value}
                        locale={locale}
                        currency={currency}
                        onChangeValue={(_, value) => {
                          field.onChange(value);
                        }}
                        InputElement={<ModInput readOnly />}
                      />
                    )}
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
                        min="1"
                        {...field}
                      />
                    )}
                  />
                </ModTableCell>
                <ModTableCell>
                  <CurrencyInput
                    value={watch(`products[${index}].quantity`) *
                      watch(`products[${index}].price`) || 0}
                    locale={locale}
                    currency={currency}
                    onChangeValue={(_, value) => {
                      field.onChange(value);
                    }}
                    InputElement={<ModInput readOnly />}
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
                        max="99"
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
                <ModTableCell>
                  <CurrencyInput
                    value={watch(`products[${index}].total`) || 0}
                    locale={locale}
                    currency={currency}
                    onChangeValue={(_, value) => {
                      field.onChange(value);
                    }}
                    InputElement={<ModInput readOnly />}
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
          <Table.Footer>
            <Table.Row>
              <ModTableHeaderCell $left colSpan="5">
                <TotalText>Total</TotalText>
              </ModTableHeaderCell>
              <ModTableHeaderCell >
                <CurrencyInput
                  value={calculateTotal() || ""}
                  locale={locale}
                  currency={currency}
                  onChangeValue={(_, value) => {
                    field.onChange(value);
                  }}
                  InputElement={<ModInput readOnly />}
                />
              </ModTableHeaderCell>
              <ModTableHeaderCell >
              </ModTableHeaderCell>
            </Table.Row>
          </Table.Footer>
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
