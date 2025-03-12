import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
// import { preventSend } from "@/utils";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { useCallback } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { FormField } from "../../../common/components/custom";
import DatePicker from "../../../common/components/custom/DatePicker";
import { EMPTY_USER, getRoleOptions } from "../users.constants";

const GET_ROLES = getRoleOptions();
const ROLE_OPTIONS = GET_ROLES.map((role, index) => ({
  key: `${role.value}-${index}`,
  text: role.text,
  value: role.value,
})).reverse();

const UserForm = ({ user = EMPTY_USER, onSubmit, isLoading, isUpdating, view }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_USER,
      ...user,
    },
    // mode: "onChange", // Para validar en tiempo real
    // reValidateMode: "onChange",
  });
  const { handleSubmit, control, reset, formState: { isDirty, errors } } = methods;

  const handleReset = useCallback((user) => {
    reset(user);
  }, [reset]);

  const handleCreate = (data) => {
    // if (Array.isArray(data.phoneNumbers) && data.phoneNumbers.length === 0) {
    //   delete data.phoneNumbers;
    // }
    // const fullPhone = `${data.phoneNumber.areaCode}${data.phoneNumber.number}`;

    // if (fullPhone.length !== 10) {
    //   methods.setError("phoneNumber.number", {
    //     type: "manual",
    //     message: "El área y el número deben sumar 10 dígitos.",
    //   });
    //   return;
    // }

    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_USER, ...user } : EMPTY_USER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <TextControlled
            flex="3"
            name="firstName"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={view}
          />
          <TextControlled
            flex="3"
            name="lastName"
            label="Apellido"
            placeholder="Apellido"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={view}
          />

          <DropdownControlled
            width="200px"
            name="role"
            label="Rol"
            rules={RULES.REQUIRED}
            options={ROLE_OPTIONS}
          />
          <Controller
            name="birthDate"
            control={control}
            render={({ field }) => (
              <FormField

                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => field.onChange(date)}
                dateFormat="dd-MM-yyyy"
                // disabled={isTotalCovered}
                maxDate={new Date()}
                label="Fecha de nacimiento"
                width="180px"
                showMonthDropdown
                showYearDropdown
                control={DatePicker}>
              </FormField>
            )}
          />
        </FieldsContainer>
        <FieldsContainer>
          {/* Nombre de usuario */}
          <TextControlled
            flex="3"
            name="username"
            label="Usuario"
            placeholder="Usuario"
            rules={RULES.REQUIRED}
            disabled={view}
          />

          {/* Dirección */}
          <TextControlled
            flex="3"
            name="address"
            label="Dirección"
            placeholder="Dirección"
            disabled={view}
          />
          <NumberControlled
            width="130px"
            name="phoneNumber.areaCode"
            label="Código de Área"
            placeholder="Ej: 011"

            rules={{
              required: "El código de área es requerido.",
              validate: (value, { phoneNumber }) =>
                (value + (phoneNumber?.number || "")).length === 10 ||
                "El área y el número deben sumar 10 dígitos.",
            }}
            disabled={view}
            maxLength="4"
            normalMode
          />
          <NumberControlled
            width="150px"
            name="phoneNumber.number"
            label="Número de Teléfono"
            placeholder="Ej: 12345678"
            rules={{
              required: "El número de teléfono es requerido.",
              validate: (value, { phoneNumber }) =>
                ((phoneNumber?.areaCode || "") + value).length === 10 ||
                "El área y el número deben sumar 10 dígitos.",
            }}
            disabled={view}
            maxLength="7"
            normalMode
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextAreaControlled name="comments" label="Comentarios" disabled={!isUpdating && view} />
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