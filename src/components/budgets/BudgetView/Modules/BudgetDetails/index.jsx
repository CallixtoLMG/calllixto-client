import { Dropdown, FieldsContainer, Flex, Form, FormField, Icon, Input, Label, TextArea, ViewContainer } from "@/common/components/custom";
import { DropdownField, PriceLabel } from "@/common/components/form";
import { Table, Total } from "@/common/components/table";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, ICONS } from "@/common/constants";
import { getFormatedPercentage, getFormatedPhone } from "@/common/utils";
import { getDateWithOffset } from "@/common/utils/dates";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { getBrandCode, getPrice, getProductCode, getSupplierCode, getTotal, isProductOOS } from "@/components/products/products.utils";
import { useEffect, useMemo, useState } from "react";
import { Popup } from "semantic-ui-react";
import { PICK_UP_IN_STORE } from "../../../budgets.constants";
import { getBudgetState, isBudgetCancelled, isBudgetConfirmed } from "../../../budgets.utils";
import { Container, Message, MessageHeader } from "./../../styles";

const BudgetDetails = ({ budget, subtotal, subtotalAfterDiscount, total, selectedContact, setSelectedContact }) => {

  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const budgetState = getBudgetState(budget);
  const [initializedContact, setInitializedContact] = useState(false);

    useEffect(() => {
    if (!budget || initializedContact) return;

    const defaultAddress = budget.pickUpInStore
      ? PICK_UP_IN_STORE
      : budget.customer?.addresses?.[0]?.address || '';

    const defaultPhone = getFormatedPhone(budget.customer?.phoneNumbers?.[0]);

    setSelectedContact({
      address: defaultAddress,
      phone: defaultPhone,
    });

    setInitializedContact(true);
  }, [budget, initializedContact, setSelectedContact]);

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Código",
        value: (product) => (
          <>
            <Popup
              size="tiny"
              trigger={<span>{getSupplierCode(product.code)}</span>}
              position="top center"
              on="hover"
              content={product.supplierName}
            />
            -
            <Popup
              size="tiny"
              trigger={<span>{getBrandCode(product.code)}</span>}
              position="top center"
              on="hover"
              content={product.brandName}
            />
            -
            <span>{getProductCode(product.code)}</span>
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
            <Flex $columnGap="5px" $marginLeft="7px">
              {product.tags && <TagsTooltip maxWidthOverflow="5vw" tooltip="true" tags={product.tags} />}
              {product.comments && <CommentTooltip lineHeight="normal" comment={product.comments} />}
              {isProductOOS(product.state) && (
                <Label color={COLORS.ORANGE} size="tiny">{PRODUCT_STATES.OOS.singularTitle}</Label>
              )}
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
        value: (product) => <PriceLabel value={getPrice(product)} />,
        id: 4,
        width: 2,
      },
      {
        title: "Descuento",
        value: (product, index) => <p>{getFormatedPercentage(product?.discount)}</p>,
        id: 5,
        width: 1
      },
      {
        title: "Total",
        value: (product) => <PriceLabel value={getTotal(product)} />,
        id: 6,
        width: 3
      },
    ];
  }, []);

  return (
    <Form>
      <ViewContainer>
        {isBudgetCancelled(budget?.state) && (
          <Flex>
            <Message negative>
              <MessageHeader>Motivo de anulación</MessageHeader>
              <p>{budget?.cancelledMsg}</p>
            </Message>
          </Flex>
        )}
        <Flex $justifyContent="space-between">
          <FieldsContainer>
            <FormField
              $width="300px"
              label="Vendedor"
              control={Input}
              value={budget?.seller}
              readOnly
              disabled
            />
            {budgetState && (
              <FormField
                $width="300px"
                label={budgetState.label}
                control={Input}
                value={budgetState.person}
                readOnly
                disabled
              />
            )}
          </FieldsContainer>
          <FieldsContainer>
            {budgetState && (
              <FormField
                label={budgetState.dateLabel}
                control={Input}
                value={budgetState.date}
                disabled
              />
            )}
            {!isBudgetConfirmed(budget?.state) && !isBudgetCancelled(budget?.state) && (
              <FormField
                label="Fecha de vencimiento"
                control={Input}
                value={getDateWithOffset(budget?.createdAt, budget?.expirationOffsetDays, 'days')}
                disabled
              />
            )}
          </FieldsContainer>
        </Flex>
        <FieldsContainer>
          <FormField
            $width="300px"
            label="Cliente"
            control={Input}
            value={budget?.customer?.name ? budget?.customer?.name : "No se ha seleccionado cliente"}
            readOnly
            disabled
          />
          <DropdownField
            flex="3"
            label="Dirección"
            control={Dropdown}
            value={selectedContact?.address || (budget?.pickUpInStore ? PICK_UP_IN_STORE : '')}
            options={[
              { key: 'pickup', text: PICK_UP_IN_STORE, value: PICK_UP_IN_STORE },
              ...(budget?.customer?.addresses?.map((address) => ({
                key: address.address,
                text: address.ref ? `${address.ref}: ${address.address}` : address.address,
                value: address.address,
              })) || [])
            ]}
            onChange={(e, { value }) =>
              setSelectedContact((prev) => ({
                ...prev,
                address: value,
              }))
            }
            disabled={!budget?.customer?.addresses?.length && !budget?.pickUpInStore}
          />
          <DropdownField
            flex="2"
            label="Teléfono"
            control={Dropdown}
            value={selectedContact?.phone ?? ''}
            options={budget?.customer?.phoneNumbers.map((phone) => {
              const formattedPhone = getFormatedPhone(phone);
              const label = phone.ref ? `${phone.ref}: ${formattedPhone}` : formattedPhone;

              return {
                key: formattedPhone,
                text: label,
                value: formattedPhone,
              };
            })}
            onChange={(e, { value }) => {
              setSelectedContact((prev) => ({
                ...prev,
                phone: value,
              }));
            }}
            disabled={!budget?.customer?.phoneNumbers?.length}
          />
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
        <FormField
          control={Input}
          label="Métodos de pago"
          $width="100%"
          value={formattedPaymentMethods}
          readOnly
          disabled
        />
        <FormField
          control={TextArea}
          label="Comentarios"
          $width="100%"
          placeholder="Comentarios"
          value={budget?.comments}
          readOnly
          disabled
        />
      </ViewContainer>
    </Form>
  );
};

export default BudgetDetails;
