import { confirmReset, recoverPassword } from "@/api/login";
import { getUserData } from "@/api/userData";
import { Loader } from "@/components/layout";
import { COLORS, ICONS, PAGES, PASSWORD_REQUIREMENTS, RULES } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, FlexColumn, Form, Message } from "../common/custom";
import { PasswordControlled, TextControlled } from "../common/form";

const ChangePasswordForm = () => {
  const { push } = useRouter();
  const methods = useForm();
  const { handleSubmit, watch, reset } = methods;
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

  const resetInputs = useCallback(() => {
    reset({
      confirmationCode: "",
      newPassword: "",
      confirmPassword: "",
    });
  }, [reset]);

  useEffect(() => {
    if (!isCodeRequested) {
      resetInputs();
    }
  }, [isCodeRequested, resetInputs]);

  const { mutate: requestCode, isPending: isRequestCodePending } = useMutation({
    mutationFn: () => {
      return recoverPassword({ username: email });
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
    mutationFn: (passwordData) => {
      const { confirmPassword, ...dataToSend } = passwordData;
      return confirmReset(dataToSend);
    },
    onSuccess: () => {
      toast.success("Contraseña cambiada con éxito.");
      resetInputs();
      push(PAGES.LOGIN.BASE);
    },
    onError: (error) => {
      if (error.name.includes("LimitExceededException")) {
        toast.error("Se ha excedido el límite de intentos permitidos, por favor pruebe más tarde.");
      } else if (error.name.includes("CodeMismatchException")) {
        toast.error("Hubo un error en el código de validación.");
      } else {
        toast.error("Hubo un error al cambiar la contraseña.");
        console.error("Error:", error);
      }
    },
  });

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
      <FlexColumn alignItems="center" justifyContent="center" marginTop="90px">
        <FlexColumn width="350px">
          <Button
            color="blue"
            width="100%"
            loading={isRequestCodePending}
            disabled={isRequestCodePending}
            onClick={() => requestCode()}
          >
            Solicitar código de validación
          </Button>
          <Message style={{ color: "gray", textAlign: "center" }}>
            Al solicitar el código, recibirás un enlace en tu correo para validar el cambio de contraseña.
          </Message>
          <FormProvider {...methods}>
            <Form onSubmit={handleSubmit(handleConfirmReset)}>
              <TextControlled
                name="confirmationCode"
                placeholder="Código de recuperación"
                icon={ICONS.MAIL_SQUARE}
                iconPosition="left"
                disabled={!isCodeRequested}
                rules={RULES.REQUIRED}
              />
              <PasswordControlled
                name="newPassword"
                rules={{
                  ...RULES.REQUIRED,
                  validate: (value) => {
                    const failedRequirements = PASSWORD_REQUIREMENTS.filter(
                      (req) => !req.test.test(value)
                    );
                    return (
                      failedRequirements.length === 0 ||
                      "La contraseña no cumple con los requisitos."
                    );
                  },
                }}
                placeholder="Nuevo Contraseña"
                showPasswordRequirements
                disabled={!isCodeRequested}
              />
              <PasswordControlled
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                rules={{
                  ...RULES.REQUIRED,
                  validate: (value) =>
                    value === newPassword || "Las contraseñas no coinciden",
                }}
                disabled={!isCodeRequested}
              />
              <FlexColumn rowGap="14px">
                <Button
                  loading={isOnConfirmResetPending}
                  disabled={isOnConfirmResetPending || isRequestCodePending || !isCodeRequested}
                  width="100%"
                  color={COLORS.GREEN}
                >
                  Confirmar
                </Button>
              </FlexColumn>
            </Form>
          </FormProvider>
        </FlexColumn>
      </FlexColumn>
    </Loader>
  );
};

export default ChangePasswordForm;
