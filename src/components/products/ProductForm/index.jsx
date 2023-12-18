"use client";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { get } from "lodash";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import {
  HeaderContainer,
  ModButton,
  ModFormField,
  ModInput,
  ModLabel,
  WarningMessage,
} from "./styles";

const ProductForm = ({ product, onSubmit }) => {
  const router = useRouter();
  const { handleSubmit, control, reset } = useForm();
  const validateCode = (value) => {
    return /^[A-Z0-9]{4}$/.test(value);
  };
  const isUpdating = useMemo(() => !!product?.code, [product]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);

  const handleReset = () => {
    reset();
  };

  const handleForm = (data) => {
    setIsLoading(true);
    if (!product?.code) {
      onSubmit(data);
    } else {
      onSubmit(product?.code, data);
    }
    setTimeout(() => {
      setIsLoading(false);
      router.push(PAGES.PRODUCTS.BASE);
    }, 1000);
  };

  const locale = "es-AR";
  const currency = "ARS";

  return (
    <>
      <HeaderContainer>
        <PageHeader title={!product?.code ? "Crear producto" : "Actualizar producto"} />
      </HeaderContainer>
      <Form onSubmit={handleSubmit(handleForm)}>
        {!product?.code &&
          (
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
                      <WarningMessage >Código: 4 caracteres alfanuméricos y en mayúscula.</WarningMessage>
                    )}
                  </>
                )}
              />
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
            render={({ field, fieldState }) => (
              <CurrencyInput
                value={field.value}
                locale={locale}
                currency={currency}
                onChangeValue={(_, value) => {
                  field.onChange(value);
                }}
                InputElement={<ModInput />}
              />
            )}
          />
        </ModFormField>
        <ModFormField>
        </ModFormField>
        <ModButton disabled={isLoading} loading={isLoading} type="submit" color="green" ><Icon name={buttonConfig.icon} />{buttonConfig.title}</ModButton>
        <ModButton type="button" onClick={handleReset} color="red" $marginLeft>Borrar cambios</ModButton>
      </Form>
    </>
  )
};

export default ProductForm;
