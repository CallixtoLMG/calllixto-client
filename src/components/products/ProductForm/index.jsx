"use client";
import { PAGES } from "@/constants";
import { get } from "lodash";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import {
  FormContainer,
  Button,
  Input,
  Label,
  WarningMessage,
} from "./styles";
import { createDate } from "@/utils";

const ProductForm = ({ product, onSubmit }) => {
  const router = useRouter();
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
    reset(product || { name: '', price: 0, code: '' });
  };

  const handleForm = (data) => {
    setIsLoading(true);
    if (!product?.code) {
      data.createdAt = createDate()
      onSubmit(data);
    } else {
      data.updatedAt = createDate()
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
    <FormContainer>
      <Form onSubmit={handleSubmit(handleForm)}>
        {!isUpdating &&
          (
            <Form.Field>
              <Label>Código</Label>
              <Controller
                name="code"
                control={control}
                rules={{ validate: validateCode }}
                render={({ field }) => (
                  <Input required {...field} placeholder="Código (A123)" />
                )}
              />
            </Form.Field>
          )}
        <Form.Field>
          <Label>Nombre</Label>
          <Controller
            name="name"
            control={control}
            render={({ field }) => <Input required {...field} placeholder="Nombre" />}
          />
        </Form.Field>
        <Form.Field>
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
        </Form.Field>
        <Form.Field>
        </Form.Field>
        <Button
          disabled={isLoading || !isDirty || !isValid}
          loading={isLoading}
          type="submit"
          color="green">
          <Icon name={buttonConfig.icon} />{buttonConfig.title}</Button>
        {isUpdating ? (
          <Button type="button" onClick={() => handleReset(product)} color="brown" $marginLeft disabled={!isDirty}>
            <Icon name="undo" />Restaurar
          </Button>
        ) : (
          <Button type="button" onClick={() => handleReset()} color="brown" $marginLeft disabled={!isDirty}>
            <Icon name="erase" />Limpiar
          </Button>
        )}
      </Form>
    </FormContainer>
  )
};

export default ProductForm;
