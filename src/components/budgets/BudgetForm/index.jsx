import { SHOWPRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Controller, useForm } from 'react-hook-form';
import { Button, Dropdown, Form, Icon, Table } from 'semantic-ui-react';
import { MainContainer, ModButton, ModDropdown, ModInput, ModTableRow, TotalText } from "./styles";

const BudgetForm = ({ onSubmit, products, customers }) => {

  const router = useRouter()

  const { control, handleSubmit, setValue, watch, register } = useForm();
  const watchProducts = watch("products", [{ name: '', quantity: 0, discount: 0 }]);
  const addProduct = () => {
    setValue("products", [...watchProducts, { name: '', quantity: 0, discount: 0 }]);
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
    onSubmit(data)
    setTimeout(() => {
      router.push(PAGES.BUDGETS.BASE);
    }, 500);
  };

  return (
    <MainContainer>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <ModDropdown
          name={`customer.name`}
          placeholder='Clientes...'
          search
          selection
          minCharacters={2}
          noResultsMessage="No se ha encontrado cliente!"
          options={customers}
          onChange={(e, { name, value }) => {
            setValue(name, value);
            const selectedCustomerData = customers.find(customer => customer.value === value);
            const filteredData = {
              email: selectedCustomerData.email,
              name: selectedCustomerData.text,
              phone: selectedCustomerData.phone
            };
            setValue("customer", filteredData)
          }}
        />
        <ModInput type="hidden" {...register("customer")} />
        <ModButton
          color="green"
          type="button"
          onClick={addProduct}
        >
          <Icon name="add" />Agregar producto</ModButton>

        <Table celled>
          <Table.Header>
            <ModTableRow>
              {SHOWPRODUCTSHEADERS.map((header) => {
                return (<Table.HeaderCell key={header.id} textAlign='center'>{header.name}</Table.HeaderCell>)
              })}
            </ModTableRow>
          </Table.Header>
          <Table.Body>
            {watchProducts.map((product, index) => (
              <Table.Row key={`${product.code}-${index}`}>
                <Table.Cell>
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
                          const product = products.find((opt) => opt.value === value);
                          setValue(`products[${index}].price`, product.price);
                          setValue(`products[${index}].code`, product.code);
                        }}
                      />
                    )}
                  />
                </Table.Cell>

                <Table.Cell>
                  <Controller
                    name={`products[${index}].price`}
                    control={control}
                    defaultValue={product.price || 0}
                    render={({ field }) => (
                      <ModInput
                        type="number"
                        value={field.value}
                        readOnly
                        {...field}
                      />
                    )}
                  />
                </Table.Cell>
                <Table.Cell>
                  <Controller
                    name={`products[${index}].quantity`}
                    control={control}
                    defaultValue={product.quantity || 0}
                    render={({ field }) => (
                      <ModInput
                        type="number"
                        min="1"
                        {...field}
                      />
                    )}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ModInput
                    type="text"
                    value={watch(`products[${index}].quantity`) * watch(`products[${index}].price`) || 0}
                    readOnly
                  />
                </Table.Cell>
                <Table.Cell>
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
                          const quantity = watch(`products[${index}].quantity`) || 0;
                          const price = watch(`products[${index}].price`) || 0;
                          const discount = parseFloat(e.target.value) || 0;
                          const total = quantity * price * (1 - discount / 100);
                          setValue(`products[${index}].total`, total.toFixed(2));
                        }}
                      />
                    )}
                  />
                </Table.Cell>
                <Table.Cell>
                  <ModInput
                    type="text"
                    value={watch(`products[${index}].total`) || 0}
                    readOnly
                  />
                </Table.Cell>
                <Table.Cell textAlign='center'>
                  <Button
                    icon="trash"
                    color="red"
                    onClick={() => deleteProduct(index)}
                    type="button"
                  />
                </Table.Cell>

              </Table.Row>
            ))}
          </Table.Body>
          <Table.Footer>
            <Table.Row>
              <Table.HeaderCell colSpan="5" textAlign='left'>
                <TotalText>Total</TotalText>
              </Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>
                <ModInput
                  name="totalBudget"
                  type="text"
                  onChange={(e, { name, value }) => {
                    setValue(name, value);
                  }}
                  value={calculateTotal() || ''}
                  readOnly
                />
              </Table.HeaderCell>
              <Table.HeaderCell textAlign='center'>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Footer>
        </Table>
        <ModButton
          floated="right"
          type="submit"
          color="green"
        >
          <Icon name="add" />Crear presupuesto</ModButton>
      </Form>
    </MainContainer>
  );
};

export default BudgetForm;

