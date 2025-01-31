import { ICONS } from "@/common/constants";
import { useState } from "react";
import { Form } from "semantic-ui-react";

const PasswordInput = ({ field, placeholder, error, disabled }) => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = (e) => {
    e.preventDefault();
    setIsVisible(!isVisible);
  };

  return (
    <Form.Input
      {...field}
      type={isVisible ? "text" : "password"}
      placeholder={placeholder}
      fluid
      disabled={disabled}
      icon={ICONS.LOCK}
      iconPosition="left"
      error={
        error
          ? { content: error.message, pointing: "below" }
          : false
      }
      action={{
        icon: isVisible ? ICONS.EYE_SLASH : ICONS.EYE,
        onClick: toggleVisibility,
        title: isVisible ? "Ocultar contraseña" : "Mostrar contraseña",
        type: "button",
      }}
    />
  );
};

export default PasswordInput;
