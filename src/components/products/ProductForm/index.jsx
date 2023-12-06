"use client";
import { PAGES } from "@/constants";
import { get } from "lodash";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import { CurrencyInput } from "react-currency-mask";
import {
  MainContainer,
  ModButton,
  ModFormField,
  ModInput,
  ModLabel,
  WarningMessage,
} from "./styles";

const ProductForm = ({ product, onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control } = useForm();
  const validateCode = (value) => {
    return /^[A-Za-z0-9]{4}$/.test(value);
  };
  const validatePrice = (value) => {
    return /^[0-9]+$/.test(value);
  };
  const handleForm = (data) => {
    if (!product?.code) {
      onSubmit(data);
    } else {
      onSubmit(product?.code, data);
    }
    setTimeout(() => {
      router.push(PAGES.PRODUCTS.BASE);
    }, 1000);
  };
  const formatter = new Intl.NumberFormat("es-ar", {
    style: "currency",
    currency: "ARS",
  });
  return (
    <MainContainer>
      <Form onSubmit={handleSubmit(handleForm)}>
        {!product?.code &&
          (
            <ModFormField>
              <>
                <ModLabel>Código</ModLabel>
                <Controller
                  name="code"
                  control={control}
                  defaultValue={get(product, "code", "")}
                  rules={{ validate: validateCode }}
                  render={({ field, fieldState }) => (
                    <CurrencyInput
                      value={field.value}
                      onChangeValue={(_, value)=>{
                        field.onChange(value);
                      }}
                      InputElement={
                                            <>
                      <ModInput {...field} />
                      {fieldState?.invalid && (
                        <WarningMessage>
                          El código debe tener 4 caracteres alfanuméricos.
                        </WarningMessage>
                      )}
                    </>

                      }/>
                  )}
                />
              </>
            </ModFormField>
          )}
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
                <ModInput
                  {...field}
                />
                {fieldState?.invalid && (
                  <WarningMessage>
                    El precio debe contener solo números.
                  </WarningMessage>
                )}
              </>
            )}
          />
        </ModFormField>
        <ModFormField>
        </ModFormField>
        <ModButton
          type="submit"
          color="green"
        >
          <Icon name="add" />{" "}
          {product?.code ? "Actualizar producto" : "Crear producto"}
        </ModButton>
      </Form>
    </MainContainer>
  );
};

export default ProductForm;
