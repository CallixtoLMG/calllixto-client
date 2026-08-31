"use client";

import { useGetSetting } from "@/api/settings";
import { IconedButton } from "@/common/components/buttons";
import { Box, ButtonsContainer, FieldsContainer, Flex, FlexColumn, Form, FormField, Label, Message, MessageHeader, OverflowWrapper } from "@/common/components/custom";
import { DropdownField, NumberField, PriceField, PriceLabel, TextAreaField, TextField } from "@/common/components/form";
import { Table, TotalList } from "@/common/components/table";
import { COLORS, CONTENT_SIZES, ENTITIES, FIELD_LABELS, ICONS, RULES as FIELD_RULES, SIZES } from "@/common/constants";
import { mapToDropdownOptions } from "@/common/utils";
import { getPrice } from "@/components/products/products.utils";
import { Loader } from "@/components/layout";
import { RULES } from "@/roles";
import { useEffect, useMemo, useState } from "react";
import { Checkbox, Header, Modal, Radio, Transition } from "semantic-ui-react";
import styled from "styled-components";
import { getMockPreviouslyReturnedQuantity } from "./mocks";
import { BENEFIT_RESOLUTION_LABELS, BENEFIT_RESOLUTION_OPTIONS, RETURN_REASON_OPTIONS, RETURN_REASONS } from "./returns.constants";

const EMPTY_REFUND_LINE = {
  method: "",
  amount: "",
};

const ModalContent = styled(Modal.Content)`
  max-height: calc(100vh - 190px);
  overflow-y: auto;
`;

const CompactTextAreaWrapper = styled.div`
  flex: 2;

  textarea {
    min-height: 38px !important;
    height: 38px !important;
  }
`;

const RequiredMark = styled.span`
  color: #db2828;
`;

const ProductTableBlock = styled(FlexColumn)`
  margin-top: 2px;
`;

const EconomicSummaryBlock = styled(FieldsContainer)`
  margin-top: 8px;
`;

const SummaryColumn = styled(FlexColumn)`
  && .ui.header {
    margin-bottom: -4px !important;
  }
`;

const getReturnRowKey = (product, index) => product?.rowId || `${product?.id ?? "product"}-${index}`;

const toCents = (value) => Math.round(Number(value || 0) * 100);

const getProductReturnValue = (product, quantity) => {
  const price = Number(getPrice(product) ?? 0);
  const discount = Number(product?.discount ?? 0);

  return price * Number(quantity || 0) * (1 - discount / 100);
};

const clampQuantity = (quantity, max) => {
  const numericQuantity = Number(quantity || 0);
  const numericMax = Number(max || 0);

  if (numericQuantity < 0) return 0;
  if (numericQuantity > numericMax) return numericMax;

  return numericQuantity;
};

const buildProductRows = (products = []) =>
  products.map((product, index) => {
    const previouslyReturned = getMockPreviouslyReturnedQuantity(product);
    const delivered = Number(product?.delivered ?? 0);
    const available = Math.max(delivered - previouslyReturned, 0);

    return {
      ...product,
      returnRowKey: getReturnRowKey(product, index),
      soldQuantity: Number(product?.quantity ?? 0),
      deliveredQuantity: delivered,
      previouslyReturned,
      available,
    };
  });

