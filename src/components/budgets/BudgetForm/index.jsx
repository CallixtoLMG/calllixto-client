import { PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { IconedButton, SubmitAndRestore } from "@/components/common/buttons";
import { Button, Dropdown, FieldsContainer, Flex, Form, FormField, Input, Label } from "@/components/common/custom";
import { PriceLabel, PriceControlled, TextAreaControlled, PercentControlled, NumberControlled } from "@/components/common/form";
import Payments from "@/components/common/form/Payments";
import ProductSearch from "@/components/common/search/search";
import { Table, Total } from "@/components/common/table";
import { CommentTooltip } from "@/components/common/tooltips";
import { Loader } from "@/components/layout";
import { ATTRIBUTES } from "@/components/products/products.common";
import { BUDGET_STATES, COLORS, CUSTOMER_STATES, ICONS, PAGES, PICK_UP_IN_STORE, PRODUCT_STATES, RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { expirationDate, formatProductCodePopup, formatedDateOnly, formatedSimplePhone, getPrice, getSubtotal, getTotal, getTotalSum, isBudgetConfirmed, isBudgetDraft } from "@/utils";
import { omit, pick } from "lodash";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, FormProvider, useFieldArray, useForm } from "react-hook-form";
import { ButtonGroup, Popup } from "semantic-ui-react";
import { v4 as uuid } from 'uuid';
import ModalUpdates from "../ModalUpdates";
import ModalComment from "./ModalComment";
import { Container, Icon, VerticalDivider } from "./styles";

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: { name: '', addresses: [], phoneNumbers: [] },
  products: [],
  comments: '',
  globalDiscount: 0,
  additionalCharge: 0,
  paymentMethods: PAYMENT_METHODS.map(({ value }) => value),
  expirationOffsetDays: '',
  paymentsMade: [],
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
  selectedContact,
  setSelectedContact,
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
        seller: `${user?.firstName} ${user?.lastName}`,
        paymentMethods: PAYMENT_METHODS.map(({ value }) => value),
      }
      : budget && draft
        ? {
          ...budget,
          seller: `${user?.firstName} ${user?.lastName}`,
          paymentsMade: budget.paymentsMade || [],
        }
        : {
          ...EMPTY_BUDGET(user),
        },
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const { control, handleSubmit, setValue, watch, reset, setError, clearErrors, formState: { isDirty, errors } } = methods;
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
  const isCustomerInactive = watchCustomer?.state === CUSTOMER_STATES.INACTIVE.id;

  useEffect(() => {
    const updatedSubtotalAfterDiscount = getSubtotal(subtotal, -watchGlobalDiscount);
    setSubtotalAfterDiscount(updatedSubtotalAfterDiscount);

    const updatedtotal = getSubtotal(updatedSubtotalAfterDiscount, watchAdditionalCharge);
    setTotal(updatedtotal);
  }, [subtotal, watchGlobalDiscount, watchAdditionalCharge]);

  const customerOptions = useMemo(() => {
    return customers.map(({ id, name, state, deactivationReason }) => ({
      key: id,
      value: id,
      text: name,
      content: (
        <Flex justifyContent="space-between" alignItems="center">
          <span>{name}</span>
          {state === CUSTOMER_STATES.INACTIVE.id && (
            <Flex>
              <Popup
                trigger={
                  <Label color={COLORS.GREY} size="mini">
                    Desactivado
                  </Label>}
                content={deactivationReason || 'Motivo no especificado'}
                position="top center"
                size="mini"
              />
            </Flex>
          )}
        </Flex>
      ),
    }));
  }, [customers]);

  const shouldError = useMemo(() => isBudgetConfirmed(watchState) && !draft && !watchPickUp, [draft, watchPickUp, watchState]);

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
    const isvalid = validateCustomer();
    if (isvalid) {
      const { customer } = data;
      await onSubmit({
        ...data,
        customer: { id: customer.id, name: customer.name },
        products: data.products.map((product) => pick(product, [...Object.values(ATTRIBUTES), "quantity", "discount", "dispatchComment"])),
        total: Number(total.toFixed(2)),
        state
      });
    }
  };

  const currentState = useMemo(() => {
    if (isBudgetConfirmed(watchState)) {
      return BUDGET_STATES.CONFIRMED;
    }
    return BUDGET_STATES.PENDING;
  }, [watchState]);

  const validateCustomer = () => {
    if (isBudgetConfirmed(watchState) && !watchPickUp && (!watchCustomer.addresses.length || !watchCustomer.phoneNumbers.length)) {
      if (!watchCustomer.addresses.length) {
        setError('customer.addresses', { type: 'manual', message: 'Campo requerido para confirmar un presupuesto.' });
      };
      if (!watchCustomer.phoneNumbers.length) {
        setError('customer.phoneNumbers', { type: 'manual', message: 'Campo requerido para confirmar un presupuesto.' });
      };
      return false;
    }
    clearErrors('customer');
    return true;
  };

  const handleReset = useCallback(() => {
    if (draft || isCloning) {
      reset({
        ...EMPTY_BUDGET(user),
        ...budget,
        seller: `${user?.firstName} ${user?.lastName}`,
      });
    } else {
      reset({
        ...EMPTY_BUDGET(user),
        state: watchState,
        seller: `${user?.firstName} ${user?.lastName}`,
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
          <Popup size="tiny" trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(0, 2)}</span>} position="top center" on="hover" content={product.brandName} />
          {'-'}
          <Popup size="tiny" trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(3, 5)}</span>} position="top center" on="hover" content={product.supplierName} />
          {'-'}
          <span>{formatProductCodePopup(product.code).formattedCode.substring(6)}</span>
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
          disabled={product.state === PRODUCT_STATES.OOS.id}
        />
      ),
      width: 1
    },
    {
      id: 3,
      title: "Nombre",
      value: (product) => (
        <Container>
          {product.name}
          <Flex marginLeft="3px" marginRight="3px" columnGap="3px">
            {product.comments && <CommentTooltip comment={product.comments} />}
            {(!!product.dispatchComment || !!product?.dispatch?.comment) && (
              <Popup size="mini" content={product.dispatchComment || product?.dispatch?.comment} position="top center" trigger={<Icon name={ICONS.TRUCK} color={COLORS.ORANGE} />} />
            )}
            {product.state === PRODUCT_STATES.OOS.id && <Label color={COLORS.ORANGE} size="tiny">Sin Stock</Label>}
          </Flex>
        </Container>
      ),
      width: 6,
      wrap: true,
      align: 'left'
    },
    {
      id: 4,
      title: "Medida", value: (product, index) => (
        <>
          {product.fractionConfig?.active && (
            <NumberControlled
              width="100px"
              name={`products[${index}].fractionConfig.value`}
              unit={product.fractionConfig.unit}
              iconPosition="right"
              onChange={value => {
                setValue(`products[${index}].fractionConfig.price`, value * product.price);
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
              onChange={() => {
                calculateTotal();
              }}
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
        <Flex alignItems="center" columnGap="5px">
          <PercentControlled
            width="80px"
            height="35px"
            name={`products[${index}].discount`}
            defaultValue={product.discount ?? 0}
            handleChange={calculateTotal}
          />
        </Flex>
      ),
      width: 1
    },
    { title: "Total", value: (product) => <PriceLabel value={getTotal(product)} />, id: 7, width: 3 },
  ], [calculateTotal, setValue]);

  const handleDraft = async (data) => {
    setValue("state", BUDGET_STATES.DRAFT.id);
    await handleCreate({ ...data, total: Number(total.toFixed(2)) }, BUDGET_STATES.DRAFT.id);
  };

  const handleConfirm = async (data) => {
    if (isCustomerInactive) {
      setError('customer', { type: 'manual', message: `No es posible confirmar ni dejar pendientes presupuestos con clientes inactivos, solo borradores.` });
      return;
    }

    setValue('state', isConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id);
    await handleCreate({ ...data, total: Number(total.toFixed(2)) }, isConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id);
  };

  useKeyboardShortcuts(() => handleSubmit(handleDraft)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleSubmit(handleConfirm)(), SHORTKEYS.ALT_ENTER);
  useKeyboardShortcuts(() => handleReset(), SHORTKEYS.DELETE);

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
          <FieldsContainer justifyContent="space-between">
            <FormField width="300px">
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
            <FormField width="350px">
              <Controller
                name="pickUpInStore"
                render={({ field: { onChange, value } }) => (
                  <ButtonGroup size="small">
                    <IconedButton
                      text={PICK_UP_IN_STORE}
                      icon={ICONS.WAREHOUSE}
                      basic={!value}
                      onClick={() => {
                        onChange(true);
                      }}
                    />
                    <IconedButton
                      text="Enviar a Dirección"
                      icon={ICONS.TRUCK}
                      basic={value}
                      onClick={() => {
                        onChange(false);
                      }}
                    />
                  </ButtonGroup>
                )}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer justifyContent="space-between">
            <Controller
              name="seller"
              rules={RULES.REQUIRED}
              render={({ field: { value } }) => (
                <FormField width="300px" label="Vendedor" control={Input} readonly value={value} />
              )}
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
                width="200px"
                label="Fecha de vencimiento"
                control={Input}
                readOnly
                value={formatedDateOnly(expirationDate(expiration ?? 0))}
              />
            </FieldsContainer>
          </FieldsContainer>
          <FieldsContainer>
            <Controller
              name="customer"
              rules={{ validate: value => value?.id ? true : "Campo requerido." }}
              render={({ field: { onChange, value } }) => (
                <FormField
                  width="300px"
                  label="Cliente"
                  required
                  control={Dropdown}
                  error={errors?.customer ? { content: errors.customer.message, pointing: 'above' } : null}
                  placeholder={PAGES.CUSTOMERS.NAME}
                  search
                  clearable
                  selection
                  minCharacters={2}
                  noResultsMessage="No se han encontrado resultados!"
                  options={customerOptions}
                  value={value?.id || null}
                  onChange={(e, { value }) => {
                    clearErrors(["customer"]);
                    if (!value) {
                      onChange(null);
                      return;
                    };
                    const customer = customers.find(opt => opt.id === value);
                    onChange(customer);
                  }}
                />
              )}
            />
            <FormField
              flex="2"
              control={Dropdown}
              label="Dirección"
              required={isBudgetConfirmed(watchState) && !watchPickUp}
              error={errors?.customer?.addresses ? { content: errors.customer.addresses.message, pointing: 'above' } : null}
              value={watchPickUp ? PICK_UP_IN_STORE : !draft || !watchCustomer?.addresses?.length || watchCustomer.addresses.length === 1 ? `${watchCustomer?.addresses?.[0]?.ref ? `${watchCustomer?.addresses?.[0]?.ref}: ` : ''}${watchCustomer?.addresses?.[0]?.address ? watchCustomer?.addresses?.[0]?.address : ""}` : selectedContact.address}
              selection
              options={watchCustomer?.addresses.map((address) => ({
                key: address.address,
                text: `${address.ref ? `${address.ref}: ` : ''}${address.address}`,
                value: address.address,
              }))}
              onChange={(e, { value }) => setSelectedContact({
                ...selectedContact,
                address: value,
              })}
              disabled={watchPickUp || !watchCustomer || watchCustomer.addresses?.length < 2}
            />
            <FormField
              flex="1"
              control={Dropdown}
              label="Teléfono"
              required={isBudgetConfirmed(watchState)}
              error={shouldError && errors?.customer?.phoneNumbers ? { content: errors.customer.phoneNumbers.message, pointing: 'above' } : null}
              value={!draft || !watchCustomer?.phoneNumbers?.length || watchCustomer?.phoneNumbers.length === 1 ? `${watchCustomer?.phoneNumbers?.[0]?.ref ? `${watchCustomer?.phoneNumbers?.[0]?.ref}: ` : ''}${formatedSimplePhone(watchCustomer?.phoneNumbers?.[0])}` : selectedContact.phone}
              selection
              options={watchCustomer?.phoneNumbers.map((phone) => ({
                key: formatedSimplePhone(phone),
                text: `${phone.ref ? `${phone.ref}: ` : ''}${formatedSimplePhone(phone)}`,
                value: formatedSimplePhone(phone),
              }))}
              onChange={(e, { value }) => setSelectedContact({
                ...selectedContact,
                phone: value,
              })}
              disabled={!watchCustomer || watchCustomer.phoneNumbers?.length < 2}
            />
          </FieldsContainer>
          <Controller name="products"
            rules={{ validate: value => value?.length || 'Al menos 1 producto es requerido.' }}
            render={() => (
              <FormField
                width="300px"
                label="Productos"
                required
                error={errors?.products?.root ? { content: errors.products.root.message, pointing: 'above' } : null}
                control={ProductSearch}
                ref={productSearchRef}
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
            <FieldsContainer width="100%" rowGap="15px">
              <Payments
                total={total}
                update
              />
            </FieldsContainer>
          )}
          <FieldsContainer width="100%" rowGap="15px">
            <Controller
              name="paymentMethods"
              rules={RULES.REQUIRED}
              render={({ field: { onChange, value } }) => (
                <FormField flex="1" label="Metodos de pago" control={Input}>
                  <Flex columnGap="5px" wrap="wrap" rowGap="5px">
                    <Button
                      paddingLeft="fit-content"
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
                        paddingLeft="fit-content"
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
                icon
                labelPosition="left"
                disabled={isLoading || !isDirty}
                loading={isLoading && isBudgetDraft(watchState)}
                type="button"
                onClick={handleSubmit(handleDraft)}
                color={BUDGET_STATES.DRAFT.color}
                width="fit-content"
              >
                <Icon name={BUDGET_STATES.DRAFT.icon} />{BUDGET_STATES.DRAFT.singularTitle}
              </IconedButton>
            }
          />
        </Form>
      </FormProvider>
    </>
  );
};

export default BudgetForm;
