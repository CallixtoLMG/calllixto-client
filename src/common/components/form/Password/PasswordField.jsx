import { ICONS } from "@/common/constants";
import { useState } from "react";
import { FormField, Input } from "../../custom";

const PasswordInput = ({ flex, width, label, error, placeholder, disabled, ...inputParams }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = (e) => {
    e.preventDefault();
    setIsVisible(!isVisible);
  };

  return (
    <FormField
      flex={flex}
      width={width}
      label={label}
      control={Input}
      error={error}
    >
      <Input
        {...inputParams}
        type={isVisible ? "text" : "password"}
        label={label}
        placeholder={placeholder ?? label}
        disabled={disabled}
        icon={ICONS.LOCK}
        iconPosition="left"
        action={{
          icon: isVisible ? ICONS.EYE_SLASH : ICONS.EYE,
          onClick: toggleVisibility,
          title: isVisible ? "Ocultar contraseña" : "Mostrar contraseña",
          type: "button",
        }}
      />
    </FormField>
  );
};

export default PasswordInput;