const ReturnFormModal = ({ open, onClose, budget, role }) => {
  const [reason, setReason] = useState("");
  const [comments, setComments] = useState("");
  const [quantitiesByRow, setQuantitiesByRow] = useState({});
  const [restockByRow, setRestockByRow] = useState({});
  const [benefitResolution, setBenefitResolution] = useState(BENEFIT_RESOLUTION_OPTIONS.REFUND);
  const [creditAmount, setCreditAmount] = useState(0);
  const [refundLine, setRefundLine] = useState(EMPTY_REFUND_LINE);
  const [refundLines, setRefundLines] = useState([]);
  const [validationMessage, setValidationMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const canCreateReturn = Boolean(RULES.canCreate[role]);
  const { data: settings, isLoading: isLoadingSettings } = useGetSetting(ENTITIES.GENERAL);

  useEffect(() => {
    if (!open) return;

    setReason("");
    setComments("");
    setQuantitiesByRow({});
    setRestockByRow({});
    setBenefitResolution(BENEFIT_RESOLUTION_OPTIONS.REFUND);
    setCreditAmount(0);
    setRefundLine(EMPTY_REFUND_LINE);
    setRefundLines([]);
    setValidationMessage("");
    setSuccessMessage("");
  }, [open]);

  const productRows = useMemo(() => buildProductRows(budget?.products), [budget?.products]);
  const paymentMethodOptions = useMemo(
    () => mapToDropdownOptions(settings?.paymentMethods || []),
    [settings?.paymentMethods]
  );

  const selectedRows = useMemo(
    () =>
      productRows
        .map((product) => ({
          ...product,
          returnQuantity: Number(quantitiesByRow[product.returnRowKey] ?? 0),
          restock: Boolean(restockByRow[product.returnRowKey]),
        }))
        .filter((product) => product.returnQuantity > 0),
    [productRows, quantitiesByRow, restockByRow]
  );

  const returnedAmount = useMemo(
    () => selectedRows.reduce(
      (sum, product) => sum + getProductReturnValue(product, product.returnQuantity),
      0
    ),
    [selectedRows]
  );
  const currentDebt = Math.max(Number(budget?.total ?? 0) - Number(budget?.paidAmount ?? 0), 0);
  const debtReductionAmount = Math.min(returnedAmount, currentDebt);
  const customerBenefitAmount = Math.max(returnedAmount - debtReductionAmount, 0);
  const refundTotal = useMemo(
    () => refundLines.reduce((sum, line) => sum + Number(line.amount ?? 0), 0),
    [refundLines]
  );
  const resolvedCreditAmount =
    benefitResolution === BENEFIT_RESOLUTION_OPTIONS.CREDIT
      ? customerBenefitAmount
      : benefitResolution === BENEFIT_RESOLUTION_OPTIONS.MIXED
        ? Number(creditAmount || 0)
        : 0;
  const resolutionPending = Math.max(customerBenefitAmount - resolvedCreditAmount - refundTotal, 0);
  const summaryItems = [
    {
      id: "returned-value",
      title: "Valor mercadería devuelta",
      amount: <PriceLabel value={returnedAmount} />,
    },
    {
      id: "debt-reduction",
      title: "Reduce deuda",
      amount: <PriceLabel value={debtReductionAmount} />,
    },
    {
      id: "customer-benefit",
      title: "Monto a favor",
      amount: <PriceLabel value={customerBenefitAmount} />,
    },
  ];

  const refundSummaryItems = [
    {
      id: "to-resolve",
      title: "Monto a resolver",
      amount: <PriceLabel value={customerBenefitAmount} />,
    },
    {
      id: "refunded",
      title: "Reintegrado",
      amount: <PriceLabel value={refundTotal} />,
    },
    {
      id: "pending",
      title: "Pendiente",
      amount: <PriceLabel value={resolutionPending} />,
    },
  ];

  const handleClose = () => {
    onClose?.();
  };

  const updateQuantity = (product, nextQuantity) => {
    const quantity = clampQuantity(nextQuantity, product.available);

    setSuccessMessage("");
    setQuantitiesByRow((prev) => ({
      ...prev,
      [product.returnRowKey]: quantity,
    }));
  };

  const addRefundLine = () => {
    setValidationMessage("");
    setSuccessMessage("");

    if (!refundLine.method || Number(refundLine.amount) <= 0) {
      setValidationMessage("Completá método y monto para agregar el reintegro.");
      return;
    }

    setRefundLines((prev) => [
      ...prev,
      {
        ...refundLine,
        id: `${refundLine.method}-${Date.now()}`,
        amount: Number(refundLine.amount),
      },
    ]);
    setRefundLine(EMPTY_REFUND_LINE);
  };

  const removeRefundLine = (lineToRemove) => {
    setRefundLines((prev) => prev.filter((line) => line.id !== lineToRemove.id));
  };

  const validateForm = () => {
    if (!canCreateReturn) return "No tenés permisos para confirmar devoluciones.";
    if (!reason) return "Seleccioná un motivo.";
    if (reason === "OTHER" && !comments.trim()) return "Agregá un comentario para el motivo Otro.";
    if (!selectedRows.length) return "Seleccioná al menos un producto con cantidad a devolver.";

    const invalidRow = selectedRows.find((product) => product.returnQuantity > product.available);
    if (invalidRow) return "Hay cantidades que superan lo disponible para devolución.";

    if (customerBenefitAmount > 0) {
      if (benefitResolution === BENEFIT_RESOLUTION_OPTIONS.REFUND && toCents(refundTotal) !== toCents(customerBenefitAmount)) {
        return "El total reintegrado debe cerrar el monto a favor.";
      }

      if (benefitResolution === BENEFIT_RESOLUTION_OPTIONS.MIXED) {
        if (toCents(creditAmount) <= 0 || toCents(refundTotal) <= 0) {
          return "La resolución mixta debe tener saldo a favor y reintegro.";
        }

        if (toCents(Number(creditAmount) + refundTotal) !== toCents(customerBenefitAmount)) {
          return "Saldo a favor más reintegros debe cerrar el monto a favor.";
        }
      }
    }

    return "";
  };

  const handleConfirm = () => {
    const error = validateForm();

    if (error) {
      setSuccessMessage("");
      setValidationMessage(error);
      return;
    }

    setValidationMessage("");
    setSuccessMessage("Simulación visual: devolución confirmada. No se guardaron datos.");
  };

  const commentsLabel = reason === "OTHER"
    ? <>Comentarios <RequiredMark>*</RequiredMark></>
    : "Comentarios";

  const productHeaders = [
    {
      id: "product",
      title: "Producto",
      width: 5,
      align: "left",
      value: (product) => (
        <OverflowWrapper maxWidth="24vw" popupContent={product.name}>
          {product.name}
        </OverflowWrapper>
      ),
    },
    {
      id: "sold",
      title: "Vendido",
      width: 1,
      value: (product) => product.soldQuantity,
    },
    {
      id: "delivered",
      title: "Entregado",
      width: 1,
      value: (product) => product.deliveredQuantity,
    },
    {
      id: "returned",
      title: "Devuelto",
      width: 1,
      value: (product) => product.previouslyReturned,
    },
    {
      id: "available",
      title: "Disponible",
      width: 1,
      value: (product) => (
        <Label color={product.available > 0 ? COLORS.GREEN : COLORS.GREY} width={CONTENT_SIZES.FIT}>
          {product.available}
        </Label>
      ),
    },
    {
      id: "quantity",
      title: "Cantidad",
      width: 1,
      value: (product) => (
        <Flex className="ui form">
          <NumberField
            width="130px"
            padding="9.5px 14px"
            min={0}
            max={product.available}
            value={quantitiesByRow[product.returnRowKey] ?? 0}
            disabled={!product.available}
            onChange={(value) => updateQuantity(product, value)}
          />
        </Flex>
      ),
    },
    {
      id: "restock",
      title: "Reincorporar",
      width: 1,
      value: (product) => (
        <Checkbox
          checked={Boolean(restockByRow[product.returnRowKey])}
          disabled={!Number(quantitiesByRow[product.returnRowKey] ?? 0)}
          onChange={(_, { checked }) =>
            setRestockByRow((prev) => ({
              ...prev,
              [product.returnRowKey]: checked,
            }))
          }
        />
      ),
    },
  ];

  const refundHeaders = [
    {
      id: "method",
      title: "Método de pago",
      width: 4,
      value: (line) => line.method,
    },
    {
      id: "amount",
      title: FIELD_LABELS.AMOUNT,
      width: 2,
      value: (line) => <PriceLabel value={line.amount} />,
    },
  ];

  return (
    <Transition visible={open} animation='scale' duration={500}>
      <Modal closeIcon open={open} onClose={handleClose} size={SIZES.LARGE}>
        <Modal.Header>Nueva devolución</Modal.Header>
        <ModalContent>
          {!canCreateReturn ? (
            <Message negative>
              <MessageHeader>No tenés permisos para crear devoluciones</MessageHeader>
              <p>La pestaña de consulta está disponible, pero esta acción requiere administrador o superior.</p>
            </Message>
          ) : (
            <Loader active={isLoadingSettings}>
              <FlexColumn width="100%" $rowGap="15px" className="ui form">
                <FieldsContainer $rowGap="15px">
                  <TextField flex="1" label="Venta" value={budget?.id} disabled />
                  <TextField flex="2" label="Cliente" value={budget?.customer?.name || "Sin cliente"} disabled />
                </FieldsContainer>

                {validationMessage && (
                  <Message negative>
                    <MessageHeader>Revisá la simulación</MessageHeader>
                    <p>{validationMessage}</p>
                  </Message>
                )}
                {successMessage && (
                  <Message positive>
                    <MessageHeader>Devolución simulada</MessageHeader>
                    <p>{successMessage}</p>
                  </Message>
                )}

                <Form>
                  <FieldsContainer $rowGap="15px">
                    <FormField flex="1">
                      <DropdownField
                        label="Motivo"
                        selection
                        required
                        options={RETURN_REASON_OPTIONS}
                        value={reason}
                        onChange={(_, { value }) => {
                          setSuccessMessage("");
                          setReason(value);
                        }}
                        error={!reason && validationMessage ? FIELD_RULES.REQUIRED.required : undefined}
                      />
                    </FormField>
                    <CompactTextAreaWrapper>
                      <TextAreaField
                        label={commentsLabel}
                        placeholder={reason === "OTHER" ? RETURN_REASONS.OTHER : "Comentario opcional"}
                        value={comments}
                        onChange={(event) => {
                          setSuccessMessage("");
                          setComments(event.target.value);
                        }}
                        error={reason === "OTHER" && validationMessage && !comments.trim() ? FIELD_RULES.REQUIRED.required : undefined}
                      />
                    </CompactTextAreaWrapper>
                  </FieldsContainer>
                </Form>

                <ProductTableBlock width="100%" $rowGap="10px">
                  <Table
                    mainKey="returnRowKey"
                    headers={productHeaders}
                    elements={productRows}
                  />
                </ProductTableBlock>

                <EconomicSummaryBlock $rowGap="15px" $alignItems="flex-start">
                  <SummaryColumn $rowGap="6px" width="320px">
                    <Header as="h4">Resumen económico</Header>
                    <TotalList readOnly width="320px" items={summaryItems} />
                  </SummaryColumn>

                  {customerBenefitAmount > 0 && (
                    <FlexColumn $rowGap="12px" width="min(620px, 100%)">
                      <Header as="h4">Resolución del monto a favor</Header>
                      <Flex $columnGap="18px" $rowGap="10px" wrap="wrap">
                        {Object.entries(BENEFIT_RESOLUTION_LABELS).map(([value, label]) => (
                          <Radio
                            key={value}
                            label={label}
                            name="benefit-resolution"
                            value={value}
                            checked={benefitResolution === value}
                            onChange={(_, data) => {
                              setSuccessMessage("");
                              setBenefitResolution(data.value);
                            }}
                          />
                        ))}
                      </Flex>

                      {benefitResolution === BENEFIT_RESOLUTION_OPTIONS.CREDIT && (
                        <TotalList
                          readOnly
                          width="320px"
                          items={[{
                            id: "credit",
                            title: "Saldo a favor",
                            amount: <PriceLabel value={customerBenefitAmount} />,
                          }]}
                        />
                      )}

                      {benefitResolution === BENEFIT_RESOLUTION_OPTIONS.MIXED && (
                        <PriceField
                          width="220px"
                          label="Saldo a favor"
                          value={creditAmount}
                          onChange={(value) => {
                            setSuccessMessage("");
                            setCreditAmount(value);
                          }}
                        />
                      )}

                      {[BENEFIT_RESOLUTION_OPTIONS.REFUND, BENEFIT_RESOLUTION_OPTIONS.MIXED].includes(benefitResolution) && (
                        <FlexColumn width="100%" $rowGap="10px">
                          <FieldsContainer $rowGap="12px" $alignItems="flex-end">
                            <FormField flex="1">
                              <DropdownField
                                label="Método de pago"
                                selection
                                options={paymentMethodOptions}
                                value={refundLine.method}
                                onChange={(_, { value }) =>
                                  setRefundLine((prev) => ({ ...prev, method: value }))
                                }
                              />
                            </FormField>
                            <FormField flex="1">
                              <PriceField
                                label="Monto"
                                value={refundLine.amount}
                                onChange={(value) =>
                                  setRefundLine((prev) => ({ ...prev, amount: value }))
                                }
                              />
                            </FormField>
                            <Box width={CONTENT_SIZES.FIT}>
                              <IconedButton
                                icon={ICONS.ADD}
                                text="Agregar reintegro"
                                color={COLORS.GREEN}
                                width={CONTENT_SIZES.FIT}
                                onClick={addRefundLine}
                              />
                            </Box>
                          </FieldsContainer>
                          <Table
                            mainKey="id"
                            headers={refundHeaders}
                            elements={refundLines}
                            actions={[
                              {
                                id: "remove",
                                icon: ICONS.TRASH,
                                color: COLORS.RED,
                                tooltip: "Eliminar",
                                onClick: removeRefundLine,
                              },
                            ]}
                            $actionButtonInside
                          />
                          <TotalList readOnly width="320px" items={refundSummaryItems} />
                        </FlexColumn>
                      )}
                    </FlexColumn>
                  )}
                </EconomicSummaryBlock>
              </FlexColumn>
            </Loader>
          )}
        </ModalContent>
        <Modal.Actions>
          <ButtonsContainer width="100%">
            <IconedButton
              icon={ICONS.CANCEL}
              text="Cancelar"
              color={COLORS.RED}
              onClick={handleClose}
            />
            {canCreateReturn && (
              <IconedButton
                icon={ICONS.CHECK}
                text="Confirmar devolución"
                color={COLORS.GREEN}
                width={CONTENT_SIZES.FIT}
                onClick={handleConfirm}
              />
            )}
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ReturnFormModal;
