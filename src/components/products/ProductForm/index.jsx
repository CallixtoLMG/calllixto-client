"use client"
import { get } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon, Input } from 'semantic-ui-react';
import { Label, MainContainer, WarningMessage } from "./styles";

const ProductForm = ({ product, onSubmit }) => {
  const { handleSubmit, control } = useForm();

  const validateCode = (value) => {
    return /^[A-Za-z0-9]{4}$/.test(value);
  };

  const validatePrice = (value) => {
    return /^[0-9]+$/.test(value);
  };

  return (
    <MainContainer>
      <Form onSubmit={handleSubmit(onSubmit)}>
        {!product?.code &&
          <Form.Field>
            <Label>Código</Label>
            <Controller
              name="code"
              control={control}
              defaultValue={get(product, "code", "")}
              rules={{ validate: validateCode }}
              render={({ field, fieldState }) => (
                <>
                  <Input {...field} />
                  {fieldState?.invalid && (
                    <WarningMessage >El código debe tener 4 caracteres alfanuméricos.</WarningMessage>
                  )}
                </>
              )}
            />
          </Form.Field>}
        <Form.Field>
          <Label>Nombre</Label>
          <Controller
            name="name"
            control={control}
            defaultValue={get(product, "name", "")}
            render={({ field }) => <Input {...field} />}
          />
        </Form.Field>
        <Form.Field>
          <Label>Precio</Label>
          <Controller
            name="price"
            control={control}
            defaultValue={get(product, "price", "")}
            rules={{ validate: validatePrice }}
            render={({ field, fieldState }) => (
              <>
                <Input {...field} />
                {fieldState?.invalid && (
                  <WarningMessage >El precio debe contener solo números.</WarningMessage>
                )}
              </>
            )}
          />
        </Form.Field>
        <Form.Field>
        </Form.Field>
        <Button
          type="submit"
          icon
          labelPosition='right'
          color="green"
        >
          <Icon name="add" /> {product?.code ? "Actualizar producto" : "Crear producto"}
        </Button>
      </Form>
    </MainContainer>
  )
};

export default ProductForm;