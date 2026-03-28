import { IconedButton, SubmitAndRestore } from "@/common/components/buttons";
import { Button, FieldsContainer, Flex, Form, FormField, Icon, Input, Label, OverflowWrapper } from "@/common/components/custom";
import {
  GroupedButtonsControlled,
  NumberControlled,
  PercentControlled,
  PriceControlled,
  PriceLabel,
  SearchControlled,
  TextAreaControlled,
  TextControlled,
  TextField
} from "@/common/components/form";
import { Table, Total } from "@/common/components/table";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, DATE_FORMATS, ICONS, RULES, SHORTKEYS, SIZES } from "@/common/constants";
import { getAddressesForDisplay, getFormatedPhone, getPhonesForDisplay, removeNullish } from "@/common/utils";
import { getDateWithOffset, getFormatedDate } from "@/common/utils/dates";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { isBudgetConfirmed, isBudgetDraft } from '@/components/budgets/budgets.utils';
import { Loader } from "@/components/layout";
import { LIST_ATTRIBUTES, PRODUCT_STATES, getProductSearchDescription, getProductSearchTitle } from "@/components/products/products.constants";
import { getBrandId, getPrice, getProductId, getSupplierId, getTotal, isProductOOS } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ButtonGroup, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { CUSTOMER_STATES, getCustomerSearchDescription, getCustomerSearchTitle } from "../../customers/customers.constants";
import ModalProductUpdates from "../ModalProductUpdates";
import ModalComment from "./ModalComment";
import { Container, VerticalDivider } from "./styles";

