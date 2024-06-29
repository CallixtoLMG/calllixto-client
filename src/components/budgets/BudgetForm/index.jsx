import { PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Button, Checkbox, CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, Price, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import ProductSearch from "@/components/common/search/search";
import { Table } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { BUDGET_STATES, PAGES, RULES, SHORTKEYS, TIME_IN_DAYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { actualDate, expirationDate, formatProductCodePopup, formatedDateOnly, formatedPrice, formatedSimplePhone, getPrice, getTotal, getTotalSum, removeDecimal } from "@/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Flex } from "rebass";
import { GridColumn, Message, Modal, Popup, Transition } from "semantic-ui-react";
import PDFfile from "../PDFfile";
import ModalComment from "./ModalComment";
import { Container, Icon, MessageHeader, MessageItem, MessageList } from "./styles";
import { v4 as uuid } from 'uuid';

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: { name: '', addresses: [], phoneNumbers: [] },
  products: [], comments: '', confirmed: false, globalDiscount: 0,
  paymentMethods: PAYMENT_METHODS.map((method) => method.value),
  expirationOffsetDays: ''
});

const BudgetForm = ({ onSubmit, products, customers = [], budget, user, isLoading, isCloning, printPdfMode, draft }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [expiration, setExpiration] = useState(false);
  const { control, handleSubmit, setValue, getValues, watch, reset, trigger, setError, clearErrors, formState: { isDirty, errors } } = useForm({
    defaultValues: budget ? {
      ...budget,
      confirmed: isCloning ? false : budget?.confirmed,
      seller: `${user?.firstName} ${user?.lastName}`,
    } : EMPTY_BUDGET(user),
    mode: 'onSubmit',
    reValidateMode: 'onChange',
  });
  const [watchProducts, watchGlobalDiscount, watchConfirmed, watchCustomer, watchState] = watch(['products', 'globalDiscount', 'confirmed', 'customer', 'state']);
  const [total, setTotal] = useState(0);
  const productSearchRef = useRef(null);
  const customerOptions =
    customers.filter(customer => customer.id && customer.name)
      .map(customer => ({
        key: customer.id, value: customer.id, text: customer.name,
      }));
  useEffect(() => {
    if (isCloning) {
      let budgetProducts = [...budget.products];
      const outdatedProducts = products.filter(product => {
        const budgetProduct = budgetProducts.find(budgetProduct => budgetProduct.code === product.code);
        if (budgetProduct) {
          budgetProducts = budgetProducts.filter(budgetProduct => budgetProduct.code !== product.code);
          return budgetProduct.price !== product.price;
        }
        return false;
      });
      if (outdatedProducts.length || budgetProducts.length) {
        let newProducts = [...watchProducts];
        newProducts = newProducts.filter(product => !budgetProducts.some(budgetProduct => budgetProduct.code === product.code));
        newProducts = newProducts.map(product => {
          const outdatedProduct = outdatedProducts.find(outdatedProduct => outdatedProduct.code === product.code);
          if (outdatedProduct) {
            return { ...product, price: outdatedProduct.price };
          }
          return product;
        });
        setValue('products', newProducts);
        setOutdatedProducts(outdatedProducts);
        setRemovedProducts(budgetProducts);
        setIsUpdateModalOpen(true);
      }
    }
  }, [budget, isCloning, products, watchProducts, setValue]);

  const calculateTotal = useCallback(() => {
    const totalSum = getTotalSum(watchProducts, watchGlobalDiscount);
    setTotal(totalSum);
  }, [watchProducts, watchGlobalDiscount]);

  const deleteProduct = useCallback((index) => {
    const newProducts = [...watchProducts];
    newProducts.splice(index, 1);
    setValue("products", newProducts);
  }, [watchProducts, setValue]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const handleCreate = async (data, state) => {
    setValue('state', state);
    const isvalid = validateCustomer();
    if (isvalid) {
      const { seller, products, customer, confirmed, globalDiscount, expirationOffsetDays, paymentMethods, comments } = data;
      const formData = {
        seller, products, customer: { id: customer.id, name: customer.name }, confirmed, globalDiscount,
        expirationOffsetDays, paymentMethods, comments, state
      };
      await onSubmit(formData);
    };
  };

  const currentState = useMemo(() => {
    if (watchConfirmed) {
      return BUDGET_STATES.CONFIRMED;
    }
    return BUDGET_STATES.PENDING;
  }, [watchConfirmed]);

  const validateCustomer = () => {
    const customer = getValues("customer");
    if (watchConfirmed && (!customer.addresses.length || !customer.phoneNumbers.length)) {
      if (!customer.addresses.length) {
        setError('customer.addresses', { type: 'manual', message: 'Campo requerido para confirmar un presupuesto.' });
      };
      if (!customer.phoneNumbers.length) {
        setError('customer.phoneNumbers', { type: 'manual', message: 'Campo requerido para confirmar un presupuesto.' });
      };
      return false;
    }
    clearErrors('customer');
    return true;
  };

  const handleReset = useCallback(() => {
    reset(EMPTY_BUDGET(user));
    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [reset, user]);

  const handleOpenCommentModal = useCallback((product, index) => {
    setSelectedProduct(() => ({ ...product, index }));
    setIsModalCommentOpen(true);
  }, []);

  const handleModalCommentClose = () => setIsModalCommentOpen(false);

  const handleUpdateModalClose = () => setIsUpdateModalOpen(false);

  const actions = [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (element, index) => deleteProduct(index),
      tooltip: 'Eliminar'
    },
    {
      id: 2,
      icon: 'add',
      color: 'green',
      onClick: (element, index) => handleOpenCommentModal(element, index),
      tooltip: 'Comentario para remito'
    },
  ];

  const onAddComment = async ({ index, dispatchComment }) => {
    const newProducts = [...watchProducts];
    const product = newProducts[index];
    product.dispatchComment = dispatchComment;
    setValue("products", newProducts);
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
      title: "Cantidad", value: (product, index) => (
        <Controller name={`products[${index}].quantity`} control={control} rules={RULES.REQUIRED}
          render={({ field: { onChange, ...rest } }) => (
            <CurrencyFormatInput {...rest} height="35px" shadow thousandSeparator={true} decimalScale={2} displayType="input"
              onFocus={(e) => e.target.select()} onChange={(e) => {
                const value = Math.abs(e.target.value);
                onChange(value);
                calculateTotal();
              }}
            />
          )}
        />
      ),
      width: 2
    },
    {
      id: 3,
      title: "Nombre",
      value: (product) => (
        <Container>
          {product.name}
          <Flex ml="7px">
            {product.comments && (
              <Popup size="mini" content={product.comments} position="top center" trigger={<Box><Icon name="info circle" color="yellow" /></Box>} />
            )}
            {product.dispatchComment && (
              <Popup size="mini" content={product.dispatchComment} position="top center" trigger={<Box><Icon name="truck" color="orange" /></Box>} />
            )}
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
          {product.fractionConfig?.active ? (
            <Flex alignItems="center">
              <Controller name={`products[${index}].fractionConfig.value`} control={control}
                render={({ field: { onChange, ...rest } }) => (
                  <CurrencyFormatInput
                    {...rest}
                    height="35px"
                    shadow
                    decimalScale={2}
                    displayType="number"
                    onFocus={(e) => e.target.select()} onChange={(e) => {
                      const value = Math.abs(e.target.value);
                      onChange(value);
                      setValue(`products[${index}].fractionConfig.price`, value * product.price);
                      calculateTotal();
                    }}
                  />
                )}
              />
              <Box mx="5px">{` ${product.fractionConfig.unit}`}</Box>
            </Flex>
          ) : (
            ''
          )}
        </>
      ),
      width: 2
    },
    {
      id: 5,
      title: "Precio",
      value: (product, index) => {
        return product.editablePrice ?
          <Controller
            name={`products[${index}].price`}
            control={control}
            render={({ field: { onChange, value } }) => (
              <Flex alignItems="center" style={{ gridColumnGap: '5px' }}>$
                <CurrencyFormatInput
                  height="35px"
                  displayType="input"
                  thousandSeparator={true}
                  decimalScale={2}
                  allowNegative={false}
                  customInput={Input}
                  onValueChange={value => {
                    onChange(value.floatValue);
                    calculateTotal();
                  }}
                  value={value || 0}
                  placeholder="Precio"
                />
              </Flex>
            )}
          /> : <Price value={getPrice(product)} />
      },
      width: 2
    },
    {
      id: 6,
      title: "Descuento",
      value: (product, index) => (
        <Flex alignItems="center" style={{ gridColumnGap: '5px' }}>
          <Controller name={`products[${index}].discount`} control={control} defaultValue={product.discount || 0}
            render={({ field: { onChange, ...rest } }) => (
              <Input
                {...rest}
                height="35px"
                type="number"
                onFocus={(e) => e.target.select()} onChange={(e) => {
                  const value = Math.abs(removeDecimal(e.target.value));
                  if (value > 100) return;
                  onChange(value);
                  calculateTotal();
                }} />
            )}
          /> %
        </Flex>
      ),
      width: 1
    },
    { title: "Total", value: (product) => <Price value={getTotal(product)} />, id: 6, width: 3 },
  ], [control, calculateTotal, setValue]);

  const handleDraft = async (data) => {
    await handleCreate(data, BUDGET_STATES.DRAFT.id);
  };

  const handleConfirm = async (data) => {
    await handleCreate(data, watchConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id);
  };

  useKeyboardShortcuts(() => handleSubmit(handleDraft)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleSubmit(handleConfirm)(), SHORTKEYS.ALT_ENTER);
  useKeyboardShortcuts(() => handleReset(), SHORTKEYS.DELETE);

  return (
    <>
      <NoPrint>
        <ModalComment onAddComment={onAddComment} isModalOpen={isModalCommentOpen} onClose={handleModalCommentClose} product={selectedProduct} />
        <Transition visible={isUpdateModalOpen} animation='scale' duration={500}>
          <Modal closeOnDimmerClick={false} open={isUpdateModalOpen} onClose={handleUpdateModalClose} size="large">
            <Modal.Header>Se actualizó el presupuesto ya que algunos productos sufrieron modificaciones</Modal.Header>
            <Modal.Content>
              {!!outdatedProducts.length && (
                <Message>
                  <MessageHeader>Productos con precio actualizado</MessageHeader>
                  <MessageList>
                    {outdatedProducts.map(p => {
                      const oldPrice = budget.products.find(op => op.code === p.code);
                      return (
                        <MessageItem key={p.code}>
                          {`${p.code} | ${p.name} | `}
                          <span style={{ color: 'red' }}>{formatedPrice(oldPrice.price)}</span>
                          {' -> '}
                          <span style={{ color: 'green' }}>{`${formatedPrice(p.price)}.`}</span>
                        </MessageItem>
                      );
                    })}
                  </MessageList>
                </Message>
              )}
              {!!removedProducts.length && (
                <Message>
                  <MessageHeader>Productos no disponibles</MessageHeader>
                  <MessageList>
                    {removedProducts.map(p => (
                      <MessageItem key={p.code}>{`${p.code} | ${p.name} | ${formatedPrice(p.price)}.`}</MessageItem>
                    ))}
                  </MessageList>
                </Message>
              )}
            </Modal.Content>
            <Modal.Actions>
              <Button color="green" onClick={handleUpdateModalClose}>Okey!</Button>
            </Modal.Actions>
          </Modal>
        </Transition>
        <Form onSubmit={handleSubmit((data) => handleCreate(data, watchConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id))}>
          <FieldsContainer>
            <FormField width="300px">
              <Controller name="confirmed" control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox {...rest} toggle checked={value} onChange={() => onChange(!value)}
                    label={value ? "Confirmado" : "Confirmar presupuesto"}
                    customColors={{ false: 'orange', true: 'green' }}
                  />
                )}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <Label>Vendedor</Label>
              <Controller name="seller" control={control} rules={RULES.REQUIRED}
                render={({ field: { value } }) => <Segment>{value}</Segment>}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <RuledLabel title="Cliente" message={errors?.customer?.message} required />
              <Controller
                name="customer"
                control={control}
                rules={{ validate: value => value?.id ? true : "Campo requerido." }}
                render={({ field: { onChange, value } }) => (
                  <Dropdown
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
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Dirección" message={watchConfirmed && errors?.customer?.addresses?.message} required={watchConfirmed} />
              <Segment placeholder>{watchCustomer?.addresses[0]?.address}</Segment>
            </FormField>
            <FormField width="200px">
              <RuledLabel title="Teléfono" message={watchConfirmed && errors?.customer?.phoneNumbers?.message} required={watchConfirmed} />
              <Segment placeholder>{formatedSimplePhone(watchCustomer?.phoneNumbers[0])}</Segment>
            </FormField>
          </FieldsContainer>
          <FormField width="300px">
            <RuledLabel title="Agregar producto" message={errors?.products?.message} required />
            <Controller name="products"
              control={control}
              rules={{ validate: value => value?.length || 'Al menos 1 producto es requerido.' }}
              render={({ field: { onChange, value } }) => (
                <ProductSearch
                  ref={productSearchRef}
                  products={products}
                  onProductSelect={(selectedProduct) => {
                    onChange([...watchProducts, {
                      ...selectedProduct,
                      quantity: 1,
                      discount: 0,
                      key: uuid(),
                      ...(selectedProduct.fractionConfig?.active && {
                        fractionConfig: {
                          ...selectedProduct.fractionConfig,
                          value: 1,
                          price: selectedProduct.price,
                        }
                      })
                    }]);
                  }} />
              )}
            />
          </FormField>
          <Table
            mainKey="key"
            headers={BUDGET_FORM_PRODUCT_COLUMNS} elements={watchProducts}
            actions={actions}
            total={total}
            globalDiscount={watchGlobalDiscount || 0}
            setGlobalDiscount={(value) => setValue('globalDiscount', value, { shouldDirty: true })}
            showTotal={!!watchProducts.length}
          />
          <FieldsContainer>
            <Label>Comentarios</Label>
            <ControlledComments control={control} />
          </FieldsContainer>
          <FieldsContainer>
            <FormField flex={3}>
              <Label>Métodos de pago</Label>
              <Controller
                name="paymentMethods"
                control={control}
                rules={RULES.REQUIRED}
                render={({ field: { onChange, ...rest } }) => (
                  <Dropdown
                    {...rest}
                    minHeight="50px"
                    height="fit-content"
                    placeholder='Métodos de pago'
                    multiple
                    selection
                    options={PAYMENT_METHODS}
                    defaultValue={PAYMENT_METHODS.map(({ value }) => value)}
                    onChange={(e, { value }) => onChange(value)}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Días para el vencimiento" message={errors?.expirationOffsetDays?.message} required />
              <Controller name="expirationOffsetDays" control={control}
                rules={RULES.REQUIRED}
                render={({ field }) => (
                  <Input {...field} maxLength={3} type="text" placeholder="Cant. en días (p. ej: 3, 10, etc)"
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value.replace(/\D/g, '');
                      if (parseInt(value, 10) > 365) value = TIME_IN_DAYS.YEAR;
                      field.onChange(value);
                      setExpiration(value);
                    }}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <Label>Fecha de vencimiento</Label>
              <Segment>{formatedDateOnly(expirationDate(actualDate.format(), expiration || 0))}</Segment>
            </FormField>
          </FieldsContainer>
          <SubmitAndRestore
            draft={draft}
            isLoading={isLoading && watchState !== BUDGET_STATES.DRAFT.id}
            disabled={isLoading}
            isDirty={isDirty}
            onReset={handleReset}
            color={currentState.color}
            onSubmit={handleSubmit((data) => handleCreate(data, watchConfirmed ? BUDGET_STATES.CONFIRMED.id : BUDGET_STATES.PENDING.id))}
            icon={currentState.icon} text={currentState.title}
            extraButton={
              <Button
                disabled={isLoading || !isDirty || watchConfirmed}
                loading={isLoading && watchState === BUDGET_STATES.DRAFT.id}
                type="button"
                onClick={handleSubmit((data) => handleCreate(data, BUDGET_STATES.DRAFT.id))}
                color={BUDGET_STATES.DRAFT.color}
              >
                <Icon name={BUDGET_STATES.DRAFT.icon} />{BUDGET_STATES.DRAFT.title}
              </Button>
            }
          />
        </Form>
      </NoPrint>
      <OnlyPrint>
        <PDFfile total={total} budget={budget} client={user.client?.metadata} printPdfMode={printPdfMode} />
      </OnlyPrint>
    </>
  );
};

export default BudgetForm;
