"use client";
import { GoBackButton } from "@/components/common/buttons";
import { Loader } from "@/components/layout";
import { ICONS, PAGES, RULES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Form } from "semantic-ui-react";
import { Flex } from "../common/custom";
import { ModButton, ModGrid, ModGridColumn, ModHeader, Text } from "./styled";

const ChangePasswordForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { mutate } = useMutation({
    mutationFn: async (passwordData) => {
      setIsLoading(true);
      const data = await onSubmit(passwordData);
      return data;
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada exitosamente!");
      push(PAGES.LOGIN.BASE);
    },
    onError: () => {
      toast.error("Hubo un error al intentar cambiar la contraseña. Por favor, inténtalo de nuevo.");
      setIsLoading(false);
    },
  });

  const newPassword = watch("newPassword");

  return (
    <Loader active={isLoading}>
      <ModGrid>
        <ModGridColumn>
          <ModHeader as="h3">
            <Text>Cambiar Contraseña</Text>
          </ModHeader>
          <Form onSubmit={handleSubmit(mutate)} size="large">
            <Controller
              name="currentPassword"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Form.Input
                  {...field}
                  type={showCurrentPassword ? "text" : "password"}
                  placeholder="Contraseña actual"
                  fluid
                  icon={ICONS.LOCK}
                  iconPosition="left"
                  action={{
                    icon: showCurrentPassword ? ICONS.EYE_SLASH : ICONS.EYE,
                    onClick: (e) => {
                      e.preventDefault();
                      setShowCurrentPassword(!showCurrentPassword);
                    },
                    type: "button",
                    title: showCurrentPassword ? "Ocultar contraseña" : "Mostrar contraseña",
                  }}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Form.Input
                  {...field}
                  type={showNewPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  fluid
                  icon={ICONS.LOCK}
                  iconPosition="left"
                  action={{
                    icon: showNewPassword ? ICONS.EYE_SLASH : ICONS.EYE,
                    onClick: (e) => {
                      e.preventDefault();
                      setShowNewPassword(!showNewPassword);
                    },
                    type: "button",
                    title: showNewPassword ? "Ocultar contraseña" : "Mostrar contraseña",
                  }}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                ...RULES.REQUIRED,
                validate: (value) => value === newPassword || "Las contraseñas no coinciden",
              }}
              render={({ field, fieldState: { error } }) => (
                <Form.Input
                  {...field}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirmar nueva contraseña"
                  fluid
                  icon={ICONS.LOCK}
                  iconPosition="left"
                  error={error?.message}
                  action={{
                    icon: showConfirmPassword ? ICONS.EYE_SLASH : ICONS.EYE,
                    onClick: (e) => {
                      e.preventDefault();
                      setShowConfirmPassword(!showConfirmPassword);
                    },
                    type: "button",
                    title: showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña",
                  }}
                />
              )}
            />
            <ModButton margin="0 0.25px 16px 0" fluid="true" size="large">
              Cambiar contraseña
            </ModButton>
            <Flex justifyContent="center">
              <GoBackButton />
            </Flex>
          </Form>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default ChangePasswordForm;
