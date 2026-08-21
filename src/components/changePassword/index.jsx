import { confirmReset, recoverPassword } from "@/api/login";
import { getUserData } from "@/api/userData";
import { Button, FlexColumn, Form } from "@/common/components/custom";
import { isPasswordConfirmationValid, PASSWORD_MATCH_REQUIREMENT, PasswordControlled, TextControlled } from "@/common/components/form";
import { COLORS, ICONS, PAGES, PASSWORD_REQUIREMENTS, RULES } from "@/common/constants";
import AuthLayout, { AuthHelperText, AuthSecondaryLink } from "@/components/auth/AuthLayout";
import { Loader } from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";

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

  const newPassword = watch("newPassword", "");
  const confirmPassword = watch("confirmPassword", "");

  const handleConfirmReset = (data) => {
    const payload = {
      ...data,
      username: email,
    };
    onConfirmReset(payload);
  };

  return (
    <Loader active={false}>
      <AuthLayout
        maxWidth="460px"
        variant="embedded"
        showLogo={false}
      >
        <FlexColumn $rowGap="15px">
          <Button
            color={COLORS.BLUE}
            width="100%"
            height="42px"
            $fontSize="15px"
            padding="0 18px"
            type="button"
            loading={isRequestCodePending}
            disabled={isRequestCodePending}
            onClick={() => requestCode()}
          >
            Solicitar código de validación
          </Button>
          <AuthHelperText>
            Te enviaremos por correo un enlace con el código necesario para cambiar tu contraseña.
          </AuthHelperText>
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
                placeholder="Nueva contraseña"
                showPasswordRequirements
                additionalPasswordRequirements={[PASSWORD_MATCH_REQUIREMENT]}
                passwordRequirementsContext={{ confirmPassword }}
                disabled={!isCodeRequested}
              />
              <PasswordControlled
                name="confirmPassword"
                placeholder="Confirmar Contraseña"
                rules={{
                  ...RULES.REQUIRED,
                  validate: (value) =>
                    isPasswordConfirmationValid(newPassword, value) || "Las contraseñas no coinciden",
                }}
                disabled={!isCodeRequested}
              />
              <FlexColumn $rowGap="15px">
                <Button
                  loading={isOnConfirmResetPending}
                  disabled={isOnConfirmResetPending || isRequestCodePending || !isCodeRequested}
                  width="100%"
                  height="42px"
                  $fontSize="15px"
                  padding="0 18px"
                  type="submit"
                  color={COLORS.BLUE}
                >
                  Confirmar
                </Button>
              </FlexColumn>
            </Form>
          </FormProvider>
          <AuthSecondaryLink onClick={() => push(PAGES.LOGIN.BASE)}>
            Volver al inicio de sesión
          </AuthSecondaryLink>
        </FlexColumn>
      </AuthLayout>
    </Loader>
  );
};

export default ChangePasswordForm;
