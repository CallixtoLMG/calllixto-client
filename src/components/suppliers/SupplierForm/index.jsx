"use client";
import { PAGES, REGEX } from "@/constants";
import { createDate, validate2DigitCode } from "@/utils";
import { omit } from "lodash";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, MaskedInput, PhoneContainer, Textarea } from "./styles";

const SupplierForm = ({ supplier, onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isValid, isDirty } } = useForm({ defaultValues: supplier });
  const isUpdating = useMemo(() => !!supplier?.id, [supplier]);
  const [isLoading, setIsLoading] = useState(false);
  const buttonConfig = useMemo(() => {
    return {
      icon: isUpdating ? "edit" : "add",
      title: isUpdating ? "Actualizar" : "Crear",
    }
  }, [isUpdating]);

  const handleReset = (supplier) => {
    reset(supplier || { name: '', id: '', comments: '' });
  };

  const handleForm = (data) => {
    setIsLoading(true);
    if (!isUpdating) {
      data.createdAt = createDate();
      onSubmit(data);
    } else {
      data.updatedAt = createDate();
      onSubmit({ id: supplier.id, supplier: omit(data, ['id', 'createdAt']) });
    }
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.SUPPLIERS.BASE);
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
          <FormField width="50%">
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
          <FormField flex="none" width="200px">
            <Label>Teléfono</Label>
            <PhoneContainer>
              <Box width="70px">
                <Controller
                  name="phone.areaCode"
                  control={control}
                  render={({ field }) =>
                    <MaskedInput
                      mask="9999"
                      maskChar={null}
                      {...field}
                      placeholder="Área"
                    />
                  }
                />
              </Box>
              <Box width="130px">
                <Controller
                  name="phone.number"
                  control={control}
                  render={({ field }) =>
                    <MaskedInput
                      mask="99999999"
                      maskChar={null}
                      {...field}
                      placeholder="Numero"
                    />}
                />
              </Box>
            </PhoneContainer>
          </FormField>
          <FormField flex="1">
            <Label>Email</Label>
            <Controller
              name="email"
              control={control}
              rules={{ pattern: REGEX.EMAIL }}
              render={({ field }) => <Input {...field} placeholder="Email" />}
            />
          </FormField>
          <FormField flex="1">
            <Label >Dirección</Label>
            <Controller
              name="address"
              control={control}
              render={({ field }) => <Input {...field} placeholder="Dirección" />}
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
            <Button type="button" onClick={() => handleReset(supplier)} color="brown" $marginLeft disabled={isLoading || !isDirty}>
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

export default SupplierForm;
