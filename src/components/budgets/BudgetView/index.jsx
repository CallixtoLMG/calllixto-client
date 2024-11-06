import { useUpdatePayments } from "@/api/budgets";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Flex, FormField, Icon, Label, Price, Segment, ViewContainer } from "@/components/common/custom";
import Payments from "@/components/common/form/Payments";
import { Table, Total } from "@/components/common/table";
import { CommentTooltip } from "@/components/common/tooltips";
import { COLORS, ICONS, PICK_UP_IN_STORE } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedSimplePhone, getPrice, getTotal, isBudgetCancelled, isBudgetConfirmed, now } from "@/utils";
import { useMutation } from "@tanstack/react-query";
import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Popup } from "semantic-ui-react";
import { getBudgetState } from "../budgets.common";
import { Container, Message, MessageHeader } from "./styles";

const BudgetView = ({ budget, subtotal, subtotalAfterDiscount, total, selectedContact, setSelectedContact }) => {
  const methods = useForm({
    defaultValues: {
      paymentsMade: budget?.paymentsMade || [],
    },
    mode: "onChange",
  });
  const { formState: { isDirty } } = methods;

  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const { isUpdating, toggleButton, setIsUpdating } = useAllowUpdate({ canUpdate: true });
  const updatePayment = useUpdatePayments();
  const budgetState = getBudgetState(budget);

  const { mutate: mutateUpdatePayment, isPending: isLoadingUpdatePayment } = useMutation({
    mutationFn: async () => {
      const formData = methods.getValues();
      const updatedBudget = {
        ...budget,
        paymentsMade: formData.paymentsMade,
        updatedAt: now(),
      };

      const data = await updatePayment({ budget: updatedBudget, id: budget.id });

      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Pagos actualizados!");
        setIsUpdating(false);
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Código",
        value: (product) => (
          <>
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(0, 2)}</span>}
              position="top center"
              on="hover"
              content={product.brandName}
            />
            -
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(3, 5)}</span>}
              position="top center"
              on="hover"
              content={product.supplierName}
            />
            -
            <span>{formatProductCodePopup(product.code).formattedCode.substring(6)}</span>
          </>
        ),
        id: 1,
        width: 1,
        align: 'left'
      },
      {
        title: "Cantidad", value: (product, index) => <p>{product?.quantity}</p>,
        id: 2,
        width: 2
      },
      {
        title: "Nombre",
        value: (product) => (
          <Container>
            {product.name} {product.fractionConfig?.active && `x ${product.fractionConfig?.value} ${product.fractionConfig?.unit}`}
            <Flex marginLeft="7px">
              {product.comments && <CommentTooltip comment={product.comments} />}
              {product.dispatchComment && (
                <Popup
                  size="mini"
                  content={product.dispatchComment}
                  position="top center"
                  trigger={<Icon name={ICONS.TRUCK} color={COLORS.ORANGE} />
                  }
                />
              )}
            </Flex>
          </Container>
        ),
        id: 3,
        width: 7,
        wrap: true,
        align: 'left'
      },
      {
        title: "Precio",
        value: (product) => <Price value={getPrice(product)} />,
        id: 4,
        width: 2,
      },
      {
        title: "Descuento",
        value: (product, index) => <p>{formatedPercentage(product?.discount)}</p>,
        id: 5,
        width: 1
      },
      {
        title: "Total",
        value: (product) => <Price value={getTotal(product)} />,
        id: 6,
        width: 3
      },
    ];
  }, []);

  return (
    <ViewContainer>
      {isBudgetCancelled(budget?.state) &&
        <FieldsContainer>
          <Message negative >
            <MessageHeader>Motivo de anulación</MessageHeader>
            <p>{budget?.cancelledMsg}</p>
          </Message>
        </FieldsContainer>}
      <Flex justifyContent="space-between" >
        <FieldsContainer >
          <FormField width="300px">
            <Label>Vendedor</Label>
            <Segment placeholder>{budget?.seller}</Segment>
          </FormField>
          {budgetState && (
            <FormField width="300px">
              <Label color={budgetState.color}>{budgetState.label}</Label>
              <Segment placeholder>{budgetState.person}</Segment>
            </FormField>)}
        </FieldsContainer>
        <FieldsContainer >
          {budgetState && (
            <FormField>
              <Label color={budgetState.color}>{budgetState.dateLabel}</Label>
              <Segment placeholder>{budgetState.date}</Segment>
            </FormField>
          )}
          {!isBudgetConfirmed(budget?.state) && !isBudgetCancelled(budget?.state) &&
            <FormField>
              <Label>Fecha de vencimiento</Label>
              <Segment placeholder>{formatedDateOnly(expirationDate(budget?.expirationOffsetDays, budget?.createdAt))}</Segment>
            </FormField>
          }
        </FieldsContainer>
      </Flex>
      <FieldsContainer>
        <FormField width="300px">
          <Label>Cliente</Label>
          <Segment placeholder>{budget?.customer?.name ? budget?.customer?.name : "No se ha seleccionado cliente"}</Segment>
        </FormField>
        <FormField flex="2">
          <Label>Dirección</Label>
          {budget?.pickUpInStore ? (
            <Segment placeholder>{PICK_UP_IN_STORE}</Segment>
          ) : !budget?.customer?.addresses?.length ? (
            <Segment placeholder>No existe una dirección registrada</Segment>
          ) : budget.customer.addresses.length === 1 ? (
            <Segment placeholder>{`${budget.customer?.addresses?.[0]?.ref ? `${budget.customer?.addresses?.[0]?.ref} :` : ""} ${budget.customer?.addresses?.[0]?.address}`}</Segment>
          ) : (
            (
              <Dropdown
                selection
                options={budget?.customer?.addresses.map((address) => ({
                  key: address.address,
                  text: `${address.ref ? `${address.ref}: ` : ''}${address.address}`,
                  value: address.address,
                }))}
                value={selectedContact?.address}
                onChange={(e, { value }) => setSelectedContact({
                  ...selectedContact,
                  address: value
                })}
              />
            )
          )}
        </FormField>
        <FormField flex="1">
          <Label>Teléfono</Label>
          {!budget?.customer?.phoneNumbers?.length ? (
            <Segment placeholder>No existe un teléfono registrado</Segment>
          ) : budget?.customer?.phoneNumbers.length === 1 ? (
            <Segment placeholder>{`${budget.customer?.phoneNumbers?.[0]?.ref ? `${budget.customer?.phoneNumbers?.[0]?.ref} : ` : ""} ${formatedSimplePhone(budget.customer?.phoneNumbers?.[0])}`}</Segment>
          ) : (
            <Dropdown
              selection
              options={budget?.customer?.phoneNumbers.map((phone) => ({
                key: formatedSimplePhone(phone),
                text: `${phone.ref ? `${phone.ref}: ` : ''}${formatedSimplePhone(phone)}`,
                value: formatedSimplePhone(phone),
              }))}
              value={selectedContact?.phone}
              onChange={(e, { value }) => setSelectedContact({
                ...selectedContact,
                phone: value
              })}
            />
          )}
        </FormField>
      </FieldsContainer>
      <Table
        mainKey="key"
        headers={BUDGET_FORM_PRODUCT_COLUMNS}
        elements={budget?.products}
      />
      <Total
        readOnly
        subtotal={subtotal}
        total={total}
        subtotalAfterDiscount={subtotalAfterDiscount}
        globalDiscount={budget?.globalDiscount}
        additionalCharge={budget?.additionalCharge}
      />
      <FieldsContainer rowGap="5px" >
        <Label>Comentarios</Label>
        <Segment placeholder>{budget?.comments}</Segment>
      </FieldsContainer>
      {
        (isBudgetConfirmed(budget?.state) || isBudgetCancelled(budget?.state)) && (
          <>
            {isBudgetConfirmed(budget?.state) &&
              <Flex justifyContent="space-between">
                {toggleButton}
              </Flex>}
            <Payments update={isUpdating} total={total} methods={methods}>
              <SubmitAndRestore
                isUpdating={isUpdating}
                isLoading={isLoadingUpdatePayment}
                isDirty={isDirty}
                onSubmit={() => mutateUpdatePayment()}
                onReset={() => methods.reset({ paymentsMade: budget.paymentsMade })}
                disabled={!isDirty}
                text="Guardar"
              />
            </Payments>
          </>
        )
      }
      <FieldsContainer>
        <FormField flex={3}>
          <Label>Métodos de pago</Label>
          <Segment placeholder>{formattedPaymentMethods}</Segment>
        </FormField>
      </FieldsContainer>
    </ViewContainer >
  );
};

export default BudgetView;
