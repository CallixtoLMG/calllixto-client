import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, TextAreaControlled, TextControlled } from "@/common/components/form";
import { POPUP_POSITIONS, ERROR_MESSAGES, FIELD_LABELS, RULES, SHORTKEYS } from "@/common/constants";
import { validateEmail } from "@/common/utils";
import { getPastDate } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks";
import { ROLES, isCallixtoUser } from "@/roles";
import { isEqual } from "lodash";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { DatePickerControlled } from "../../../common/components/form/DatePicker";
import { EMPTY_USER, ROLE_LABELS, USERS_ROLE_OPTIONS } from "../users.constants";

const UserForm = forwardRef(({
  user = EMPTY_USER, onSubmit, isLoading, isUpdating, view, isDeletePending, separateRoleUpdate = false
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

  const { trigger, watch, handleSubmit, reset, formState: { isDirty, isSubmitted } } = methods;
  const isCallixtoRole = isCallixtoUser(user?.role);
  const roleOptions = isCallixtoRole
    ? [
      {
        key: ROLES.CALLIXTO,
        text: ROLE_LABELS.CALLIXTO,
        value: ROLES.CALLIXTO,
      },
      ...USERS_ROLE_OPTIONS,
    ]
    : USERS_ROLE_OPTIONS;

  const getEditPayload = (data) => {
    const currentValues = getInitialValues(user);
    const { role, ...userData } = data;
    const { role: currentRole, ...currentUserData } = currentValues;

    return {
      role: role !== currentRole ? { username: data.username, role } : null,
      user: !isEqual(userData, currentUserData) ? userData : null,
    };
  };

  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleCreate)(),
    resetForm: () => reset(getInitialValues(user))
  }));

  const handleCreate = (data) => {
    onSubmit(separateRoleUpdate ? getEditPayload(data) : data);
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
          <FormField flex="1">
            <TextControlled
              name="username"
              label="Usuario"
              placeholder="martinb@hotmail.com"
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD_ALT,
                validate: {
                  email: (value) => validateEmail(value) || "El correo electrónico no es válido.",
                },
              }}
              disabled={view}
              iconLabel={!view}
              popupPosition={POPUP_POSITIONS.BOTTOM_LEFT}
              showPopup={!view}
              popupContent="Introduce el email del usuario."
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1">
            <DropdownControlled
              height="38px"
              name="role"
              label="Rol"
              icon={(!isUpdating && view) ? null : undefined}
              defaultValue={user?.role || "user"}
              rules={RULES.REQUIRED}
              options={roleOptions}
              disabled={isCallixtoRole || (!isUpdating && view)}
            />
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <TextControlled
              name="firstName"
              label={FIELD_LABELS.NAME}
              placeholder="Martín"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1">
            <TextControlled
              name="lastName"
              label="Apellido"
              placeholder="Bueno"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1" />

        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <DatePickerControlled
              disabled={!isUpdating && view}
              name="birthDate"
              label="Fecha de nacimiento"
              placeholder="16-11-2025"
              defaultValue={getPastDate(18, "years")}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={80}
              rules={{
                required: ERROR_MESSAGES.REQUIRED_FIELD,
                validate: (value) => {
                  const today = new Date();
                  const minBirthDate = new Date();
                  minBirthDate.setFullYear(today.getFullYear() - 18);
                  return value <= minBirthDate || "El usuario debe tener al menos 18 años.";
                }
              }}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1">
            <TextControlled
              name="address"
              label="Dirección"
              placeholder="Mitre 525 9c"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1" />

        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <NumberControlled
              name="phoneNumber.areaCode"
              label="Código de área"
              placeholder="385"
              maxLength="4"
              rules={{
                required: "El código de área es requerido.",
                validate: (value) => {
                  const number = watch("phoneNumber.number") ?? '';
                  return (value + number).length === 10 || "El área y el número deben sumar 10 dígitos.";
                },
              }}
              onChange={() => isSubmitted && trigger("phoneNumber.number")}
              disabled={!isUpdating && view}
              normalMode
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1">
            <NumberControlled
              name="phoneNumber.number"
              label="Número de teléfono"
              placeholder="5228706"
              rules={{
                required: "El número de teléfono es requerido.",
                validate: (value) => {
                  const areaCode = watch("phoneNumber.areaCode") ?? '';
                  return (areaCode + value).length === 10 || "El área y el número deben sumar 10 dígitos.";
                },
              }}
              onChange={() => isSubmitted && trigger("phoneNumber.areaCode")}
              disabled={!isUpdating && view}
              maxLength="7"
              normalMode
              required={isUpdating || !view}
            />
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        <FieldsContainer>
          <TextAreaControlled name="comments" label={FIELD_LABELS.COMMENTS} placeholder="Martin Bueno no era un cliente?" readOnly={!isUpdating && view} />
        </FieldsContainer>
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            disabled={isDeletePending}
            onReset={() => reset(getInitialValues(user))}
            submit
          />
        )}
      </Form>
    </FormProvider >
  );
});

UserForm.displayName = "UserForm";


export default UserForm;