import { IconedButton } from "@/common/components/buttons";
import { Dropdown, FieldsContainer, Flex, FlexColumn, Form, FormField, Icon, Input, Label, OverflowWrapper, TextArea, ViewContainer } from "@/common/components/custom";
import { DropdownField, PriceControlled, PriceLabel } from "@/common/components/form";
import { Table, Total, TotalList } from "@/common/components/table";
import { CommentTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, DATE_FORMATS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPercentage, getFormatedPhone } from "@/common/utils";
import { getDateWithOffset, getFormatedDate } from "@/common/utils/dates";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { getBrandId, getPrice, getProductId, getSupplierId, getTotal, isProductOOS } from "@/components/products/products.utils";
import { useEffect, useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { PICK_UP_IN_STORE } from "../../budgets.constants";
import { getBudgetState, isBudgetCancelled, isBudgetConfirmed } from "../../budgets.utils";
import { Container } from "./../styles";

const BudgetDetails = ({ budget, subtotal, subtotalAfterDiscount, total, selectedContact, setSelectedContact, onConfirmBudgetDiscount, isLoading }) => {
  const formattedPaymentMethods = useMemo(() => budget?.paymentMethods?.join(' - '), [budget]);
  const budgetState = getBudgetState(budget);
  const [initializedContact, setInitializedContact] = useState(false);
  const totalPending = (total - budget.paidAmount).toFixed(2);
  const { setValue, getValues, trigger } = useFormContext();

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

  useEffect(() => {
    if (budget?.postConfirmDiscount != null) {
      setValue("postConfirmDiscount", budget.postConfirmDiscount);
    }
  }, [budget?.postConfirmDiscount, setValue]);

  const TOTAL_LIST_ITEMS = useMemo(() => {
    const items = [
      { id: 1, title: "Pagado", amount: <PriceLabel value={budget.paidAmount} /> },
    ];

    if (budget?.postConfirmDiscount) {
      items.push({
        id: 2,
        title: "Descuento aplicado",
        amount: <PriceLabel value={budget.postConfirmDiscount} />,
      });
    }

    items.push(
      { id: 3, title: "Pendiente", amount: <PriceLabel value={totalPending} /> },
      { id: 4, title: "Total", amount: <PriceLabel value={total} /> },
    );

    return items;
  }, [budget?.paidAmount, budget?.postConfirmDiscount, totalPending, total]);

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Id",
        value: (product) => (
          <>
            <Popup
              size={SIZES.TINY}
              trigger={<span>{getSupplierId(product.id)}</span>}
              position="top center"
              on="hover"
              content={product.supplierName}
            />
            -
            <Popup
              size={SIZES.TINY}
              trigger={<span>{getBrandId(product.id)}</span>}
              position="top center"
              on="hover"
              content={product.brandName}
            />
            -
            <span>{getProductId(product.id)}</span>
          </>
        ),
        id: 1,
        width: 1,
        align: 'left'
      },
      {
        title: "Cantidad", value: (product, index) => <p>{product?.quantity}</p>,
        id: 2,
        width: 1
      },
      {
        title: "Nombre",
        value: (product) => {
          const displayName = `${product.name}${product.fractionConfig?.active ? ` x ${product.fractionConfig.value} ${product.fractionConfig.unit}` : ''}`;

          return (
            <Container>
              <OverflowWrapper maxWidth="30vw" popupContent={displayName}>
                {displayName}
              </OverflowWrapper>
              <Flex $columnGap="5px" $marginLeft="7px">
                {isProductOOS(product.state) && (
                  <Label color={COLORS.ORANGE} size={SIZES.TINY}>{PRODUCT_STATES.OOS.singularTitle}</Label>
                )}
                {product.tags && <TagsTooltip maxWidthOverflow="5vw" tooltip="true" tags={product.tags} />}
                {product.comments && <CommentTooltip lineHeight="normal" comment={product.comments} />}
                {product.dispatchComment && (
                  <Popup
                    size="mini"
                    content={product.dispatchComment}
                    position="top center"
                    trigger={<Icon name={ICONS.TRUCK} color={COLORS.ORANGE} />}
                  />
                )}
              </Flex>
            </Container>
          );
        },
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
        value: (product) => <PriceLabel value={getTotal(product) ?? 0} />,
        id: 6,
        width: 3
      },
    ];
  }, []);

  return (
    <Form>
      <ViewContainer>
        <Flex $justifyContent="space-between">
          <FieldsContainer>
            <FormField
              $width="300px"
              label="Vendedor"
              control={Input}
              value={budget?.createdBy}
              readOnly
              disabled
            />
            {budget?.createdAt && (
              <FormField
                $width="180px"
                label="Fecha de creación"
                control={Input}
                value={getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME)}
                readOnly
                disabled
              />
            )}
          </FieldsContainer>
          <FieldsContainer>
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
            {budgetState && (
              <FormField
                $width="200px"
                label={budgetState.dateLabel}
                control={Input}
                value={budgetState.date}
                disabled
              />
            )}
            {!isBudgetConfirmed(budget?.state) && !isBudgetCancelled(budget?.state) && (
              <FormField
                $width="200px"
                label="Fecha de vencimiento"
                control={Input}
                value={getDateWithOffset({ date: budget?.createdAt, offset: budget?.expirationOffsetDays })}
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
            selection
            width="200px"
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
            selection
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
        {isBudgetConfirmed(budget?.state) ?
          <>
            <TotalList items={TOTAL_LIST_ITEMS} />
            <FlexColumn $alignSelf="end" $rowGap="15px">
              <Flex $alignSelf="end" $alignItems="flex-end" $columnGap="10px">
                <IconedButton
                  text="Completar"
                  icon={ICONS.CHECK}
                  color={COLORS.BLUE}
                  onClick={() => {
                    setValue(
                      "postConfirmDiscount",
                      Number(budget.postConfirmDiscount ?? 0) + Number(totalPending)
                    );
                    trigger("postConfirmDiscount");
                  }}
                  alignSelf="start"
                  height="38px"
                  disabled={isLoading}
                />
                <PriceControlled
                  key={budget?.postConfirmDiscount ?? 'no-discount'}
                  width="200px"
                  placeholder="5.000"
                  name="postConfirmDiscount"
                  defaultValue={budget?.postConfirmDiscount ?? ''}
                  rules={{
                    validate: (value) =>
                      !value ||
                      Number(value) <=
                      Number(totalPending) + Number(budget.postConfirmDiscount ?? 0) ||
                      "No puede superar el monto pendiente más el descuento aplicado"
                  }}
                  justifyItems="right"
                />
              </Flex>
              <Flex $columnGap="15px" $alignSelf="end">
                <IconedButton
                  text="Aplicar descuento"
                  loading={isLoading}
                  disabled={isLoading}
                  icon={ICONS.CHECK}
                  color={COLORS.GREEN}
                  height="38px"
                  onClick={() => {
                    const value = getValues("postConfirmDiscount");
                    onConfirmBudgetDiscount({
                      budgetId: budget.id,
                      postConfirmDiscount: Number(value),
                    });
                  }}
                />
              </Flex>
            </FlexColumn>
          </>
          :
          <Total
            readOnly
            subtotal={subtotal}
            total={total}
            subtotalAfterDiscount={subtotalAfterDiscount}
            globalDiscount={budget?.globalDiscount}
            additionalCharge={budget?.additionalCharge}
          />
        }
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
        />
      </ViewContainer>
    </Form>
  );
};

export default BudgetDetails;
