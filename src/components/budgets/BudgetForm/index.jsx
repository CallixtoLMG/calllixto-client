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
import { SearchResultContent, SearchResultDescription, SearchResultTitle } from "@/common/components/form/Search/styles";
import { Table, Total } from "@/common/components/table";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "@/common/components/tooltips";
import { POPUP_POSITIONS, CONTENT_SIZES, COLORS, DATE_FORMATS, ERROR_MESSAGES, FIELD_LABELS, ICONS, RULES, SHORTKEYS, SIZES, TOOLTIPS } from "@/common/constants";
import { getAddressesForDisplay, getFormatedPhone, getPhonesForDisplay, removeNullish } from "@/common/utils";
import { getDateWithOffset, getFormatedDate } from "@/common/utils/dates";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { isBudgetConfirmed, isBudgetDraft } from '@/components/budgets/budgets.utils';
import { Loader } from "@/components/layout";
import { LIST_ATTRIBUTES, PRODUCT_STATES, getProductSearchDescription, getProductSearchTitle } from "@/components/products/products.constants";
import { getBrandId, getPrice, getProductId, getSupplierId, getTotal, isProductOOS, normalizeBudgetProductFractionConfig } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useFieldArray, useFormContext } from "react-hook-form";
import { ButtonGroup, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { CUSTOMER_STATES, getCustomerSearchDescription, getCustomerSearchTitle } from "../../customers/customers.constants";
import ModalCreateCustomer from "../ModalCreateCustomer";
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
    clearErrors,
    formState: { isDirty, errors },
  } = useFormContext();

  const { append: appendProduct, remove: removeProduct, update: updateProduct, replace: replaceProducts } = useFieldArray({
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
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isCreateCustomerModalOpen, setIsCreateCustomerModalOpen] = useState(false);
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
    const currentProducts = Array.isArray(watchProducts) ? watchProducts : [];

    const updatedProducts = currentProducts.map(product => {
      const outdated = outdatedProducts.find(op => op.id === product.id);

      const base = outdated ?? product;
      const price = Number(base.price ?? product.price ?? 0);
      const nextProduct = {
        ...product,
        name: base.name,
        price,
        quantity: Number(product.quantity ?? 1),
        discount: Number(product.discount ?? 0),
        editablePrice: base.editablePrice ?? product.editablePrice ?? false,
        stockControl: base.stockControl ?? product.stockControl,
        state: base.state,
      };
      const fractionConfig = normalizeBudgetProductFractionConfig(product, {
        ...base,
        price,
      });

      return {
        ...nextProduct,
        ...(fractionConfig && { fractionConfig }),
      };
    });

    const finalProducts = updatedProducts.filter(
      p => !removedProducts.some(r => r.id === p.id)
    );

    replaceProducts(finalProducts);
    setValue("products", finalProducts, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    trigger("productsValidation");

    setShouldShowModal(false);
    setIsTableLoading(false);
  };


  const handleCancelUpdate = () => {
    if (!initialClonedProductsRef.current) return;

    replaceProducts(initialClonedProductsRef.current);
    setValue("products", initialClonedProductsRef.current, {
      shouldDirty: false,
      shouldTouch: false,
      shouldValidate: true,
    });

    setValue("expirationOffsetDays", "", { shouldDirty: false });

    setShouldShowModal(false);
    setIsTableLoading(false);
  };

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

  const handleCreateCustomerClose = useCallback((customer) => {
    setIsCreateCustomerModalOpen(false);

    if (!customer) return;

    setValue("customer", customer, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    clearErrors("customer");
    trigger("customer");
  }, [clearErrors, setValue, trigger]);

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (element, index) => {
        removeProduct(index);

        queueMicrotask(() => {
          trigger("productsValidation");
        });
      },
      tooltip: TOOLTIPS.DELETE,
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
      title: FIELD_LABELS.ID,
      value: (product) => (
        <>
          <Popup
            size={SIZES.TINY}
            trigger={<span>{getSupplierId(product.id)}</span>}
            position={POPUP_POSITIONS.TOP_CENTER}
            on="hover"
            content={product.supplierName}
          />
          {'-'}
          <Popup
            size={SIZES.TINY}
            trigger={<span>{getBrandId(product.id)}</span>}
            position={POPUP_POSITIONS.TOP_CENTER}
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
      title: FIELD_LABELS.QUANTITY,
      value: (product, index) => (
        <NumberControlled
          padding="9px 14px"
          width="80px"
          name={`products[${index}].quantity`}
          disabled={isProductOOS(product.state)}
          data-testid={`budget-product-${index}-quantity-field`}
          allowsDecimal
        />
      ),
      width: 1
    },
    {
      id: 3,
      title: FIELD_LABELS.NAME,
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
              <Popup size="mini" content={product.dispatchComment || product?.dispatch?.comment} position={POPUP_POSITIONS.TOP_CENTER} trigger={<Icon lineHeight="normal" name={ICONS.TRUCK} color={COLORS.BLUE} />} />
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
                const safeValue = Number(value ?? 1);
                setValue(`products[${index}].fractionConfig.price`, safeValue * Number(product.price ?? 0), {
                  shouldDirty: true,
                  shouldTouch: true,
                });
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
      title: FIELD_LABELS.PRICE,
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
              dataTestId={`budget-product-${index}-price-field`}
            />
          )
          : (
            <div data-testid={`budget-product-${index}-price-label`}>
              <PriceLabel width="100%" value={getPrice(product)} />
            </div>
          )
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
            dataTestId={`budget-product-${index}-discount-field`}
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
      title: FIELD_LABELS.TOTAL,
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
      <ModalCreateCustomer
        isModalOpen={isCreateCustomerModalOpen}
        initialName={customerSearchQuery}
        onClose={handleCreateCustomerClose}
      />
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
                dataTestId="budget-state-confirmed-button"
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
                dataTestId="budget-state-pending-button"
                onClick={() => setValue("state", BUDGET_STATES.PENDING.id, {
                  shouldDirty: true,
                  shouldTouch: true,
                })}
              />
            </ButtonGroup>
          </FormField>
          <GroupedButtonsControlled
            $alignItems="flex-end"
            name="pickUpInStore"
            width={CONTENT_SIZES.FIT}
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
          <FormField $justifyContent="flex-end" $flexDirection="row" flex="1">
            <NumberControlled
              flex="1"
              name="expirationOffsetDays"
              rules={{
                validate: {
                  positive: (value) => value > 0 || ERROR_MESSAGES.REQUIRED_FIELD
                },
              }}
              maxLength={3}
              label="Dias para el vencimiento"
              placeholder="3"
              data-testid="budget-expiration-days-field"
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
          <FormField $flexDirection="row" flex="1">
            <FormField flex="1">
              <SearchControlled
                name="customer"
                label="Cliente"
                required
                clearable
                dataTestId="budget-customer-search"
                placeholder="Martín Bueno"
                rules={{
                  validate: {
                    required: (value) => !!value?.id || ERROR_MESSAGES.REQUIRED_FIELD,
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
                onQueryChange={setCustomerSearchQuery}
                getResultProps={(customer) => ({
                  key: customer.id,
                  title: customer.name ?? "",
                  description: customer.comments ?? "",
                  value: customer,
                })}
                resultRenderer={({ value: customer }) => (
                  <SearchResultContent>
                    <SearchResultTitle>
                      {getCustomerSearchTitle(customer)}
                    </SearchResultTitle>
                    <SearchResultDescription>
                      {getCustomerSearchDescription(customer)}
                    </SearchResultDescription>
                  </SearchResultContent>
                )}
                persistSelection={true}
              />
            </FormField>
            <FormField $maxWidth={CONTENT_SIZES.MAX} $alignItems="flex-end" $flexDirection="row" flex="1">
              <IconedButton
                type="button"
                text="Agregar cliente"
                icon={ICONS.ADD}
                color={COLORS.BLUE}
                onClick={() => setIsCreateCustomerModalOpen(true)}
                iconOnly
                height="38px"
              />
            </FormField>
          </FormField>
          <FormField $maxWidth="32%" flex="1">
            <TextField
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
              ref={productSearchRef}
              name="product"
              label="Producto"
              required
              clearAfterSelect
              dataTestId="budget-product-search"
              placeholder="Televisor 100”"
              externalError={
                errors.productsValidation && {
                  content: errors.productsValidation.message,
                  pointing: 'above',
                }
              }
              elements={products}
              searchFields={['name', 'id']}
              getResultProps={(product) => ({
                key: product.id,
                title: product.name ?? "",
                description: product.comments ?? "",
                value: product,
              })}
              resultRenderer={({ value: product }) => (
                <SearchResultContent>
                  <SearchResultTitle>
                    {getProductSearchTitle(product)}
                  </SearchResultTitle>
                  <SearchResultDescription>
                    {getProductSearchDescription(product)}
                  </SearchResultDescription>
                </SearchResultContent>
              )}
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
                clearErrors("productsValidation");
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
                    width={CONTENT_SIZES.FIT}
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
                      width={CONTENT_SIZES.FIT}
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
        <TextAreaControlled name="comments" label={FIELD_LABELS.COMMENTS} placeholder="Pago con billetes de 100" />
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
          submitDataTestId="budget-submit-current-state-button"
          extraButton={
            <IconedButton
              icon={BUDGET_STATES.DRAFT.icon}
              labelPosition="left"
              disabled={isLoading || !isDirty}
              loading={isLoading && isBudgetDraft(watchState)}
              type="button"
              onClick={handleSubmit(handleDraft)}
              color={BUDGET_STATES.DRAFT.color}
              width={CONTENT_SIZES.FIT}
              text={BUDGET_STATES.DRAFT.singularTitle}
              dataTestId="budget-submit-draft-button"
            >
            </IconedButton>
          }
        />
      </Form >
    </>
  );
};

export default BudgetForm;
