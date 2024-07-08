import { FieldsContainer, FormField, Label, Price, Segment, ViewContainer, Flex } from "@/components/common/custom";
import { Table, Total } from "@/components/common/table";
import { CommentTooltip } from "@/components/common/tooltips";
import { expirationDate, formatProductCodePopup, formatedDateOnly, formatedPercentage, formatedSimplePhone, getPrice, getTotal, getTotalSum, isBudgetCancelled } from "@/utils";
import { useMemo } from "react";
import { Popup } from "semantic-ui-react";
import { Container, Icon, Message, MessageHeader } from "./styles";

const BudgetView = ({ budget }) => {
  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const subtotal = useMemo(() => getTotalSum(budget?.products), [budget]);

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
      <FieldsContainer>
        <FormField width="300px">
          <Label>Vendedor</Label>
          <Segment>{budget?.seller}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="300px">
          <Label>Cliente</Label>
          <Segment>{budget?.customer?.name}</Segment>
        </FormField>
        <FormField flex="1">
          <Label>Dirección</Label>
          <Segment>{budget?.customer?.addresses[0]?.address}</Segment>
        </FormField>
        <FormField width="200px">
          <Label>Teléfono</Label>
          <Segment>{formatedSimplePhone(budget?.customer?.phoneNumbers[0])}</Segment>
        </FormField>
      </FieldsContainer>
      <Table
        mainKey="key"
        headers={BUDGET_FORM_PRODUCT_COLUMNS}
        elements={budget?.products}
      />
      <Total readOnly subtotal={subtotal} globalDiscount={budget?.globalDiscount} additionalCharge={budget?.additionalCharge} />
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Segment>{budget?.comments}</Segment>
      </FieldsContainer>
      <FieldsContainer>
        <FormField flex={3}>
          <Label>Métodos de pago</Label>
          <Segment>{formattedPaymentMethods}</Segment>
        </FormField>
        <FormField flex={1}>
          <Label>Fecha de vencimiento</Label>
          <Segment>{formatedDateOnly(expirationDate(budget?.createdAt, budget?.expirationOffsetDays))}</Segment>
        </FormField>
      </FieldsContainer>
    </ViewContainer>
  );
};

export default BudgetView;
