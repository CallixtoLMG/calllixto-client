import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Button, Dropdown, Form, Icon, Table } from 'semantic-ui-react';
import { ModButtonBudget, ModButtonProduct, ModDropdown, StyledInput } from "./styles";


const options = [
  { key: 'producto1', value: 'producto1', text: 'Producto 1', precio: 10 },
  { key: 'producto2', value: 'producto2', text: 'Producto 2', precio: 20 },
  // Agrega más opciones si es necesario
];

const customers = [
  { key: '1', value: 'Milton', text: 'Milton' },
  { key: '2', value: 'Levi', text: 'Levi' },
  { key: '3', value: 'Gawain', text: 'Gawain' },
  { key: '4', value: 'Marcelo', text: 'Marcelo' },
];

const FormularioTabla = () => {
  const { control, handleSubmit, setValue, getValues, watch } = useForm();
  const [productos, setProductos] = useState([{ nombre: '', cantidad: '', descuento: '' }]);

  const onSubmit = (data) => {
    console.log(data);
  };

  const agregarProducto = () => {
    setProductos([...productos, { nombre: '', cantidad: '', descuento: '' }]);
  };

  const eliminarProducto = (index) => {
    if (typeof index === 'number') {
      const nuevosProductos = [...productos];
      nuevosProductos.splice(index, 1);
      setProductos(nuevosProductos);
    }
  };

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <ModDropdown
        name="client"
        placeholder='Clientes...'
        search
        selection
        minCharacters={2}
        noResultsMessage="No se encontro cliente!"
        options={customers}
        onChange={(e, { name, value }) => {
          setValue(name, value);
        }}
      />
      <ModButtonProduct
        icon
        labelPosition='right'
        color="green"
        type="button"
        onClick={agregarProducto}
      >
        <Icon name="add" />Agregar producto</ModButtonProduct>
      <Table celled>
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell textAlign='center'>Nombre del Producto</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Precio del Producto</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Cantidad de Productos</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Subtotal</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Descuento</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Total</Table.HeaderCell>
            <Table.HeaderCell textAlign='center'>Acciones</Table.HeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {productos.map((producto, index) => (
            <Table.Row key={index}>
              <Table.Cell>
                <Controller
                  name={`productos[${index}].nombre`}
                  control={control}
                  defaultValue={producto.nombre || ''}
                  render={({ field }) => (
                    <Dropdown
                      fluid
                      search
                      selection
                      options={options}
                      {...field}
                      onChange={(e, { value }) => {
                        field.onChange(value);
                        const precioProducto = options.find((opt) => opt.value === value)?.precio || 0;
                        setValue(`productos[${index}].precio`, precioProducto);
                      }}
                    />
                  )}
                />
              </Table.Cell>
              <Table.Cell>
                <Controller
                  name={`productos[${index}].precio`}
                  control={control}
                  defaultValue={producto.precio || ''}
                  render={({ field }) => (
                    <StyledInput
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
                  name={`productos[${index}].cantidad`}
                  control={control}
                  defaultValue={producto.cantidad || ''}
                  render={({ field }) => (
                    <StyledInput
                      type="number"
                      min="1"
                      {...field}
                    />
                  )}
                />
              </Table.Cell>
              <Table.Cell>
                <StyledInput
                  type="text"
                  value={watch(`productos[${index}].cantidad`) * watch(`productos[${index}].precio`) || ''}
                  readOnly
                />
              </Table.Cell>
              <Table.Cell>
                <Controller
                  name={`productos[${index}].descuento`}
                  control={control}
                  defaultValue={producto.descuento || ''}
                  render={({ field }) => (
                    <StyledInput
                      type="number"
                      min="0"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e.target.value);
                        const cantidad = watch(`productos[${index}].cantidad`) || 0;
                        const precio = watch(`productos[${index}].precio`) || 0;
                        const descuento = parseFloat(e.target.value) || 0;
                        const total = cantidad * precio * (1 - descuento / 100);
                        setValue(`productos[${index}].total`, total.toFixed(2));
                      }}
                    />
                  )}
                />
              </Table.Cell>
              <Table.Cell>
                <StyledInput
                  type="text"
                  value={watch(`productos[${index}].total`) || ''}
                  readOnly
                />
              </Table.Cell>
              <Table.Cell>
                <Button
                  icon="trash"
                  color="red"
                  onClick={() => eliminarProducto(index)} 
                />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <ModButtonBudget
        type="submit"
        icon
        labelPosition='right'
        color="green"
      >
        <Icon name="add" /> Crear presupuesto </ModButtonBudget>
    </Form>
  );
};

export default FormularioTabla;