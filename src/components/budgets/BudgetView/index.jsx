import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Flex, FormField, Icon, Label, Price, Segment, ViewContainer } from "@/components/common/custom";
import PaymentMethods from "@/components/common/form/PaymentMethods";
import { Table, Total } from "@/components/common/table";
import { CommentTooltip } from "@/components/common/tooltips";
import { PICK_UP_IN_STORE } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedSimplePhone, getPrice, getTotal, isBudgetCancelled } from "@/utils";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { Container, Message, MessageHeader } from "./styles";

const BudgetView = ({ budget, subtotal, subtotalAfterDiscount, finalTotal, selectedContact, setSelectedContact }) => {
  const methods = useForm({
    defaultValues: {
      payments: budget?.payments || [], // Suponiendo que `payments` sea la lista de métodos de pago
    },
  });
  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: true });

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
                  trigger={<Icon name="truck" color="orange" />
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
      {isBudgetCancelled(budget?.state) && <FieldsContainer>
        <Message negative >
          <MessageHeader>Motivo de anulación</MessageHeader>
          <p>{budget?.cancelledMsg}</p>
        </Message>
      </FieldsContainer>}
      <FieldsContainer justifyContent="space-between">
        <FormField width="300px">
          <Label>Vendedor</Label>
          <Segment placeholder>{budget?.seller}</Segment>
        </FormField>
        <FormField >
          <Label>Fecha de vencimiento</Label>
          <Segment placeholder>{formatedDateOnly(expirationDate(budget?.createdAt, budget?.expirationOffsetDays))}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="300px">
          <Label>Cliente</Label>
          <Segment placeholder>{budget?.customer?.name}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Dirección</Label>
          {budget?.pickUpInStore ? (
            <Segment placeholder>{PICK_UP_IN_STORE}</Segment>
          ) : !budget?.customer?.addresses?.length || budget.customer.addresses.length === 1 ? (
            <Segment placeholder>{budget.customer?.addresses?.[0]?.address}</Segment>
          ) : (
            (
              <Dropdown
                selection
                options={budget?.customer?.addresses.map((address) => ({
                  key: address.address,
                  text: address.address,
                  value: address.address,
                }))}
                value={selectedContact.address}
                onChange={(e, { value }) => setSelectedContact({ ...selectedContact, address: value })}
              />
            )
          )}
        </FormField>
        <FormField width="200px">
          <Label>Teléfono</Label>
          {!budget?.customer?.phoneNumbers?.length || budget?.customer?.phoneNumbers.length === 1 ? (
            <Segment placeholder>{formatedSimplePhone(budget.customer?.phoneNumbers[0])}</Segment>
          ) : (
            <Dropdown
              selection
              options={budget?.customer?.phoneNumbers.map((phone) => ({
                key: formatedSimplePhone(phone),
                text: formatedSimplePhone(phone),
                value: formatedSimplePhone(phone),
              }))}
              value={selectedContact?.phone}
              onChange={(e, { value }) => setSelectedContact({ ...selectedContact, phone: value })}
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
        finalTotal={finalTotal}
        subtotalAfterDiscount={subtotalAfterDiscount}
        globalDiscount={budget?.globalDiscount}
        additionalCharge={budget?.additionalCharge}
      />
      <FieldsContainer rowGap="5px" >
        <Label>Comentarios</Label>
        <Segment placeholder>{budget?.comments}</Segment>
      </FieldsContainer>
      {Toggle}
      {isUpdating ? (
        <FormProvider  {...methods}>
          <PaymentMethods finalTotal={finalTotal} />
          <SubmitAndRestore />
        </FormProvider>
      ) : (
        <FieldsContainer>
          <FormField flex={3}>
            <Label>Métodos de pago</Label>
            <Segment placeholder>{formattedPaymentMethods}</Segment>
          </FormField>
        </FieldsContainer>
      )}
    </ViewContainer>
  );
};

export default BudgetView;
