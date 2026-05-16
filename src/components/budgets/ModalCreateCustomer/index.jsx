import { useCreateCustomer } from "@/api/customers";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Form, FormField } from "@/common/components/custom";
import { NumberControlled, TextControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Modal, Transition } from "semantic-ui-react";

const getDefaultValues = (initialName = "") => ({
  name: initialName,
  refA: "",
  address: "",
  refP: "",
  areaCode: "",
  number: "",
});

const ModalCreateCustomer = ({ isModalOpen, onClose, initialName = "" }) => {
  const [isLoading, setIsLoading] = useState(false);
  const createCustomer = useCreateCustomer();
  const methods = useForm({ defaultValues: getDefaultValues(initialName) });
  const {
    handleSubmit,
    reset,
    watch,
    trigger,
    formState: { isSubmitted },
  } = methods;
  const nameInputRef = useRef(null);
  const formRef = useRef(null);

  useEffect(() => {
    if (!isModalOpen) return;

    reset(getDefaultValues(initialName.trim()));

    const timeout = setTimeout(() => {
      nameInputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeout);
  }, [initialName, isModalOpen, reset]);

  const handleCreate = async ({ name, refA, address, refP, areaCode, number }) => {
    const trimmedName = name?.trim();
    const trimmedAddress = address?.trim();
    const trimmedAreaCode = areaCode?.trim();
    const trimmedNumber = number?.trim();
    const hasAddress = !!trimmedAddress;
    const hasPhone = !!trimmedAreaCode || !!trimmedNumber;

    const data = {
      name: trimmedName,
      addresses: hasAddress
        ? [{
          ref: refA?.trim(),
          address: trimmedAddress,
        }]
        : [],
      phoneNumbers: hasPhone
        ? [{
          ref: refP?.trim(),
          areaCode: trimmedAreaCode,
          number: trimmedNumber,
        }]
        : [],
    };

    setIsLoading(true);

    try {
      const response = await createCustomer(data);

      if (response?.statusOk) {
        toast.success("Cliente creado!");
        reset(getDefaultValues(""));
        onClose(response.customer ?? data);
        return;
      }

      toast.error(response?.error?.message || response?.message || "Error al crear el cliente.");
    } catch (error) {
      toast.error(error?.message || "Error al crear el cliente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClick = () => {
    formRef.current?.dispatchEvent(new Event("submit", { cancelable: true, bubbles: true }));
  };

  const handleClose = () => {
    if (isLoading) return;

    reset(getDefaultValues(initialName.trim()));
    onClose(null);
  };

  return (
    <Transition visible={isModalOpen} animation="scale" duration={500}>
      <Modal closeIcon open={isModalOpen} onClose={handleClose}>
        <Modal.Header>Crear cliente</Modal.Header>
        <Modal.Content>
          <FormProvider {...methods}>
            <Form ref={formRef} onSubmit={handleSubmit(handleCreate)}>
              <FieldsContainer>
                <TextControlled
                  flex="1"
                  name="name"
                  label="Nombre"
                  placeholder="Martín Bueno"
                  rules={{
                    required: "El nombre es requerido.",
                    validate: (value) => !!value?.trim() || "El nombre es requerido.",
                  }}
                  ref={nameInputRef}
                  required
                />
                <FormField flex="1" />
                <FormField flex="1" />
              </FieldsContainer>
              <FieldsContainer>
                <TextControlled
                  flex="1"
                  width="30%"
                  name="refA"
                  label="Referencia dirección"
                  placeholder="Casa"
                />
                <TextControlled
                  flex="1"
                  width="50%"
                  name="address"
                  label="Dirección"
                  placeholder="Av. Siempre Viva 742"
                  rules={{
                    validate: (value) => {
                      if (!value && !watch("refA")?.trim()) return true;
                      return !!value?.trim() || "La dirección es requerida.";
                    },
                  }}
                />
                <FormField flex="1" />
              </FieldsContainer>
              <FieldsContainer>
                <TextControlled
                  flex="1"
                  name="refP"
                  label="Referencia teléfono"
                  placeholder="Celular"
                />
                <NumberControlled
                  flex="1"
                  label="Código de área"
                  placeholder="351"
                  name="areaCode"
                  maxLength="4"
                  rules={{
                    validate: (value) => {
                      const currentNumber = watch("number") ?? "";

                      if (!value && !currentNumber) return true;
                      if (!value) return "El código de área es requerido.";

                      return (value + currentNumber).length === 10 || "El área y el número deben sumar 10 dígitos.";
                    },
                  }}
                  onChange={() => isSubmitted && trigger("number")}
                  normalMode
                />
                <NumberControlled
                  flex="1"
                  label="Número de teléfono"
                  name="number"
                  placeholder="1234567"
                  rules={{
                    validate: (value) => {
                      const currentAreaCode = watch("areaCode") ?? "";

                      if (!value && !currentAreaCode) return true;
                      if (!value) return "El número de teléfono es requerido.";

                      return (currentAreaCode + value).length === 10 || "El área y el número deben sumar 10 dígitos.";
                    },
                  }}
                  onChange={() => isSubmitted && trigger("areaCode")}
                  maxLength="7"
                  normalMode
                />
              </FieldsContainer>
            </Form>
          </FormProvider>
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              text="Cancelar"
              icon={ICONS.CANCEL}
              disabled={isLoading}
              color={COLORS.RED}
              onClick={handleClose}
            />
            <IconedButton
              text="Crear"
              icon={ICONS.ADD}
              disabled={isLoading}
              loading={isLoading}
              color={COLORS.GREEN}
              onClick={handleConfirmClick}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalCreateCustomer;