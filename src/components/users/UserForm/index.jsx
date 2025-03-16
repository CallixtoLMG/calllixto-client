import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form } from "@/common/components/custom";
import { DropdownControlled, NumberControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { DatepickerControlled } from "@/common/components/form/Datepicker";
import { DATE_FORMATS, RULES, SHORTKEYS } from "@/common/constants";
import { getEighteenYearsAgo, getFormatedDate } from "@/common/utils/dates";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useCallback } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_USER, getRoleOptions } from "../users.constants";

const GET_ROLES = getRoleOptions();
const ROLE_OPTIONS = GET_ROLES.map((role, index) => ({
  key: `${role.value}-${index}`,
  text: role.text,
  value: role.value,
})).reverse();

const UserForm = ({ user = EMPTY_USER, onSubmit, isLoading, isUpdating, view, isDeletePending  }) => {
  const methods = useForm({
    defaultValues: {
      ...EMPTY_USER,
      ...user,
      role: user?.role || ROLE_OPTIONS.find(option => option.value === "user")?.value,
      birthDate: user?.birthDate ? new Date(user.birthDate) : getEighteenYearsAgo(),
    },
  });

  const { handleSubmit, control, reset, formState: { isDirty } } = methods;

  const handleReset = useCallback((user) => {
    reset(user);
  }, [reset]);

  const handleCreate = (data) => {
    onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleCreate)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_USER, ...user } : EMPTY_USER), SHORTKEYS.DELETE);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleCreate)}>
        <FieldsContainer>
          <TextControlled
            width="35%"
            name="username"
            label="Usuario"
            placeholder="Usuario"
            rules={RULES.REQUIRED}
            disabled={view}
            iconLabel
            popupPosition="bottom left"
            showPopup={true}
            popupContent="Este será el nombre del Usuario, introduce un email válido por favor."
          />
          {!isUpdating && view
            ? <TextField
              width="25%"
              label="Rol"
              value={ROLE_OPTIONS.find(option => option.value === user?.role)?.text || user?.role}
              disabled
            />
            : <DropdownControlled
              width="25%"
              name="role"
              label="Rol"
              defaultValue={user?.role || "user"}
              rules={RULES.REQUIRED}
              options={ROLE_OPTIONS}
              disabled={!isUpdating && view}
            />
          }
        </FieldsContainer>
        <FieldsContainer>
          <TextControlled
            width="30%"
            name="firstName"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={!isUpdating && view}
          />
          <TextControlled
            width="30%"
            name="lastName"
            label="Apellido"
            placeholder="Apellido"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={!isUpdating && view}
          />
          {!isUpdating && view
            ?
            <TextField width="150px" label="Fecha de nacimiento" value={getFormatedDate(user?.birthDate, DATE_FORMATS.ONLY_DATE)} disabled />
            :
            <DatepickerControlled
              name="birthDate"
              label="Fecha de nacimiento"
              width="180px"
              defaultValue={getEighteenYearsAgo()}
              maxDate={new Date()}
              showMonthDropdown
              showYearDropdown
            />
          }
        </FieldsContainer>
        <FieldsContainer>
          <TextControlled
            width="40%"
            name="address"
            label="Dirección"
            placeholder="Dirección"
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
            onReset={() => handleReset(isUpdating ? { ...EMPTY_USER, ...user } : EMPTY_USER)}
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default UserForm;