import { SHOWPRODUCTSHEADERS } from "@/components/budgets/budgets.common";
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Dropdown, Form, Icon, Table } from 'semantic-ui-react';
import { ModButtonBudget, ModButtonProduct, ModDropdown, ModInput, ModTableRow, TotalText } from "./styles";

const productsList = [
  { code: 1, name: "Madera", price: 150, key: 1, value: "Madera", text: "Madera" },
  { code: 2, name: "Piedra", price: 250, key: 2, value: "Piedra", text: "Piedra" },
  { code: 3, name: "Ripio", price: 450, key: 3, value: "Ripio", text: "Ripio" }
];

const fakeCustomers = [
  { key: '1', value: 'Milton', text: 'Milton' },
  { key: '2', value: 'Levi', text: 'Levi' },
  { key: '3', value: 'Gawain', text: 'Gawain' },
  { key: '4', value: 'Marcelo', text: 'Marcelo' },
];

const BudgetForm = ({ onSubmit }) => {

  const { control, handleSubmit, setValue, watch } = useForm();
  const [products, setProducts] = useState([{ name: '', quantity: '', discount: '' }]);

  const addProduct = () => {
    setProducts([...products, { name: '', quantity: '', discount: '' }]);
  };

  const deleteProduct = (index) => {
    if (typeof index === 'number') {
      const newProducts = [...products];
      newProducts.splice(index, 1);
      setProducts(newProducts);
    }
  };

  const calculateTotal = () => {
    let total = 0;
    products.forEach((product, index) => {
      const subtotal = watch(`products[${index}].total`) || 0;
      total += parseFloat(subtotal);
    });
    return total.toFixed(2);
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModDropdown
        name="customerId"
        placeholder='Clientes...'
        search
        selection
        minCharacters={2}
        noResultsMessage="No se ha encontrado cliente!"
        options={fakeCustomers}
        onChange={(e, { name, value }) => {
          setValue(name, value);
        }}
      />
      <ModButtonProduct
        icon
        labelPosition='right'
        color="green"
        type="button"
        onClick={addProduct}
      >
        <Icon name="add" />Agregar producto</ModButtonProduct>
      <Table celled>
        <Table.Header>
          <ModTableRow>
            {SHOWPRODUCTSHEADERS.map((header) => {
              return (<Table.HeaderCell key={header.id} textAlign='center'>{header.name}</Table.HeaderCell>)
            })}
          </ModTableRow>
        </Table.Header>
        <Table.Body>
          {products.map((product, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <Controller
                  name={`products[${index}].name`}
                  control={control}
                  defaultValue={product.name || ''}
                  render={({ field }) => (
                    <Dropdown
                      fluid
                      search
                      selection
                      noResultsMessage="No se ha encontrado producto!"
                      options={productsList}
                      {...field}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                        const productPrice = productsList.find((opt) => opt.value === value)?.price || 0;
                        setValue(`products[${index}].price`, productPrice);
                      }}
                    />
                  )}
                />
              </Table.Cell>
              <Table.Cell>
                <Controller
                  name={`products[${index}].price`}
                  control={control}
                  defaultValue={product.price || ''}
                  render={({ field }) => (
                    <ModInput
                      type="text"
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
                  defaultValue={product.quantity || ''}
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
                  value={watch(`products[${index}].quantity`) * watch(`products[${index}].price`) || ''}
                  readOnly
                />
              </Table.Cell>
              <Table.Cell>
                <Controller
                  name={`products[${index}].discount`}
                  control={control}
                  defaultValue={product.discount || ''}
                  render={({ field }) => (
                    <ModInput
                      type="number"
                      min="0"
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
                  value={watch(`products[${index}].total`) || ''}
                  readOnly
                />
              </Table.Cell>
              <Table.Cell textAlign='center'>
                <Button
                  icon="trash"
                  color="red"
                  onClick={() => deleteProduct(index)}
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
      <ModButtonBudget
        floated="right"
        type="submit"
        icon
        labelPosition='right'
        color="green"
      >
        <Icon name="add" /> Crear presupuesto </ModButtonBudget>
    </Form>
  );
};

export default BudgetForm;

