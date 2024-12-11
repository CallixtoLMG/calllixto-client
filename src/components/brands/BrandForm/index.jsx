import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, RuledLabel, Segment } from "@/components/common/custom";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback } from "react";
import { Controller, useForm } from "react-hook-form";
import { ControlledComments } from "../../common/form";

const EMPTY_BRAND = { name: '', id: '', comments: '' };

const BrandForm = ({ brand, onSubmit, isLoading, isUpdating }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = useForm({ defaultValues: brand });

  const handleReset = useCallback((brand) => {
    reset(brand);
  }, [reset]);

  const handleCreate = (data) => {
    const { previousVersions, ...filteredData } = data;
    onSubmit(filteredData);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : EMPTY_BRAND), SHORTKEYS.DELETE);

  return (
    <Form onSubmit={handleSubmit(onSubmit)} onKeyDown={preventSend}>
      <FieldsContainer>
        <FormField error={errors?.id?.message}>
          <RuledLabel title="Código" message={errors?.id?.message} required={!isUpdating} />
          {isUpdating ? (
            <Segment placeholder>{brand?.id}</Segment>
          ) : (
            <Controller
              name="id"
              control={control}
              rules={RULES.REQUIRED_TWO_DIGIT}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Código (A1)"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  maxLength={2}
                />
              )}
            />
          )}
        </FormField>
        <FormField width="50%" error={errors?.name?.message}>
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          <Controller
            name="name"
            control={control}
            rules={RULES.REQUIRED}
            render={({ field }) => <Input {...field} placeholder="Nombre" />}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <ControlledComments control={control} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_BRAND, ...brand } : EMPTY_BRAND)}
      />
    </Form>
  )
};

export default BrandForm;
