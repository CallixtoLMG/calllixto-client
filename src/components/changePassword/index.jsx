import { confirmReset, recoverPassword } from "@/api/login";
import { getUserData } from "@/api/userData";
import { GoBackButton } from "@/components/common/buttons";
import { Loader } from "@/components/layout";
import { COLORS, ICONS, RULES } from "@/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form } from "semantic-ui-react";
import { Flex, FlexColumn, Label, Message } from "../common/custom";
import PasswordInput from "../common/custom/PasswordInput";
import { ModGrid, ModGridColumn, ModHeader } from "./styled";

const ChangePasswordForm = () => {
  const { push } = useRouter();
  const { handleSubmit, control, watch, reset } = useForm();
  const [email, setEmail] = useState("");
  const [isCodeRequested, setIsCodeRequested] = useState(false);

  useEffect(() => {
    const getData = async () => {
      const sessionData = await getUserData();
      if (sessionData) {
        setEmail(sessionData.username);
      }
    };

    getData();
  }, []);

  const { mutate: requestCode, isPending: isRequestCodePending } = useMutation({
    mutationFn: async () => {
      const data = await recoverPassword({ username: email });
      return data;
    },
    onSuccess: () => {
      toast.success("Código de validación enviado a tu correo.");
      setIsCodeRequested(true);
    },
    onError: () => {
      toast.error("Hubo un error al solicitar el código de validación.");
    },
  });

  const { mutate: onConfirmReset, isPending: isOnConfirmResetPending } = useMutation({
    mutationFn: async (passwordData) => {
      const { confirmPassword, ...dataToSend } = passwordData;
      const response = await confirmReset(dataToSend);

      if (!response.ok && response.error) {
        throw new Error(response.error);
      }

      return response;
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada con éxito.");
      resetInputs();
    },
    onError: (error) => {
      console.error("Error:", error);
      toast.error("Hubo un error al cambiar la contraseña.");
    },
  });

  const resetInputs = () => {
    reset({
      confirmationCode: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const newPassword = watch("newPassword");

  const handleConfirmReset = (data) => {
    const payload = {
      ...data,
      username: email,
    };
    onConfirmReset(payload);
  };

  return (
    <Loader active={false}>
      <ModGrid>
        <ModGridColumn>
          <ModHeader as="h3">
            <Label content="Cambiar contraseña" />
          </ModHeader>
          <Flex justifyContent="center" marginBottom="14px">
            <Button
              fluid
              type="button"
              color="blue"
              loading={isRequestCodePending}
              disabled={isRequestCodePending}
              onClick={() => requestCode()}
            >
              Solicitar código de validación
            </Button>
          </Flex>
          <Flex justifyContent="center" marginBottom="14px">
            <Message style={{ color: "gray", textAlign: "center" }}>
              Al solicitar el código, recibirás un enlace en tu correo para validar el cambio de contraseña.
            </Message>
          </Flex>

          <Form onSubmit={handleSubmit(handleConfirmReset)}>
            <Controller
              name="confirmationCode"
              control={control}
              rules={{ required: "El código es obligatorio" }}
              render={({ field, fieldState: { error } }) => (
                <Form.Input
                  {...field}
                  placeholder="Código de recuperación"
                  fluid
                  icon={ICONS.MAIL_SQUARE}
                  iconPosition="left"
                  disabled={!isCodeRequested}
                  error={
                    error
                      ? { content: error.message, pointing: "below" }
                      : false
                  }
                />
              )}
            />
            <Controller
              name="newPassword"
              control={control}
              rules={{
                required: "La nueva contraseña es obligatoria",
                minLength: {
                  value: 6,
                  message: "La contraseña debe tener al menos 6 caracteres",
                },
              }}
              render={({ field, fieldState: { error } }) => (
                <PasswordInput
                  field={field}
                  placeholder="Nueva contraseña"
                  error={error}
                  disabled={!isCodeRequested}
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
                  error={error}
                  disabled={!isCodeRequested}
                />
              )}
            />
            <FlexColumn rowGap="14px">
              <Button
                loading={isOnConfirmResetPending}
                disabled={isOnConfirmResetPending || isRequestCodePending || !isCodeRequested}
                fluid
                color={COLORS.GREEN}
              >
                Confirmar
              </Button>
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
