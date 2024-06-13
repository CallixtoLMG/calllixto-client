import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { RULES } from "@/constants";
import { useParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { ContactFields } from "../../common/form";

const EMPTY_CUSTOMER = { name: '', email: '', phoneNumbers: [], addresses: [], comments: '' };

const CustomerForm = ({ customer = EMPTY_CUSTOMER, onSubmit, isLoading, readonly }) => {
  const params = useParams();
  const methods = useForm({
    defaultValues: {
      ...EMPTY_CUSTOMER,
      ...customer,
    }
  });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const isUpdating = useMemo(() => !!params.id, [params.id]);

  const handleReset = useCallback((customer) => {
    reset(customer || EMPTY_CUSTOMER);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <FormField width="33%">
            <RuledLabel title="Nombre" message={errors?.name?.message} required />
            {!readonly ? (
              <Controller
                name="name"
                control={control}
                rules={RULES.REQUIRED}
                render={({ field }) => <Input {...field} placeholder="Nombre" />}
              />
            ) : (
              <Segment>{customer?.name}</Segment>
            )}
          </FormField>
        </FieldsContainer>
        <ContactFields readonly={readonly} />
        <FieldsContainer>
          <Label>Comentarios</Label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => (
              <TextArea
                {...field}
                maxLength="2000"
                placeholder="Comentarios"
                disabled={readonly}
                value={field.value || ''}
              />
            )}
          />
        </FieldsContainer>
        <SubmitAndRestore
          show={!readonly}
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onClick={() => handleReset(isUpdating ? { ...EMPTY_CUSTOMER, ...customer } : null)}
        />
      </Form>
    </FormProvider>
  );
};

export default CustomerForm;
