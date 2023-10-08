"use client"
import { get } from "lodash";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon } from 'semantic-ui-react';
import { MainContainer, ModFormField, ModInput, ModLabel, WarningMessage } from "./styles";

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
          <ModFormField>
            <ModLabel>Código</ModLabel>
            <Controller
              name="code"
              control={control}
              defaultValue={get(product, "code", "")}
              rules={{ validate: validateCode }}
              render={({ field, fieldState }) => (
                <>
                  <ModInput {...field} />
                  {fieldState?.invalid && (
                    <WarningMessage >El código debe tener 4 caracteres alfanuméricos.</WarningMessage>
                  )}
                </>
              )}
            />
          </ModFormField>}
        <ModFormField>
          <ModLabel>Nombre</ModLabel>
          <Controller
            name="name"
            control={control}
            defaultValue={get(product, "name", "")}
            render={({ field }) => <ModInput {...field} />}
          />
        </ModFormField>
        <ModFormField>
          <ModLabel>Precio</ModLabel>
          <Controller
            name="price"
            control={control}
            defaultValue={get(product, "price", "")}
            rules={{ validate: validatePrice }}
            render={({ field, fieldState }) => (
              <>
                <ModInput {...field} />
                {fieldState?.invalid && (
                  <WarningMessage >El precio debe contener solo números.</WarningMessage>
                )}
              </>
            )}
          />
        </ModFormField>
        <ModFormField>
        </ModFormField>
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