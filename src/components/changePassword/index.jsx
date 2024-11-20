"use client";
import { GoBackButton } from "@/components/common/buttons";
import { Loader } from "@/components/layout";
import { COLORS, PAGES, RULES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form } from "semantic-ui-react";
import { Flex, FlexColumn, Label } from "../common/custom";
import PasswordInput from "../common/custom/PasswordInput";
import { ModGrid, ModGridColumn, ModHeader } from "./styled";

const ChangePasswordForm = ({ onSubmit }) => {
  const { push } = useRouter();
  const { handleSubmit, control, watch } = useForm();
  const [isLoading, setIsLoading] = useState(false);

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
      toast.error("Hubo un error al intentar cambiar la contraseña.");
      setIsLoading(false);
    },
    onSettled: () => {
      setIsLoading(false);
    },
  });

  const newPassword = watch("newPassword");

  return (
    <Loader active={false}>
      <ModGrid>
        <ModGridColumn>
          <ModHeader as="h3">
            <Label content="Cambiar Contraseña" />
          </ModHeader>
          <Form
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit(mutate)();
              }
            }}
            onSubmit={handleSubmit(mutate)}
          >
            <Controller
              name="currentPassword"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <PasswordInput
                  field={field}
                  placeholder="Contraseña actual"
                  error={false}
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <PasswordInput
                  field={field}
                  placeholder="Nueva contraseña"
                  error={false}
                />
              )}
            />
            <Controller
              name="confirmPassword"
              control={control}
              rules={{
                ...RULES.REQUIRED,
                validate: (value) =>
                  value === newPassword || "Las contraseñas no coinciden",
              }}
              render={({ field, fieldState: { error } }) => (
                <PasswordInput
                  field={field}
                  placeholder="Confirmar nueva contraseña"
                  error={error?.message}
                />
              )}
            />
            <FlexColumn rowGap="14px" >
              <Button loading={isLoading} disabled={isLoading} fluid color={COLORS.GREEN}>Confirmar</Button>
              <Flex justifyContent="center">
                <GoBackButton />
              </Flex>
            </FlexColumn>
          </Form>
        </ModGridColumn>
      </ModGrid>
    </Loader>
  );
};

export default ChangePasswordForm;
