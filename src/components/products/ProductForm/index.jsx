"use client";
import { PAGES } from "@/constants";
import { createDate } from "@/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, Textarea } from "./styles";

const ProductForm = ({ product, onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isValid, isDirty } } = useForm({ defaultValues: product });
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

  const handleReset = (product) => {
    reset(product || { name: '', price: 0, code: '', comments: "" });
  };

  const handleForm = (data) => {
    setIsLoading(true);
    if (!isUpdating) {
      data.createdAt = createDate();
      onSubmit(data);
    } else {
      data.updatedAt = createDate();
      onSubmit(product.code, data);
    }
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.PRODUCTS.BASE);
    }, 1000);
  };

  const locale = "es-AR";
  const currency = "ARS";

  return (
    <Form onSubmit={handleSubmit(handleForm)}>
      <FormContainer>
        <FieldsContainer>
          <FormField>
            <Label>Código</Label>
            <Controller
              name="code"
              control={control}
              rules={{ validate: validateCode }}
              render={({ field }) => (
                <Input required {...field} placeholder="Código (A123)" disabled={isUpdating} />
              )}
            />
          </FormField>
          <FormField flex="1" >
            <Label>Nombre</Label>
            <Controller
              name="name"
              control={control}
              render={({ field }) => <Input required {...field} placeholder="Nombre" />}
            />
          </FormField>
          <FormField>
            <Label>Precio</Label>
            <Controller
              name="price"
              control={control}
              rules={{ required: true, min: 0.01 }}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  locale={locale}
                  currency={currency}
                  placeholder="Precio"
                  onChangeValue={(_, value) => {
                    field.onChange(value);
                  }}
                  InputElement={<Input />}
                />
              )}
            />
          </FormField>
        </FieldsContainer>
        <FieldsContainer flex="1">
          <Label >Comentarios</Label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => <Textarea maxLength="2000" {...field} placeholder="Comentarios" />}
          />
        </FieldsContainer>
        <ButtonsContainer>
          <Button
            disabled={isLoading || !isDirty || !isValid}
            loading={isLoading}
            type="submit"
            color="green">
            <Icon name={buttonConfig.icon} />{buttonConfig.title}</Button>
          {isUpdating ? (
            <Button type="button" onClick={() => handleReset(product)} color="brown" $marginLeft disabled={isLoading || !isDirty}>
              <Icon name="undo" />Restaurar
            </Button>
          ) : (
            <Button type="button" onClick={() => handleReset()} color="brown" $marginLeft disabled={isLoading || !isDirty}>
              <Icon name="erase" />Limpiar
            </Button>
          )}
        </ButtonsContainer>
      </FormContainer>
    </Form>
  )
};

export default ProductForm;
