"use client";
import { PAGES } from "@/constants";
import { createDate, validate2DigitCode } from "@/utils";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, Textarea } from "./styles";
import { omit } from "lodash";

const BrandForm = ({ brand, onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isValid, isDirty } } = useForm({ defaultValues: brand });
  const isUpdating = useMemo(() => !!brand?.id, [brand]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);

  const handleReset = (brand) => {
    reset(brand || { name: '', id: '', comments: '' });
  };

  const handleForm = (data) => {
    setIsLoading(true);
    if (!isUpdating) {
      data.createdAt = createDate();
      onSubmit(data);
    } else {
      data.updatedAt = createDate();
      onSubmit({ id: brand.id, brand: omit(data, ['id', 'createdAt']) });
    }
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.BRANDS.BASE);
    }, 1000);
  };

  return (
    <Form onSubmit={handleSubmit(handleForm)}>
      <FormContainer>
        <FieldsContainer>
          <FormField>
            <Label>Código</Label>
            <Controller
              name="id"
              control={control}
              rules={{ validate: validate2DigitCode }}
              render={({ field }) => (
                <Input required
                  placeholder="Código (A1)"
                  disabled={isUpdating}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                  />
              )}
            />
          </FormField>
          <FormField>
            <Label>Nombre</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input required {...field} placeholder="Nombre" />}
            />
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
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
            <Button type="button" onClick={() => handleReset(brand)} color="brown" $marginLeft disabled={isLoading || !isDirty}>
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

export default BrandForm;
