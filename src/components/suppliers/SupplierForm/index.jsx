"use client";
import { PAGES, REGEX } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box } from "rebass";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, Label, MaskedInput, PhoneContainer, Textarea } from "./styles";
import { RuledLabel, FormContainer, FieldsContainer, FormField, Input } from "@/components/common/custom";

const SupplierForm = ({ supplier, onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { errors, isDirty } } = useForm({ defaultValues: supplier });
  const isUpdating = useMemo(() => !!supplier?.id, [supplier]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((supplier) => {
    reset(supplier || { name: '', id: '', comments: '' });
  }, [reset]);

  const buttonConfig = useMemo(() => {
    return {
      submit: {
        icon: isUpdating ? "edit" : "add",
        title: isUpdating ? "Actualizar" : "Crear",
      },
      restore: {
        onClick: () => handleReset(isUpdating ? supplier : null),
        icon: isUpdating ? 'undo' : 'erase',
        title: isUpdating ? 'Restaurar' : 'Limpiar'
      }

    }
  }, [supplier, handleReset, isUpdating]);

  const handleForm = (data) => {
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.SUPPLIERS.BASE);
    }, 2000);
  };

  return (
    <Form onSubmit={handleSubmit(handleForm)}>
      <FormContainer>
        <FieldsContainer>
          <FormField>
            <RuledLabel title="Código" message={errors?.id?.message} required />
            <Controller
              name="id"
              control={control}
              rules={{
                required: 'Campo requerido',
                pattern: { value: REGEX.TWO_DIGIT_CODE, message: 'El código debe ser de 2 cifras alfanumérico' }
              }}
              render={({ field }) => (
                <Input
                  placeholder="Código (A1)"
                  {...field}
                  disabled={isUpdating}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              )}
            />
          </FormField>
          <FormField width="50%">
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            <Controller
              name="name"
              control={control}
              rules={{ required: 'Campo requerido' }}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
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
            <RuledLabel title="Email" message={errors?.email?.message} />
            <Controller
              name="email"
              control={control}
              rules={{ pattern: { value: REGEX.EMAIL, message: 'Ingresar un mail válido' } }}
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
            disabled={isLoading || !isDirty}
            loading={isLoading}
            type="submit"
            color="green">
            <Icon name={buttonConfig.submit.icon} />{buttonConfig.submit.title}</Button>
          <Button type="button" onClick={buttonConfig.restore.onClick} color="brown" disabled={isLoading || !isDirty}>
            <Icon name={buttonConfig.restore.icon} />{buttonConfig.restore.title}
          </Button>
        </ButtonsContainer>
      </FormContainer>
    </Form>
  )
};

export default SupplierForm;
