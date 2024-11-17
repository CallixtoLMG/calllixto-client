import { SubmitAndRestore } from "@/components/common/buttons";
import { DateSelector, Dropdown, FieldsContainer, Form, FormField, Input, RuledLabel } from "@/components/common/custom";
import { ContactFields, ControlledComments } from "@/components/common/form";
import { RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { getRoleOptions } from "../users.common";

const EMPTY_USER = {
  firstName: '',
  lastName: '',
  role: '',
  birthDate: '',
  phoneNumbers: [],
  addresses: [],
  emails: [],
  comments: ''
};

const ROLE_OPTIONS = getRoleOptions();

const UserForm = ({ user = EMPTY_USER, onSubmit, isLoading, isUpdating }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_USER,
      ...user,
    }
  });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const handleReset = useCallback((user) => {
    reset(user);
  }, [reset]);

  const handleCreate = (data) => {
    if (!data.addresses.length) {
      data.addresses = [];
    }
    if (!data.phoneNumbers.length) {
      data.phoneNumbers = [];
    }
    if (!data.emails.length) {
      data.emails = [];
    }
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_USER, ...user } : EMPTY_USER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <FormField flex="3" error={errors?.firstName?.message}>
            <RuledLabel title="Nombre" message={errors?.firstName?.message} required />
            <Controller
              name="firstName"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" onKeyPress={preventSend} />}
            />
          </FormField>
          <FormField flex="3" error={errors?.lastName?.message}>
            <RuledLabel title="Apellido" message={errors?.lastName?.message} required />
            <Controller
              name="lastName"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Apellido" onKeyPress={preventSend} />}
            />
          </FormField>
          <FormField flex="1" error={errors?.role?.message}>
            <RuledLabel title="Rol" message={errors?.role?.message} required />
            <Controller
              name="role"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Dropdown
                  {...field}
                  fluid
                  selection
                  options={ROLE_OPTIONS}
                  placeholder="Seleccionar Rol"
                  onChange={(e, { value }) => field.onChange(value)}
                />
              )}
            />
          </FormField>
          <FormField maxHeight="80px" flex="2" error={errors?.birthDate?.message}>
            <RuledLabel title="Fecha de Nacimiento" message={errors?.birthDate?.message} />
            <Controller
              name="birthDate"
              control={control}
              render={({ field }) => (
                <DateSelector
                  {...field}
                  selected={field.value ? new Date(field.value) : null}
                  onChange={(date) => field.onChange(date)}
                  placeholderText="Seleccionar fecha"
                  dateFormat="yyyy-MM-dd"
                  showMonthDropdown
                  showYearDropdown
                  dropdownMode="select"
                />
              )}
            />
          </FormField>
        </FieldsContainer>
        <ContactFields />
        <FieldsContainer>
          <ControlledComments control={control} />
        </FieldsContainer>
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_USER, ...user } : EMPTY_USER)}
        />
      </Form>
    </FormProvider>
  );
};

export default UserForm;