const BudgetForm = ({
  onSubmit,
  products,
  customers = [],
  budget,
  isLoading,
  isCloning,
  draft,
  paymentMethods = [],
  total,
  subtotal,
  subtotalAfterDiscount,
}) => {

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    reset,
    trigger,
    formState: { isDirty, errors },
  } = useFormContext();

  const { append: appendProduct, remove: removeProduct, update: updateProduct } = useFieldArray({
    control,
    name: "products"
  });
  const [watchGlobalDiscount, watchAdditionalCharge, watchCustomer, watchState, watchPickUp, watchProducts] = watch(['globalDiscount', 'additionalCharge', 'customer', 'state', 'pickUpInStore', 'products']);
  const hasShownModal = useRef(false);
  const productSearchRef = useRef(null);
  const initialClonedProductsRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const watchExpirationOffsetDays = watch("expirationOffsetDays");
  const isConfirmed = watchState === BUDGET_STATES.CONFIRMED.id;
  const canSubmit = budget?.state === BUDGET_STATES.DRAFT.id || isDirty;

  useEffect(() => {

    if (!isCloning) return;
    if (!Array.isArray(budget?.products)) return;
    if (!Array.isArray(products)) return;
    if (!initialClonedProductsRef.current) {
      initialClonedProductsRef.current = budget.products;
    }
    if (hasShownModal.current) return;

    const budgetProducts = budget.products;

    const existingIds = new Set(products.map(product => product.id));

    const removed = budgetProducts.filter(
      budgetProduct => !existingIds.has(budgetProduct.id)
    );

    const outdated = products.filter(product => {
      const original = budgetProducts.find(budgetProducts => budgetProducts.id === product.id);
      if (!original) return false;

      return (
        original.price !== product.price ||
        original.state !== product.state ||
        original.editablePrice !== product.editablePrice ||
        original.fractionConfig?.active !== product.fractionConfig?.active
      );
    });

    if (outdated.length || removed.length) {
      setOutdatedProducts(outdated);
      setRemovedProducts(removed);
      setShouldShowModal(true);
      hasShownModal.current = true;
    }
  }, [isCloning, budget?.products, products, hasShownModal]);

  const handleConfirmUpdate = () => {
    const currentProducts = watchProducts;

    const updatedProducts = currentProducts.map(product => {
      const outdated = outdatedProducts.find(op => op.id === product.id);

      const base = outdated ?? product;

      return {
        ...product,
        name: base.name,
        price: Number(base.price ?? product.price ?? 0),
        quantity: Number(product.quantity ?? 1),
        discount: Number(product.discount ?? 0),
        editablePrice: base.editablePrice ?? product.editablePrice ?? false,
        fractionConfig: base.fractionConfig
          ? {
            ...base.fractionConfig,
            value: Number(base.fractionConfig.value ?? 1),
            price: Number(base.fractionConfig.price ?? base.price ?? 0),
          }
          : product.fractionConfig,
        state: base.state,
      };
    });

    const finalProducts = updatedProducts.filter(
      p => !removedProducts.some(r => r.id === p.id)
    );

    setValue("products", finalProducts, {
      shouldDirty: true,
      shouldTouch: true,
    });

    setShouldShowModal(false);
    setIsTableLoading(false);
  };


  const handleCancelUpdate = () => {
    if (!initialClonedProductsRef.current) return;

    setValue("products", initialClonedProductsRef.current, {
      shouldDirty: false,
      shouldTouch: false,
    });

    setValue("expirationOffsetDays", "", { shouldDirty: false });

    setShouldShowModal(false);
    setIsTableLoading(false);
  };

  useEffect(() => {
    trigger("productsValidation");
  }, [watchProducts, trigger]);

  const handleCreate = async (data, state) => {
    const { customer } = data;

    const payload = removeNullish({
      ...data,
      customer: customer
        ? { id: customer.id, name: customer.name }
        : undefined,
      products: data.products.map((product) =>
        removeNullish(
          pick(product, ["rowId", ...LIST_ATTRIBUTES, "quantity", "discount", "dispatchComment", "tags",])
        )
      ),
      total: Number(total.toFixed(2)),
      state,
    });

    await onSubmit(payload);
  };

  const currentState = useMemo(() => {
    if (isBudgetConfirmed(watchState)) {
      return BUDGET_STATES.CONFIRMED;
    }
    return BUDGET_STATES.PENDING;
  }, [watchState]);

  const handleReset = useCallback(() => {
    reset();

    setValue("expirationOffsetDays", "", { shouldDirty: false });

    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [reset, setValue]);

  const handleOpenCommentModal = useCallback((product, index) => {
    setSelectedProduct(() => ({ ...product, index }));
    setIsModalCommentOpen(true);
  }, []);

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (element, index) => { removeProduct(index) },
      tooltip: 'Eliminar',
      width: "100%"
    },
    {
      id: 2,
      icon: ICONS.STICKY_NOTE,
      color: COLORS.GREEN,
      onClick: (element, index) => handleOpenCommentModal(element, index),
      tooltip: 'Comentario',
      width: "100%"
    },
  ];

  const onAddComment = ({ index, dispatchComment }) => {
    const product = watchProducts[index];

    updateProduct(index, {
      ...product,
      dispatchComment,
    });

    setIsModalCommentOpen(false);
  };

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => [
    {
      id: 1,
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
          {'-'}
          <Popup
            size={SIZES.TINY}
            trigger={<span>{getBrandId(product.id)}</span>}
            position="top center"
            on="hover"
            content={product.brandName}
          />
          {'-'}
          <span>{getProductId(product.id)}</span>
        </>
      ),
      width: 1,
      align: 'left'
    },
    {
      id: 2,
      title: "Cantidad",
      value: (product, index) => (
        <NumberControlled
          padding="9px 14px"
          width="80px"
          name={`products[${index}].quantity`}
          disabled={isProductOOS(product.state)}
          allowsDecimal
        />
      ),
      width: 1
    },
    {
      id: 3,
      title: "Nombre",
      value: (product) => (
        <Container>
          <OverflowWrapper maxWidth="30vw" popupContent={product.name}>
            {product.name}
          </OverflowWrapper>
          <Flex $alignItems="center" $marginLeft="5px" $columnGap="5px">
            {isProductOOS(product.state) && <Label color={COLORS.ORANGE} size={SIZES.TINY}>Sin Stock</Label>}
            {product.tags && <TagsTooltip maxWidthOverflow="5vw" tooltip="true" tags={product.tags} />}
            {product.comments && <CommentTooltip tooltip="true" comment={product.comments} />}
            {(!!product.dispatchComment || !!product?.dispatch?.comment) && (
              <Popup size="mini" content={product.dispatchComment || product?.dispatch?.comment} position="top center" trigger={<Icon lineHeight="normal" name={ICONS.TRUCK} color={COLORS.BLUE} />} />
            )}
          </Flex>
        </Container>
      ),
      width: 7,
      wrap: true,
      align: 'left'
    },
    {
      id: 4,
      title: "Medida",
      value: (product, index) => (
        <>
          {product.fractionConfig?.active && (
            <NumberControlled
              width="130px"
              name={`products[${index}].fractionConfig.value`}
              unit={product.fractionConfig.unit}
              defaultValueFallback={1}
              onChange={(value) => {
                const safeValue = value ?? 1;
                setValue(`products[${index}].fractionConfig.price`, safeValue * product.price);
              }}
              allowsDecimal
              defaultValue={1}
            />
          )}
        </>
      ),
      width: 1
    },
    {
      id: 5,
      title: "Precio",
      value: (product, index) => {
        return product.editablePrice
          ? (
            <PriceControlled
              width="100%"
              name={`products[${index}].price`}
              onAfterChange={(v) => {
                setValue(`products.${index}.price`, Number(v ?? 0), {
                  shouldDirty: true,
                  shouldTouch: true,
                });
              }}
              justifyItems="right"
            />
          )
          : <PriceLabel width="100%" value={getPrice(product)} />
      },
      width: 2
    },
    {
      id: 6,
      title: "Descuento",
      value: (product, index) => (
        <Flex $alignItems="center" $columnGap="5px">
          <PercentControlled
            width="90px"
            name={`products[${index}].discount`}
            defaultValue={product.discount ?? 0}
            disabled={isProductOOS(product.state)}
            handleChange={(v) => {
              setValue(`products.${index}.discount`, Number(v ?? 0), {
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
            justifyItems="left"
          />
        </Flex>
      ),
      width: 1
    },
    {
      id: 7,
      title: "Total",
      value: (product) => <PriceLabel value={getTotal(product)} />,
      width: 3
    },
  ], [setValue]);

  const handleDraft = async (data) => {
    setValue("state", BUDGET_STATES.DRAFT.id);
    await handleCreate({ ...data, total: Number(total.toFixed(2)) }, BUDGET_STATES.DRAFT.id);
  };
  const handleConfirm = async (data) => {
    setValue('state', isConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id);
    await handleCreate({ ...data, total: Number(total.toFixed(2)) }, isConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id);
  };

  const validateShortcuts = {
    canDraft: () => !isLoading && isDirty,
    canConfirm: () => !isLoading,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: () => handleSubmit(handleDraft)(),
      condition: validateShortcuts.canDraft
    },
    {
      key: SHORTKEYS.ALT_ENTER,
      action: () => handleSubmit(handleConfirm)(),
      condition: validateShortcuts.canConfirm
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => handleReset(),
      condition: validateShortcuts.canReset
    },
  ]);

  const handleTryReset = () => {
    if (isCloning && (outdatedProducts.length > 0 || removedProducts.length > 0)) {
      setShouldShowModal(true);
    } else {
      handleReset();
    }
  };

  return (
    <>
      <ModalComment onAddComment={onAddComment} isModalOpen={isModalCommentOpen} onClose={setIsModalCommentOpen} product={selectedProduct} />
      <ModalProductUpdates
        shouldShowModal={shouldShowModal}
        outdatedProducts={outdatedProducts}
        removedProducts={removedProducts}
        budget={budget}
        onCancel={handleCancelUpdate}
        onConfirm={handleConfirmUpdate}
      />
      <Form onSubmit={handleSubmit(handleConfirm)}>
        <FieldsContainer $justifyContent="space-between">
          <FormField $width="300px">
            <ButtonGroup size={SIZES.SMALL}>
              <IconedButton
                text="Confirmado"
                icon={ICONS.CHECK}
                basic={!isConfirmed}
                color={isConfirmed ? COLORS.GREEN : COLORS.ORANGE}
                onClick={() => setValue("state", BUDGET_STATES.CONFIRMED.id, {
                  shouldDirty: true,
                  shouldTouch: true,
                })}
              />
              <IconedButton
                text="Pendiente"
                icon={ICONS.HOURGLASS_HALF}
                basic={isConfirmed}
                color={isConfirmed ? COLORS.GREEN : COLORS.ORANGE}
                onClick={() => setValue("state", BUDGET_STATES.PENDING.id, {
                  shouldDirty: true,
                  shouldTouch: true,
                })}
              />
            </ButtonGroup>
          </FormField>
          <GroupedButtonsControlled
            $alignItems="self-end"
            name="pickUpInStore"
            width="fit-content"
            color={COLORS.BLUE}
            buttons={[
              { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
              { text: 'Enviar a dirección', icon: ICONS.TRUCK, value: false },
            ]}
          />
        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <TextControlled
              name="createdBy"
              label="Vendedor"
              rules={RULES.REQUIRED}
              disabled
            />
          </FormField>
          {budget?.createdAt ? (
            <FormField flex="1">
              <FormField
                flex="1"
                label="Fecha de creación"
                control={Input}
                value={getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME)}
                readOnly
                disabled
              />
            </FormField>
          ) : <FormField flex="1" />}
          <FormField flex="1" />
        </FieldsContainer>
        <FieldsContainer>
          <FormField $justifyContent="end" flexDirection="row" flex="1">
            <NumberControlled
              flex="1"
              name="expirationOffsetDays"
              rules={{
                validate: {
                  positive: (value) => value > 0 || 'Campo requerido.'
                },
              }}
              maxLength={3}
              label="Dias para el vencimiento"
              placeholder="3"
              required
            />
          </FormField>
          <FormField
            flex="1"
            label="Fecha de vencimiento"
            control={Input}
            readOnly
            value={
              watchExpirationOffsetDays
                ? getDateWithOffset({ offset: watchExpirationOffsetDays })
                : ""
            }
            placeholder="dd/mm/aaaa"
          />
          <FormField flex="1" />
        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <SearchControlled
              ref={productSearchRef}
              name="customer"
              label="Cliente"
              required
              clearable
              placeholder="Martín Bueno"
              rules={{
                validate: {
                  required: (value) => !!value?.id || "Campo requerido.",
                  activeCustomer: (value) =>
                    value?.state === CUSTOMER_STATES.ACTIVE.id ||
                    "No es posible confirmar ni dejar en estado pendiente o borrador, presupuestos con clientes inactivos.",
                  requiredAddress: (value) =>
                    isBudgetConfirmed(watchState) &&
                      (!value?.addresses.length && !watchPickUp)
                      ? "Dirección requerida."
                      : true,
                  requiredPhone: (value) =>
                    isBudgetConfirmed(watchState) && !value?.phoneNumbers.length
                      ? "Teléfono requerido."
                      : true,
                }
              }}
              elements={customers}
              searchFields={['name', 'id']}
              getResultProps={(customer) => ({
                key: customer.id,
                title: getCustomerSearchTitle(customer),
                description: getCustomerSearchDescription(customer),
                value: customer,
              })}
              persistSelection={true}
            />
          </FormField>
          <FormField flex="1">
            <TextField
              flex="2"
              label="Dirección"
              placeholder="Dirección"
              disabled
              error={
                !watchCustomer?.addresses?.length &&
                errors.customer?.type === "requiredAddress" &&
                errors.customer?.message
              }
              value={
                watchPickUp
                  ? PICK_UP_IN_STORE
                  : watchCustomer?.addresses?.length > 0
                    ? `${watchCustomer.addresses?.[0]?.ref ? `${watchCustomer.addresses[0].ref}: ` : ''}${watchCustomer.addresses[0].address}`
                    : "Cliente sin dirección"
              }
              extraContent={() => {
                const { additionalAddresses } = getAddressesForDisplay(watchCustomer?.addresses || []);
                return additionalAddresses ? <AddressesTooltip input addresses={additionalAddresses} /> : null;
              }}
            />
          </FormField>
          <FormField flex="1">
            <TextField
              flex="2"
              label="Teléfono"
              placeholder="Teléfono"
              disabled
              error={
                !watchCustomer?.phoneNumbers?.length &&
                errors.customer?.type === "requiredPhone" &&
                errors.customer?.message
              }
              value={
                watchCustomer?.phoneNumbers?.length > 0
                  ? `${watchCustomer.phoneNumbers?.[0]?.ref ? `${watchCustomer.phoneNumbers[0].ref}: ` : ''}${getFormatedPhone(watchCustomer.phoneNumbers[0])}`
                  : "Cliente sin teléfono"
              }
              extraContent={() => {
                const { additionalPhones } = getPhonesForDisplay(watchCustomer?.phoneNumbers || []);
                return additionalPhones ? <PhonesTooltip input phones={additionalPhones} /> : null;
              }}
            />
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
          <Controller
            name="productsValidation"
            control={control}
            rules={{
              validate: () =>
                watchProducts?.length > 0 || "Al menos un producto es requerido.",
            }}
            render={() => null}
          />
          <FormField flex="1">
            <SearchControlled
              name="product"
              label="Producto"
              required
              clearAfterSelect
              placeholder="Televisor 100”"
              externalError={
                errors.productsValidation && {
                  content: errors.productsValidation.message,
                  pointing: 'above',
                }
              }
              // rules={{
              //   validate: () => {
              //     return !!watchProducts.length || "Al menos un producto es requerido.";
              //   },
              // }}
              elements={products}
              searchFields={['name', 'id']}
              getResultProps={(product) => ({
                key: product.id,
                title: getProductSearchTitle(product),
                description: getProductSearchDescription(product),
                value: product,
              })}
              onAfterChange={(selectedProduct) => {
                appendProduct({
                  ...selectedProduct,
                  quantity: selectedProduct?.state === PRODUCT_STATES.OOS.id ? 0 : 1,
                  discount: 0,
                  rowId: uuid(),
                  delivered: 0,
                  key: uuid(),
                  ...(selectedProduct?.fractionConfig?.active && {
                    fractionConfig: {
                      ...selectedProduct?.fractionConfig,
                      value: 1,
                      price: selectedProduct?.price,
                    }
                  })
                });
              }}
            />
          </FormField>
          <FormField flex="1" />
          <FormField flex="1" />
        </FieldsContainer>
        <Loader active={isTableLoading}>
          <Table
            mainKey="rowId"
            headers={BUDGET_FORM_PRODUCT_COLUMNS}
            elements={watchProducts}
            actions={actions}
          />
          <Total
            subtotal={subtotal}
            globalDiscount={watchGlobalDiscount}
            subtotalAfterDiscount={subtotalAfterDiscount}
            onGlobalDiscountChange={(v) =>
              setValue("globalDiscount", v, { shouldDirty: true })
            }
            additionalCharge={watchAdditionalCharge}
            onAdditionalChargeChange={(v) =>
              setValue("additionalCharge", v, { shouldDirty: true })
            }
            total={total}
          />
        </Loader>
        <FieldsContainer width="100%" $rowGap="15px">
          <Controller
            name="paymentMethods"
            render={({ field: { onChange, value } }) => (
              <FormField flex="1" label="Métodos de pago" control={Input} height="auto">
                <Flex $columnGap="5px" wrap="wrap" $rowGap="5px">
                  <Button
                    padding="0 18px"
                    width="fit-content"
                    type="button"
                    basic={value?.length !== paymentMethods?.length}
                    color={COLORS.BLUE}
                    onClick={() => {
                      if (value?.length === paymentMethods?.length) {
                        onChange([]);
                      } else {
                        onChange(paymentMethods?.map(method => method.value));
                      }
                    }}
                  >
                    Todos
                  </Button>
                  <VerticalDivider />
                  {paymentMethods?.map(({ key, text, value: methodValue }) => (
                    <Button
                      padding="0 18px"
                      width="fit-content"
                      key={key}
                      basic={!value?.includes(methodValue)}
                      color={COLORS.BLUE}
                      type="button"
                      onClick={() => {
                        if (value.includes(methodValue)) {
                          onChange(value.filter(payment => payment !== methodValue));
                        } else {
                          onChange([...value, methodValue]);
                        }
                      }}
                    >
                      {text}
                    </Button>
                  ))}
                </Flex>
              </FormField>
            )}
          />
        </FieldsContainer>
        <TextAreaControlled name="comments" label="Comentarios" placeholder="Pago con billetes de 100" />
        <SubmitAndRestore
          canSubmitWithoutChanges={canSubmit}
          isLoading={isLoading && !isBudgetDraft(watchState)}
          disabled={isLoading}
          isDirty={isDirty}
          isUpdating={draft || isCloning}
          onReset={handleTryReset}
          color={currentState.color}
          onSubmit={handleSubmit(handleConfirm)}
          icon={currentState.icon}
          text={currentState.singularTitle}
          submit
          extraButton={
            <IconedButton
              icon={BUDGET_STATES.DRAFT.icon}
              labelPosition="left"
              disabled={isLoading || !isDirty}
              loading={isLoading && isBudgetDraft(watchState)}
              type="button"
              onClick={handleSubmit(handleDraft)}
              color={BUDGET_STATES.DRAFT.color}
              width="fit-content"
              text={BUDGET_STATES.DRAFT.singularTitle}
            >
            </IconedButton>
          }
        />
      </Form>
      {/* </FormProvider > */}
    </>
  );
};

export default BudgetForm;
