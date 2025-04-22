import { IconedButton, SubmitAndRestore } from "@/common/components/buttons";
import { Box, Button, FieldsContainer, Flex, FlexColumn, Form, FormField, Input, Label, OverflowWrapper } from "@/common/components/custom";
import { DropdownControlled, GroupedButtonsControlled, NumberControlled, PercentControlled, PriceControlled, PriceLabel, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import Payments from "@/common/components/form/Payments";
import ProductSearch from "@/common/components/search/search";
import { Text } from "@/common/components/search/styles";
import { Table, Total } from "@/common/components/table";
import { AddressesTooltip, CommentTooltip, PhonesTooltip, TagsTooltip } from "@/common/components/tooltips";
import { COLORS, ICONS, RULES, SHORTKEYS } from "@/common/constants";
import { getAddressesForDisplay, getFormatedPhone, getPhonesForDisplay } from "@/common/utils";
import { getDateWithOffset, now } from "@/common/utils/dates";
import { BUDGET_STATES, PAYMENT_METHODS, PICK_UP_IN_STORE } from "@/components/budgets/budgets.constants";
import { getSubtotal, getTotalSum, isBudgetConfirmed, isBudgetDraft } from '@/components/budgets/budgets.utils';
import { Loader } from "@/components/layout";
import { ATTRIBUTES, PRODUCT_STATES } from "@/components/products/products.constants";
import { getBrandCode, getPrice, getProductCode, getSupplierCode, getTotal, isProductOOS } from "@/components/products/products.utils";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { omit, pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ButtonGroup, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import { CUSTOMER_STATES } from "../../customers/customers.constants";
import ModalUpdates from "../ModalUpdates";
import ModalComment from "./ModalComment";
import { Container, Icon, VerticalDivider } from "./styles";

const EMPTY_BUDGET = (user) => ({
  seller: user?.name,
  customer: { name: '', addresses: [], phoneNumbers: [] },
  products: [],
  comments: '',
  globalDiscount: 0,
  additionalCharge: 0,
  paymentMethods: PAYMENT_METHODS.map(({ value }) => value),
  expirationOffsetDays: '',
  paymentsMade: [],
  pickUpInStore: false,
});

const BudgetForm = ({
  onSubmit,
  products,
  customers = [],
  budget,
  user,
  isLoading,
  isCloning,
  draft,
}) => {
  const methods = useForm({
    defaultValues: isCloning && budget
      ? {
        ...omit(budget, ['id', 'comments', 'paymentsMade', 'customer', 'expirationOffsetDays', 'paymentMethods']),
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
        seller: user?.name,
        paymentMethods: PAYMENT_METHODS.map(({ value }) => value),
      }
      : budget && draft
        ? {
          ...budget,
          seller: user?.name,
          paymentsMade: budget.paymentsMade || [],
        }
        : {
          ...EMPTY_BUDGET(user),
        },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { control, handleSubmit, setValue, watch, reset, formState: { isDirty, errors } } = methods;
  const { append: appendProduct, remove: removeProduct, update: updateProduct } = useFieldArray({
    control,
    name: "products"
  });
  const [watchGlobalDiscount, watchAdditionalCharge, watchCustomer, watchState, watchPickUp, watchProducts] = watch(['globalDiscount', 'additionalCharge', 'customer', 'state', 'pickUpInStore', 'products']);
  const hasShownModal = useRef(false);
  const productSearchRef = useRef(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [originalPrices, setOriginalPrices] = useState({});
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [temporaryProducts, setTemporaryProducts] = useState([]);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [shouldShowModal, setShouldShowModal] = useState(false);
  const [expiration, setExpiration] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [subtotalAfterDiscount, setSubtotalAfterDiscount] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    const updatedSubtotalAfterDiscount = getSubtotal(subtotal, -watchGlobalDiscount);
    setSubtotalAfterDiscount(updatedSubtotalAfterDiscount);

    const updatedtotal = getSubtotal(updatedSubtotalAfterDiscount, watchAdditionalCharge);
    setTotal(updatedtotal);
  }, [subtotal, watchGlobalDiscount, watchAdditionalCharge]);

  const customerOptions = useMemo(() => {
    return customers.map(({ id, name, state, inactiveReason, tags, comments, phoneNumbers, addresses }) => ({
      key: id,
      value: { phoneNumbers, addresses, id, state, name },
      text: name,
      content: (
        <FlexColumn $marginTop="5px" $rowGap="5px">
          <FlexColumn>
            <OverflowWrapper popupContent={name}>
              <Text>{name}</Text>
            </OverflowWrapper>
          </FlexColumn>
          <Flex $justifyContent="space-between" $alignItems="center" $columnGap="5px">
            <Box >
              {state === CUSTOMER_STATES.INACTIVE.id ? (
                <Popup
                  trigger={<Label width="fit-content" color={COLORS.GREY} size="tiny">Desactivado</Label>}
                  content={inactiveReason || 'Motivo no especificado'}
                  position="top center"
                  size="mini"
                />
              ) : (
                <Box visibility="hidden" >Desactivado</Box>
              )}
            </Box>
            <Box >
              {tags ? (
                <TagsTooltip tags={tags} />
              ) : (
                <Box visibility="hidden">🔖</Box>
              )}
            </Box>
            <Box style={{ width: "30px", textAlign: "center" }}>
              {comments ? (
                <CommentTooltip comment={comments} />
              ) : (
                <Box visibility="hidden">ℹ️</Box>
              )}
            </Box>
          </Flex>
        </FlexColumn>
      ),
    }));
  }, [customers]);

  const normalizedCustomer = useMemo(() => {
    if (!watchCustomer ?? !watchCustomer?.id) return null;

    return customerOptions.find(option => option.key === watchCustomer.id)?.value || {
      id: watchCustomer.id,
      name: watchCustomer.name,
      state: watchCustomer.state,
      addresses: watchCustomer.addresses,
      phoneNumbers: watchCustomer.phoneNumbers
    };
  }, [watchCustomer, customerOptions]);

  useEffect(() => {

    if (
      normalizedCustomer &&
      normalizedCustomer?.id &&
      (
        JSON.stringify(normalizedCustomer) !== JSON.stringify(watchCustomer)
      )
    ) {
      setValue("customer", normalizedCustomer, { shouldValidate: true });
    }
  }, [normalizedCustomer, setValue, watch, watchCustomer]);

  useEffect(() => {
    if (isCloning && !hasShownModal.current) {
      setIsTableLoading(true);
      let budgetProducts = [...budget.products];
      const outdatedProducts = products.filter(product => {
        const budgetProduct = budgetProducts.find(budgetProduct => budgetProduct.code === product.code);

        if (budgetProduct) {
          budgetProducts = budgetProducts.filter(budgetProduct => budgetProduct.code !== product.code);

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

      if (outdatedProducts.length || budgetProducts.length) {
        let newProducts = watchProducts.map(product => {
          const outdatedProduct = outdatedProducts.find(op => op.code === product.code);
          if (outdatedProduct) {
            setOriginalPrices(prev => ({
              ...prev,
              [product.code]: product.price
            }));

            return {
              ...product,
              price: outdatedProduct.price,
              editablePrice: outdatedProduct.editablePrice,
              fractionConfig: {
                ...product.fractionConfig,
                ...outdatedProduct.fractionConfig,
              },
              state: outdatedProduct.state,
              quantity: outdatedProduct.state === PRODUCT_STATES.OOS.id ? 0 : product.quantity
            };
          }
          return product;
        });

        setTemporaryProducts(newProducts);
        setOutdatedProducts(outdatedProducts);
        setRemovedProducts(budgetProducts);
        setShouldShowModal(true);
        hasShownModal.current = true;
      } else {
        setIsTableLoading(false);
      }
    }
  }, [budget, isCloning, products, watchProducts, setValue]);

  const handleConfirmUpdate = () => {
    setValue('products', temporaryProducts);
    setOriginalPrices({});
    setShouldShowModal(false);
    setIsTableLoading(false);
  };

  const handleCancelUpdate = () => {
    const restoredProducts = temporaryProducts.map(product => {
      if (originalPrices[product.code] !== undefined) {
        return {
          ...product,
          price: originalPrices[product.code],
        };
      }
      return product;
    });

    setValue(
      "products",
      restoredProducts.filter(product =>
        product.state !== PRODUCT_STATES.DELETED.id && product.state !== PRODUCT_STATES.INACTIVE.id
      )
    );
    setShouldShowModal(false);
    setIsTableLoading(false);
  };

  const calculateTotal = useCallback(() => {
    const totalSum = getTotalSum(watchProducts);
    setSubtotal(totalSum);
  }, [watchProducts]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const handleCreate = async (data, state) => {
    const { customer } = data;
    await onSubmit({
      ...data,
      customer: { id: customer.id, name: customer.name },
      products: data.products.map((product) => pick(product, [...Object.values(ATTRIBUTES), "quantity", "discount", "dispatchComment"])),
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
    if (draft || isCloning) {
      reset({
        ...EMPTY_BUDGET(user),
        ...budget,
        seller: user?.name,
      });
    } else {
      reset({
        ...EMPTY_BUDGET(user),
        state: watchState,
        seller: user?.name,
      });
    }

    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [draft, isCloning, reset, user, budget, watchState]);

  const handleOpenCommentModal = useCallback((product, index) => {
    setSelectedProduct(() => ({ ...product, index }));
    setIsModalCommentOpen(true);
  }, []);

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: (element, index) => removeProduct(index),
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
          {'-'}
          <Popup
            size="tiny"
            trigger={<span>{getBrandCode(product.code)}</span>}
            position="top center"
            on="hover"
            content={product.brandName}
          />
          {'-'}
          <span>{getProductCode(product.code)}</span>
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
          width="80px"
          name={`products[${index}].quantity`}
          onChange={() => {
            calculateTotal();
          }}
          disabled={isProductOOS(product.state)}
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
            {product.state === PRODUCT_STATES.OOS.id && <Label color={COLORS.ORANGE} size="tiny">Sin Stock</Label>}
            {product.tags && <TagsTooltip tooltip="true" tags={product.tags} />}
            {product.comments && <CommentTooltip tooltip="true" comment={product.comments} />}
            {(!!product.dispatchComment || !!product?.dispatch?.comment) && (
              <Popup size="mini" content={product.dispatchComment || product?.dispatch?.comment} position="top center" trigger={<Icon name={ICONS.TRUCK} color={COLORS.ORANGE} />} />
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
              width="100px"
              name={`products[${index}].fractionConfig.value`}
              unit={product.fractionConfig.unit}
              defaultValueFallback={1}
              onChange={(value) => {
                const safeValue = value ?? 1;
                setValue(`products[${index}].fractionConfig.price`, safeValue * product.price);
                calculateTotal();
              }}
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

  return (
    <>
      <ModalComment onAddComment={onAddComment} isModalOpen={isModalCommentOpen} onClose={setIsModalCommentOpen} product={selectedProduct} />
      <ModalUpdates
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
              <ButtonGroup size="small">
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
            <TextControlled
              name="seller"
              label="Vendedor"
              rules={RULES.REQUIRED}
              width="300px"
              disabled
            />
            <FieldsContainer>
              <NumberControlled
                width="200px"
                name="expirationOffsetDays"
                rules={RULES.REQUIRED}
                maxLength={3}
                label="Dias para el vencimiento"
                placeholder="Cantidad en días"
                onChange={setExpiration}
              />
              <FormField
                $width="200px"
                label="Fecha de vencimiento"
                control={Input}
                readOnly
                value={
                  expiration || budget?.expirationOffsetDays
                    ? getDateWithOffset(now(), expiration || budget?.expirationOffsetDays, "days")
                    : ""
                }
                placeholder="dd/mm/aaaa"
              />
            </FieldsContainer>
          </FieldsContainer>
          <FieldsContainer>
            <DropdownControlled
              name="customer"
              border
              rules={{
                validate: {
                  required: value => {
                    return !!value?.id || 'Campo requerido.';
                  },
                  activeCustomer: value => {
                    return value?.state === CUSTOMER_STATES.ACTIVE.id || 'No es posible confirmar ni dejar en estado pendiente o borrador, presupuestos con clientes inactivos.';
                  },
                  requiredAddress: value => {
                    return (
                      isBudgetConfirmed(watchState) &&
                      (!value?.addresses.length && !watchPickUp)
                    )
                      ? 'Dirección requerida.'
                      : true;
                  },
                  requiredPhone: value => {
                    return (
                      isBudgetConfirmed(watchState) &&
                      !value?.phoneNumbers.length
                    )
                      ? 'Teléfono requerido.'
                      : true;
                  },
                }
              }}
              pickErrors={["required", "activeCustomer"]}
              label="Cliente"
              placeholder="Seleccione un cliente"
              width="300px"
              options={customerOptions}
              value={normalizedCustomer ?? "No se seleccionó ningún cliente"}
              search
            />
            <TextField
              flex="2"
              label="Dirección"
              placeholder="Dirección"
              disabled
              error={!watchCustomer?.addresses?.length && (errors.customer?.type === "requiredAddress") && errors.customer?.message}
              value={
                watchPickUp
                  ? PICK_UP_IN_STORE
                  : watchCustomer?.addresses?.length > 0
                    ? `${watchCustomer?.addresses?.[0]?.ref ? `${watchCustomer.addresses[0].ref}: ` : ''}${watchCustomer.addresses[0].address}`
                    : 'Cliente sin dirección'
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
              error={!watchCustomer?.phoneNumbers?.length && (errors.customer?.type === "requiredPhone") && errors.customer?.message}
              disabled
              value={
                watchCustomer?.phoneNumbers?.length > 0
                  ? `${watchCustomer?.phoneNumbers?.[0]?.ref ? `${watchCustomer.phoneNumbers[0].ref}: ` : ''}${getFormatedPhone(watchCustomer.phoneNumbers[0])}`
                  : 'Cliente sin teléfono'
              }
              extraContent={() => {
                const { additionalPhones } = getPhonesForDisplay(watchCustomer?.phoneNumbers);
                return additionalPhones ? <PhonesTooltip input phones={additionalPhones} /> : null;
              }}
            />
          </FieldsContainer>
          <Controller name="products"
            rules={{ validate: value => value?.length || 'Al menos 1 producto es requerido.' }}
            render={() => (
              <FormField
                $width="300px"
                label="Productos"
                error={errors.products?.root?.message}
                control={ProductSearch}
                ref={productSearchRef}
                tooltip
                products={products}
                onProductSelect={(selectedProduct) => {
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
            )}
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
          {isBudgetConfirmed(watchState) && !isCloning && (
            <FieldsContainer width="100%" $rowGap="15px">
              <Payments
                total={total}
                update
              />
            </FieldsContainer>
          )}
          <FieldsContainer width="100%" $rowGap="15px">
            <Controller
              name="paymentMethods"
              rules={RULES.REQUIRED}
              render={({ field: { onChange, value } }) => (
                <FormField flex="1" label="Metodos de pago" control={Input}>
                  <Flex $columnGap="5px" wrap="wrap" $rowGap="5px">
                    <Button
                      $paddingLeft="fit-content"
                      width="fit-content"
                      type="button"
                      basic={value.length !== PAYMENT_METHODS.length}
                      color={COLORS.BLUE}
                      onClick={() => {
                        if (value.length === PAYMENT_METHODS.length) {
                          onChange([]);
                        } else {
                          onChange(PAYMENT_METHODS.map(method => method.value));
                        }
                      }}
                    >
                      Todos
                    </Button>
                    <VerticalDivider />
                    {PAYMENT_METHODS.map(({ key, text, value: methodValue }) => (
                      <Button
                        $paddingLeft="fit-content"
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
          <TextAreaControlled name="comments" label="Comentarios" />
          <SubmitAndRestore
            draft={draft}
            isLoading={isLoading && !isBudgetDraft(watchState)}
            disabled={isLoading}
            isDirty={isDirty}
            isUpdating={draft || isCloning}
            onReset={handleReset}
            color={currentState.color}
            onSubmit={handleSubmit(handleConfirm)}
            icon={currentState.icon}
            text={currentState.singularTitle}
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
