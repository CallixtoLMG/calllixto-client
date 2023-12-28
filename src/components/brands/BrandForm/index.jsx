"use client";
import { PAGES } from "@/constants";
import { createDate, validate2DigitCode } from "@/utils";
import { omit } from "lodash";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, FieldsContainer, FormContainer, FormField, Input, Label, Textarea } from "./styles";
import { RuledLabel } from "@/components/common/forms";

const BrandForm = ({ brand, onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isValid, isDirty, errors } } = useForm({ defaultValues: brand });
  const isUpdating = useMemo(() => !!brand?.id, [brand]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((brand) => {
    reset(brand || { name: '', id: '', comments: '' });
  }, [reset]);

  const buttonConfig = useMemo(() => {
    return {
      submit: {
        icon: isUpdating ? "edit" : "add",
        title: isUpdating ? "Actualizar" : "Crear",
      },
      restore: {
        onClick: () => handleReset(isUpdating ? brand : null),
        icon: isUpdating ? 'undo' : 'erase',
        title: isUpdating ? 'Restaurar' : 'Limpiar'
      }

    }
  }, [brand, handleReset, isUpdating]);

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
            <RuledLabel title="Código" message={errors?.id?.message} required />
            <Controller
              name="id"
              control={control}
              rules={{ required: 'Campo requerido', validate: validate2DigitCode }}
              render={({ field }) => (
                <Input
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
          <Label >Comentarios</Label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => <Textarea maxLength="2000" {...field} placeholder="Comentarios" />}
          />
        </FieldsContainer>
        <ButtonsContainer>
          <Button
            disabled={isLoading}
            loading={isLoading}
            type="submit"
            color="green">
            <Icon name={buttonConfig.submit.icon} />{buttonConfig.submit.title}
          </Button>
          <Button type="button" onClick={buttonConfig.restore.onClick} color="brown" disabled={isLoading || !isDirty}>
            <Icon name={buttonConfig.restore.icon} />{buttonConfig.restore.title}
          </Button>
        </ButtonsContainer>
      </FormContainer>
    </Form>
  )
};

export default BrandForm;
