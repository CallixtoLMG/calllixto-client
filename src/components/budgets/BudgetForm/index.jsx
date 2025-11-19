import { IconedButton, SubmitAndRestore } from "@/common/components/buttons";
import { Button, FieldsContainer, Flex, Form, FormField, Icon, Input, Label, OverflowWrapper } from "@/common/components/custom";
import {
  GroupedButtonsControlled,
  NumberControlled,
  PercentControlled,
  PriceControlled,
  PriceLabel,
  TextAreaControlled,
  TextControlled,
  TextField,
  SearchControlled
} from "@/common/components/form";
import { Table, Total } from "@/common/components/table";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, DATE_FORMATS, ICONS, RULES, SHORTKEYS, SIZES } from "@/common/constants";
import { getAddressesForDisplay, getFormatedPhone, getPhonesForDisplay } from "@/common/utils";
import { getDateWithOffset, getFormatedDate } from "@/common/utils/dates";
import { BUDGET_STATES, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { getSubtotal, getTotalSum, isBudgetConfirmed, isBudgetDraft } from '@/components/budgets/budgets.utils';
import { Loader } from "@/components/layout";
import CreateBudgetPayments from "@/components/payments/CreateBudgetPayment";
import { LIST_ATTRIBUTES, PRODUCT_STATES, getProductSearchDescription, getProductSearchTitle } from "@/components/products/products.constants";
import { getBrandId, getPrice, getProductId, getSupplierId, getTotal, isProductOOS } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks";
import { pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ButtonGroup, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { CUSTOMER_STATES, getCustomerSearchDescription, getCustomerSearchTitle } from "../../customers/customers.constants";
import ModalProductUpdates from "../ModalProductUpdates";
import ModalComment from "./ModalComment";
import { Container, VerticalDivider } from "./styles";

const EMPTY_BUDGET = (user) => ({
  createdBy: user?.name,
  customer: { name: '', addresses: [], phoneNumbers: [] },
  products: [],
  comments: '',
  globalDiscount: 0,
  additionalCharge: 0,
  paymentMethods: [],
  expirationOffsetDays: '',
  paymentsMade: [],
  pickUpInStore: false,
});

const BudgetForm = ({
  onSubmit,
  products,
  settings = {},
  customers = [],
  budget,
  user,
  isLoading,
  isCloning,
  draft,
  paymentMethods,
}) => {
  const clonedInitialValues = useMemo(() => {
    if (!isCloning || !budget) return EMPTY_BUDGET(user);

    return {
      products: budget.products.map((product) => ({
        ...product,
        quantity: product.state === PRODUCT_STATES.OOS.id ? 0 : product.quantity,
        ...(product.fractionConfig?.active && {
          fractionConfig: {
            ...product.fractionConfig,
            value: product.fractionConfig.value || 1,
            price: product.price,
          }
        })
      })),
      createdBy: user?.name,
      paymentMethods: paymentMethods.map(({ value }) => value),
      state: BUDGET_STATES.PENDING.id,
      customer: { name: '', addresses: [], phoneNumbers: [] },
      comments: '',
      globalDiscount: 0,
      additionalCharge: 0,
      expirationOffsetDays: '',
      paymentsMade: [],
      pickUpInStore: false,
    };
  }, [budget, isCloning, user, paymentMethods]);

  const methods = useForm({
    defaultValues: isCloning && budget
      ? clonedInitialValues
      : budget && draft
        ? {
          ...budget,
          createdBy: user?.name,
          paymentsMade: budget.paymentsMade || [],
        }
        : {
          ...EMPTY_BUDGET(user),
          ...settings.defaultsCreate,
          ...(settings?.defaultsCreate?.customer && { customer: customers.find(c => c.id === settings.defaultsCreate.customer) ?? null }),
        },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });

  useEffect(() => {
    const current = methods.getValues("paymentMethods");
    const all = paymentMethods?.map(m => m.value);

    if (!current?.length) {
      methods.setValue("paymentMethods", all, { shouldDirty: false });
    }
  }, [paymentMethods, methods]);

  const { control, trigger, handleSubmit, setValue, watch, reset, formState: { isDirty, errors } } = methods;
  const { append: appendProduct, remove: removeProduct, update: updateProduct } = useFieldArray({
    control,
    name: "products"
  });
  const [watchGlobalDiscount, watchAdditionalCharge, watchCustomer, watchState, watchPickUp, watchProducts] = watch(['globalDiscount', 'additionalCharge', 'customer', 'state', 'pickUpInStore', 'products']);
  const hasShownModal = useRef(false);
  const productSearchRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [temporaryProducts, setTemporaryProducts] = useState([]);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(settings?.defaultsCreate?.state === BUDGET_STATES.CONFIRMED.id);
  const [subtotal, setSubtotal] = useState(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0);
  const [total, setTotal] = useState(0);
  const watchExpirationOffsetDays = watch("expirationOffsetDays");

  const getRestoredProducts = useCallback((sourceProducts) => {
    return sourceProducts.map(product => {
      const latestProduct = products.find(p => p.id === product.id);
      const updatedState = latestProduct?.state ?? product.state;

      return {
        ...product,
        state: updatedState,
        quantity: updatedState === PRODUCT_STATES.OOS.id ? 0 : product.quantity,
      };
    }).filter(product =>
      product.state !== PRODUCT_STATES.INACTIVE.id &&
      product.state !== PRODUCT_STATES.DELETED.id &&
      products.some(p => p.id === product.id)
    );
  }, [products]);

  useEffect(() => {
    const updatedSubtotalAfterDiscount = getSubtotal(subtotal, -watchGlobalDiscount);
    setSubtotalAfterDiscount(updatedSubtotalAfterDiscount);

    const updatedtotal = getSubtotal(updatedSubtotalAfterDiscount, watchAdditionalCharge);
    setTotal(updatedtotal);
  }, [subtotal, watchGlobalDiscount, watchAdditionalCharge, trigger]);

  const customerOptions = useMemo(() => {
    return customers?.filter(({ state }) => state === CUSTOMER_STATES.ACTIVE.id);
  }, [customers]);

  useEffect(() => {
    if (isCloning && !hasShownModal.current) {
      setIsTableLoading(true);
      let budgetProducts = [...budget.products];

      const existingProductIds = new Set(products.map(p => p.id));
      const removedProducts = budgetProducts.filter(p => !existingProductIds.has(p.id));
      const validProducts = budgetProducts.filter(p => existingProductIds.has(p.id));

      setValue("products", validProducts);

      const outdatedProducts = products.filter(product => {
        const budgetProduct = validProducts.find(bp => bp.id === product.id);

        if (budgetProduct) {
          const priceChanged = budgetProduct.price !== product.price;
          const stateChanged = budgetProduct.state !== product.state;
          const editableChanged = budgetProduct.editablePrice !== product.editablePrice;

          const fractionConfigChanged =
            (budgetProduct.fractionConfig?.active !== product.fractionConfig?.active) ||
            (
              budgetProduct.fractionConfig?.active &&
              product.fractionConfig?.active &&
              (budgetProduct.fractionConfig.value !== product.fractionConfig.value && product.fractionConfig.value !== undefined)
            );

          return priceChanged || editableChanged || fractionConfigChanged || stateChanged;
        }

        return false;
      });

      if (outdatedProducts.length || removedProducts.length) {
        setTemporaryProducts(validProducts);
        setOutdatedProducts(outdatedProducts);
        setRemovedProducts(removedProducts);
        setShouldShowModal(true);
        hasShownModal.current = true;
      } else {
        setIsTableLoading(false);
      }
    }
  }, [budget, isCloning, products, setValue]);

  const handleConfirmUpdate = () => {
    const updatedProducts = temporaryProducts.map(product => {
      const outdatedProduct = outdatedProducts.find(op => op.id === product.id);

      if (outdatedProduct) {
        return {
          ...product,
          name: outdatedProduct.name,
          price: outdatedProduct.price,
          editablePrice: outdatedProduct.editablePrice,
          fractionConfig: {
            ...product.fractionConfig,
            ...outdatedProduct.fractionConfig,
          },
          state: outdatedProduct.state,
          quantity: outdatedProduct.state === PRODUCT_STATES.OOS.id ? 0 : product.quantity,
        };
      }

      return product;
    });

    const restoredProducts = getRestoredProducts(updatedProducts).filter(
      product => !removedProducts.find(rp => rp.id === product.id)
    );

    const restoredForm = {
      ...clonedInitialValues,
      products: restoredProducts,
    };

    reset(restoredForm);
    setValue("expirationOffsetDays", '', { shouldDirty: false });
    setShouldShowModal(false);
    setIsTableLoading(false);
  };

  const handleCancelUpdate = () => {
    const restoredProducts = getRestoredProducts(budget.products);

    const baseBudget = {
      ...clonedInitialValues,
      products: restoredProducts
    };

    reset(baseBudget);
    setValue("expirationOffsetDays", '', { shouldDirty: false });
    setShouldShowModal(false);
    setIsTableLoading(false);
  };

  const calculateTotal = useCallback(() => {
    const totalSum = getTotalSum(watchProducts);
    setSubtotal(totalSum);
  }, [watchProducts]);

  useEffect(() => {
    calculateTotal();
    if (isDirty) trigger('product');
  }, [watchProducts, calculateTotal, trigger, isDirty]);

  const handleCreate = async (data, state) => {
    const { customer } = data;
    await onSubmit({
      ...data,
      customer: { id: customer.id, name: customer.name },
      products: data.products.map((product) =>
        pick(product, [...LIST_ATTRIBUTES, "quantity", "discount", "dispatchComment", "tags"])
      ),
      total: Number(total.toFixed(2)),
      state
    });
  };

  const currentState = useMemo(() => {
    if (isBudgetConfirmed(watchState)) {
      return BUDGET_STATES.CONFIRMED;
    }
    return BUDGET_STATES.PENDING;
  }, [watchState]);

  const handleReset = useCallback(() => {
    let baseBudget;

    if (isCloning) {
      const restoredProducts = getRestoredProducts(clonedInitialValues.products);
      baseBudget = {
        ...clonedInitialValues,
        products: restoredProducts
      };
    } else if (draft) {
      baseBudget = { ...EMPTY_BUDGET(user), ...budget, createdBy: user?.name };
    } else {
      baseBudget = { ...EMPTY_BUDGET(user), state: watchState, createdBy: user?.name };
    }

    reset(baseBudget);
    setValue("expirationOffsetDays", '', { shouldDirty: false });

    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [reset, setValue, user, draft, budget, watchState, isCloning, clonedInitialValues, getRestoredProducts]);

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
      icon: ICONS.ADD,
      color: COLORS.GREEN,
      onClick: (element, index) => handleOpenCommentModal(element, index),
      tooltip: 'Comentarios'
    },
  ];

  const onAddComment = async ({ index, dispatchComment }) => {
    const product = watchProducts[index];
    product.dispatchComment = dispatchComment;
    updateProduct(index, product);
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
          onChange={() => {
            calculateTotal();
          }}
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
                calculateTotal();
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
              onAfterChange={calculateTotal}
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
            handleChange={calculateTotal}
            disabled={isProductOOS(product.state)}
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
  ], [calculateTotal, setValue]);

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
      <FormProvider {...methods}>
        <Form onSubmit={handleSubmit(handleConfirm)}>
          <FieldsContainer $justifyContent="space-between">
            <FormField $width="300px">
              <ButtonGroup size={SIZES.SMALL}>
                <IconedButton
                  text="Confirmado"
                  icon={ICONS.CHECK}
                  basic={!isConfirmed}
                  color={isConfirmed ? COLORS.GREEN : COLORS.ORANGE}
                  onClick={() => {
                    setIsConfirmed(true);
                    setValue('state', BUDGET_STATES.CONFIRMED.id);
                  }}
                />
                <IconedButton
                  text="Pendiente"
                  icon={ICONS.HOURGLASS_HALF}
                  basic={isConfirmed}
                  color={isConfirmed ? COLORS.GREEN : COLORS.ORANGE}
                  onClick={() => {
                    setIsConfirmed(false);
                    setValue('state', BUDGET_STATES.PENDING.id);
                  }}
                />
              </ButtonGroup>
            </FormField>
            <GroupedButtonsControlled
              name="pickUpInStore"
              width="350px"
              color={COLORS.BLUE}
              buttons={[
                { text: PICK_UP_IN_STORE, icon: ICONS.WAREHOUSE, value: true },
                { text: 'Enviar a Dirección', icon: ICONS.TRUCK, value: false },
              ]}
            />
          </FieldsContainer>
          <FieldsContainer $justifyContent="space-between">
            <FieldsContainer>
              <TextControlled
                name="createdBy"
                label="Vendedor"
                rules={RULES.REQUIRED}
                width="300px"
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
              <NumberControlled
                width="200px"
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
              <FormField
                $width="200px"
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
            </FieldsContainer>
          </FieldsContainer>
          <FieldsContainer>
            <SearchControlled
              name="customer"
              width="300px"
              label="Cliente"
              required
              clearable={!!watchCustomer?.name}
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
              elements={customerOptions}
              searchFields={['name', 'id']}
              getResultProps={(customer) => ({
                key: customer.id,
                title: getCustomerSearchTitle(customer),
                description: getCustomerSearchDescription(customer),
                value: customer,
              })}
              persistSelection={true}
            />
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
          </FieldsContainer>
          <SearchControlled
            name="product"
            label="Producto"
            width="300px"
            required
            placeholder="Televisor 100”"
            rules={{
              validate: () => {
                return !!watchProducts.length || "Al menos un producto es requerido.";
              },
            }}
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
                quantity: selectedProduct.state === PRODUCT_STATES.OOS.id ? 0 : 1,
                discount: 0,
                key: uuid(),
                ...(selectedProduct.fractionConfig?.active && {
                  fractionConfig: {
                    ...selectedProduct.fractionConfig,
                    value: 1,
                    price: selectedProduct.price,
                  }
                })
              });
            }}
          />
          <Loader active={isTableLoading}>
            <Table
              mainKey="key"
              headers={BUDGET_FORM_PRODUCT_COLUMNS}
              elements={watchProducts}
              actions={actions}
            />
            <Total
              subtotal={subtotal}
              globalDiscount={watchGlobalDiscount}
              subtotalAfterDiscount={subtotalAfterDiscount}
              onGlobalDiscountChange={(value) => setValue('globalDiscount', value, { shouldDirty: true })}
              additionalCharge={watchAdditionalCharge}
              onAdditionalChargeChange={(value) => setValue('additionalCharge', value, { shouldDirty: true })}
              total={total}
            />
          </Loader>
          {isBudgetConfirmed(watchState) && (
            <FieldsContainer width="100%" $rowGap="15px">
              <CreateBudgetPayments
                total={total}
                update
              />
            </FieldsContainer>
          )}
          <FieldsContainer width="100%" $rowGap="15px">
            <Controller
              name="paymentMethods"
              render={({ field: { onChange, value } }) => (
                <FormField flex="1" label="Métodos de pago" control={Input} height="auto">
                  <Flex $columnGap="5px" wrap="wrap" $rowGap="5px">
                    <Button
                      $paddingLeft="18px"
                      width="fit-content"
                      type="button"
                      basic={value.length !== paymentMethods?.length}
                      color={COLORS.BLUE}
                      onClick={() => {
                        if (value.length === paymentMethods?.length) {
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
                        $paddingLeft="18px"
                        width="fit-content"
                        key={key}
                        basic={!value.includes(methodValue)}
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
            draft={draft}
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
      </FormProvider>
    </>
  );
};

export default BudgetForm;
