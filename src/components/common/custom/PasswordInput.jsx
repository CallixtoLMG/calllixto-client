import { ICONS } from "@/constants";
import { useState } from "react";
import { Form } from "semantic-ui-react";

const PasswordInput = ({ field, placeholder, error }) => {
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
      icon={ICONS.LOCK}
      iconPosition="left"
      error={error}
      action={{
        icon: isVisible ? ICONS.EYE_SLASH : ICONS.EYE,
        onClick: toggleVisibility,
        onKeyDown: (e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            e.stopPropagation();
          }
        },
        title: isVisible ? "Ocultar contraseña" : "Mostrar contraseña",
      }}
    />
  );
};

export default PasswordInput;
