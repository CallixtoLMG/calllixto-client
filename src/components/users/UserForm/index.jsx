import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { RULES, SHORTKEYS } from "@/common/constants";
import { validateEmail } from "@/common/utils";
import { getPastDate } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DatePickerControlled } from "../../../common/components/form/DatePicker";
import { EMPTY_USER, USERS_ROLE_OPTIONS } from "../users.constants";

const UserForm = forwardRef(({
  user = EMPTY_USER, onSubmit, isLoading, isUpdating, view, isDeletePending
}, ref) => {

  const getInitialValues = (user) => ({
    ...EMPTY_USER,
    ...user,
    role: user?.role || USERS_ROLE_OPTIONS.find(option => option.value === "user")?.value,
    birthDate: user?.birthDate ? new Date(user.birthDate) : getPastDate(18, "years"),
    phoneNumber: {
      areaCode: user?.phoneNumber?.areaCode ?? '',
      number: user?.phoneNumber?.number ?? '',
    },
  });

  const methods = useForm({
    defaultValues: getInitialValues(user),
  });

  const { handleSubmit, reset, formState: { isDirty } } = methods;
  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleCreate)(),
    resetForm: () => reset(getInitialValues(user))
  }));

  const handleCreate = (data) => {
    onSubmit(data);
    reset(data);
  };

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleCreate),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(user)),
      condition: validateShortcuts.canReset,
    }
  ]);

  

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <TextControlled
            width="25%"
            name="username"
            label="Usuario"
            placeholder="nombre@empresa.com"
            rules={{
              required: "Este campo es obligatorio.",
              validate: {
                email: (value) => validateEmail(value) || "El correo electrónico no es válido.",
              },
            }}
            disabled={view}
            iconLabel
            popupPosition="bottom left"
            showPopup
            popupContent="Introduce el email del usuario."
          />
          <DropdownControlled
            width="25%"
            name="role"
            label="Rol"
            icon={(!isUpdating && view) ? null : undefined}
            defaultValue={user?.role || "user"}
            rules={RULES.REQUIRED}
            options={USERS_ROLE_OPTIONS}
            disabled={!isUpdating && view}
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextControlled
            width="25%"
            name="firstName"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
          <TextControlled
            width="25%"
            name="lastName"
            label="Apellido"
            placeholder="Apellido"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
          <DatePickerControlled
            disabled={!isUpdating && view}
            name="birthDate"
            label="Fecha de nacimiento"
            width="180px"
            defaultValue={getPastDate(18, "years")}
            maxDate={new Date()}
            showMonthDropdown
            showYearDropdown
            scrollableYearDropdown
            yearDropdownItemNumber={80}
            rules={{
              required: "Campo requerido.",
              validate: (value) => {
                const today = new Date();
                const minBirthDate = new Date();
                minBirthDate.setFullYear(today.getFullYear() - 18);
                return value <= minBirthDate || "El usuario debe tener al menos 18 años.";
              }
            }}
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextControlled
            width="51%"
            name="address"
            label="Dirección"
            placeholder="Dirección"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
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
            disabled={!isUpdating && view}
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
            disabled={!isUpdating && view}
            maxLength="7"
            normalMode
          />
        </FieldsContainer>
        <FieldsContainer>
          <TextAreaControlled name="comments" label="Comentarios" disabled={!isUpdating && view} />
        </FieldsContainer>
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            disabled={isDeletePending}
            onReset={() => reset(getInitialValues(user))}
          />
        )}
      </Form>
    </FormProvider>
  );
});

UserForm.displayName = "UserForm";


export default UserForm;