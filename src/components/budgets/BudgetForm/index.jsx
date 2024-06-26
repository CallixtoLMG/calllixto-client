import { PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { SubmitAndRestore } from "@/components/common/buttons";
import {
  Button, Checkbox, CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, Price, RuledLabel, Segment
} from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { Table } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { BUDGET_STATES, PAGES, RULES, TIME_IN_DAYS } from "@/constants";
import {
  actualDate, expirationDate, formatProductCodePopup, formatedDateOnly, formatedPrice, formatedSimplePhone, getTotal, getTotalSum, removeDecimal
} from "@/utils";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Box, Flex } from "rebass";
import { List, ListItem, Message, Modal, Popup, Transition } from "semantic-ui-react";
import ProductSearch from "../../common/search/search";
import PDFfile from "../PDFfile";
import ModalComment from "./ModalComment";
import { Container, Icon, MessageHeader, MessageItem, MessageList } from "./styles";

const EMPTY_BUDGET = (user) => ({
  seller: `${user?.firstName} ${user?.lastName}`,
  customer: { name: '', addresses: [], phoneNumbers: [] },
  products: [], comments: '', confirmed: false, globalDiscount: 0,
  paymentMethods: PAYMENT_METHODS.map((method) => method.value),
  expirationOffsetDays: ''
});

const BudgetForm = ({ onSubmit, products, customers = [], budget, user, isLoading, isCloning, printPdfMode, draft }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [expiration, setExpiration] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const { control, handleSubmit, setValue, getValues, watch, reset, trigger, setError, clearErrors, formState: { isDirty, errors, isSubmitted } } = useForm({
    defaultValues: budget ? {
      ...budget,
      confirmed: isCloning ? false : budget?.confirmed,
      seller: `${user?.firstName} ${user?.lastName}`,
      customer: draft ? budget.customer : null,
    } : EMPTY_BUDGET(user),
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const [watchProducts, watchGlobalDiscount, watchConfirmed, watchCustomer, watchState] = watch(['products', 'globalDiscount', 'confirmed', 'customer', 'state']);
  const [total, setTotal] = useState(0);
  const productSearchRef = useRef(null);
  const emptyCustomerOption = { id: '', name: 'Ninguno', addresses: [], phoneNumbers: [] };
  const customerOptions = [
    { key: emptyCustomerOption.id, value: emptyCustomerOption.id, text: emptyCustomerOption.name },
    ...customers
      .filter(customer => customer.id && customer.name) // Filtra clientes con ID y nombre válidos
      .map(customer => ({
        key: customer.id, value: customer.id, text: customer.name,
      }))
  ];

  const validateProducts = () => {
    const values = getValues();
    if (values.products.length === 0) {
      setError('products', { type: 'manual', message: 'Al menos 1 producto es requerido.' });
      return false;
    } else {
      clearErrors('products');
      return true;
    }
  };

  useEffect(() => {
    if (draft && budget && budget.customer) {
      const customer = customers.find(c => c.id === budget.customer.id);
      if (customer) {
        setValue('customer.id', customer.id);
        setValue('customer.name', customer.name);
        setValue('customer.addresses[0]', customer.addresses.length > 0 ? customer.addresses[0].address : '');
        setValue('customer.phoneNumbers[0]', customer.phoneNumbers.length > 0 ? customer.phoneNumbers[0].number : '');
        setSelectedCustomer(customer);
      }
    }
  }, [draft, budget, customers, setValue]);

  useEffect(() => {
    if (selectedCustomer) {
      setValue('customer.addresses[0]', selectedCustomer.addresses?.length > 0 ? selectedCustomer.addresses[0].address : '');
      setValue('customer.phoneNumbers[0]', selectedCustomer.phoneNumbers?.length > 0 ? selectedCustomer.phoneNumbers[0].number : '');
    } else {
      setValue('customer.addresses[0]', '');
      setValue('customer.phoneNumbers[0]', '');
    }
  }, [selectedCustomer, setValue]);

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
    if (draft && budget && budget.customer) {
      setValue('customer', budget.customer);
    }
  }, [draft, budget, setValue]);

  useEffect(() => {
    if (selectedCustomer) {
      setValue('customer.addresses[0]', selectedCustomer?.addresses[0]?.address ?? '');
      setValue('customer.phoneNumbers[0]', selectedCustomer?.phoneNumbers[0] ?? '');
    } else {
      setValue('customer.addresses[0]', '');
      setValue('customer.phoneNumbers[0]', '');
    }
  }, [selectedCustomer, setValue]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  useEffect(() => {
    if (draft && budget && budget.customer) {
      setSelectedCustomer(budget.customer.id);
    }
  }, [draft, budget]);

  useEffect(() => {
    if (!isDirty) {
      setSelectedCustomer(null);
    }
  }, [isDirty]);

  useEffect(() => {
    const subscription = watch((value) => {
      if (!value.customer) {
        setSelectedCustomer(null);
      }
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  const handleCreate = async (data, state) => {
    if (!watchProducts.length) return;

    const { seller, products, customer, confirmed, globalDiscount, expirationOffsetDays, paymentMethods, comments } = data;

    const formData = {
      seller, products, customer, confirmed, globalDiscount,
      expirationOffsetDays, paymentMethods, comments, state
    };

    await onSubmit(formData);
  };

  const currentState = useMemo(() => {
    if (watchConfirmed) {
      return BUDGET_STATES.CONFIRMED;
    }
    return BUDGET_STATES.PENDING;
  }, [watchConfirmed]);

  const handlePending = async (data) => {
    setHasSubmitted(true);
    setValue('state', BUDGET_STATES.PENDING.id);
    const isProductsValid = validateProducts();
    const isValid = await trigger();

    if (isValid && isProductsValid) {
      const values = getValues();
      await handleCreate(values, BUDGET_STATES.PENDING.id);
    }
  };

  const handleDraft = async () => {
    setIsDraft(true);
    setHasSubmitted(true);
    setValue('state', BUDGET_STATES.DRAFT.id);
    const isProductsValid = validateProducts();
    const isValid = await trigger();

    if (isValid && isProductsValid) {
      const values = getValues();
      await handleCreate(values, BUDGET_STATES.DRAFT.id);
    }

    setIsDraft(false);
  };

  const handleReset = useCallback(() => {
    reset(EMPTY_BUDGET(user));
    setValue('customer', null);
    setSelectedCustomer(null);
    setHasSubmitted(false)
    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [reset, user, setValue]);

  const handleOpenCommentModal = useCallback((product, index) => {
    setSelectedProduct({ ...product, index });
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
      onClick: (element) => handleOpenCommentModal(element),
      tooltip: 'Comentario para remito'
    },
  ];

  const onAddComment = async (data) => {
    const { index, dispatch: { comment, name, quantity } } = data;
    const newProducts = [...watchProducts];
    const product = newProducts[index];
    product.dispatch = {
      ...(comment && { comment }),
      ...(name && { name }),
      ...(quantity && { quantity })
    };
    setValue("products", newProducts);
    setIsModalCommentOpen(false);
  };

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => [
    {
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
      id: 1,
      width: 1,
      align: 'left'
    },
    {
      title: "Nombre",
      value: (product) => (
        <Container>
          {product.name}
          <Flex ml="7px">
            {product.comments && (
              <Popup size="mini" content={product.comments} position="top center" trigger={<Box><Icon name="info circle" color="yellow" /></Box>} />
            )}
            {(product.dispatch?.comment || product.dispatch?.name || product.dispatch?.quantity) && (
              <Popup size="mini" content={
                <List>
                  {product.dispatch?.name && <ListItem>Nombre Remito: <b>{product.dispatch.name}</b></ListItem>}
                  {product.dispatch?.comment && <ListItem>Comentario Remito: <b>{product.dispatch.comment}</b></ListItem>}
                  {product.dispatch?.quantity && <ListItem>Cantidad Remito: <b>{product.dispatch.quantity}</b></ListItem>}
                </List>
              } position="top center" trigger={<Box><Icon name="truck" color="orange" /></Box>} />
            )}
          </Flex>
        </Container>
      ),
      id: 2,
      width: 7,
      wrap: true,
      align: 'left'
    },
    { title: "Precio", value: (product) => <Price value={product.price} />, id: 3, width: 2 },
    {
      title: "Cantidad", value: (product, index) => (
        <Controller name={`products[${index}].quantity`} control={control} rules={RULES.REQUIRED}
          render={({ field: { onChange, ...rest } }) => (
            <CurrencyFormatInput {...rest} height="35px" shadow thousandSeparator={true} decimalScale={2} displayType="input"
              onFocus={(e) => e.target.select()} onChange={(e) => {
                const value = e.target.value;
                onChange(value < 0 ? Math.abs(value) : value);
                calculateTotal();
              }}
            />
          )}
        />
      ),
      id: 4,
      width: 2
    },
    {
      title: "Descuento",
      value: (product, index) => (
        <Controller name={`products[${index}].discount`} control={control} defaultValue={product.discount || 0}
          render={({ field: { onChange, ...rest } }) => (
            <Input {...rest} height="35px" center fluid type="number" onFocus={(e) => e.target.select()} onChange={(e) => {
              let value = removeDecimal(e.target.value);
              onChange(value < 0 ? Math.abs(value) : value <= 100 ? value : 100);
              calculateTotal();
            }} />
          )}
        />
      ),
      id: 5,
      width: 1
    },
    { title: "Total", value: (product) => <Price value={getTotal(product)} />, id: 6, width: 3 },
  ], [control, calculateTotal]);

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
        <Form onSubmit={handleSubmit(handlePending)}>
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
              <RuledLabel title="Cliente" message={errors?.customer?.name?.message} required />
              <Controller
                name="customer.name"
                control={control}
                rules={RULES.REQUIRED}
                render={({ field }) => (
                  <Dropdown
                    placeholder={PAGES.CUSTOMERS.NAME}
                    search
                    selection
                    minCharacters={2}
                    noResultsMessage="No se ha encontrado cliente!"
                    options={customerOptions}
                    value={selectedCustomer?.id || field.value || ''}
                    onChange={(e, { value }) => {
                      if (value === '') {
                        setValue('customer.id', emptyCustomerOption.id);
                        setValue('customer.name', emptyCustomerOption.name);
                        setValue('customer.addresses[0]', '');
                        setValue('customer.phoneNumbers[0]', '');
                        setSelectedCustomer(emptyCustomerOption);
                      } else {
                        field.onChange(value);
                        const customer = customers.find(opt => opt.id === value);
                        if (customer) {
                          setValue('customer.id', customer.id);
                          setValue('customer.name', customer.name);
                          setValue('customer.addresses[0]', customer.addresses.length > 0 ? customer.addresses[0].address : '');
                          setValue('customer.phoneNumbers[0]', customer.phoneNumbers.length > 0 ? customer.phoneNumbers[0].number : '');
                          setSelectedCustomer(customer);
                        }
                      }
                    }}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Dirección" message={watchConfirmed && errors?.customer?.addresses[0]?.message} required={watchConfirmed} />
              <Controller
                name="customer.addresses[0]"
                control={control}
                rules={watchConfirmed && RULES.REQUIRED}
                render={({ field: { value } }) => (
                  <Segment>{draft ? (selectedCustomer?.addresses?.length > 0 ? selectedCustomer.addresses[0].address : '') : value || ''}</Segment>
                )}
              />
            </FormField>
            <FormField width="200px">
              <RuledLabel title="Teléfono" message={watchConfirmed && errors?.customer?.phoneNumbers?.[0]?.message} required={watchConfirmed} />
              <Controller name="customer.phoneNumbers[0]" control={control} rules={watchConfirmed && RULES.REQUIRED}
                render={({ field: { value } }) => (
                  <Segment>{value ? formatedSimplePhone(value) : ''}</Segment>
                )}
              />
            </FormField>
          </FieldsContainer>
          <FormField width="300px">

            <RuledLabel title="Agregar producto" message={!watchProducts?.length && hasSubmitted && 'Al menos 1 producto es requerido.'} required />
            <Controller name="products" control={control} rules={{ validate: value => value && value.length > 0 }}
              render={({ field: { onChange, value } }) => (
                <ProductSearch ref={productSearchRef} products={products} onProductSelect={(selectedProduct) => {
                  onChange([...value, {
                    ...selectedProduct, quantity: 1, discount: 0, key: Date.now().toString(36) + selectedProduct.code
                  }]);
                }} />
              )}
            />
          </FormField>
          <Table mainKey="key" headers={BUDGET_FORM_PRODUCT_COLUMNS} elements={watchProducts}
            actions={actions} total={total} globalDiscount={watchGlobalDiscount || 0}
            setGlobalDiscount={(value) => setValue('globalDiscount', value)} showTotal={!!watchProducts.length}
          />
          <FieldsContainer>
            <Label>Comentarios</Label>
            <ControlledComments control={control} />
          </FieldsContainer>
          <FieldsContainer>
            <FormField flex={3}>
              <Label>Metodos de pago</Label>
              <Controller name={`paymentMethods`} control={control} rules={{ required: true }}
                defaultValue={PAYMENT_METHODS.map((method) => method.value)}
                render={({ field }) => (
                  <Dropdown
                    minHeight="50px"
                    height="fit-content"
                    name={`paymentMethods`}
                    placeholder='Metodos de pago'
                    multiple
                    selection
                    fluid
                    minCharacters={2}
                    noResultsMessage="No se ha encontrado metodo!" options={PAYMENT_METHODS}
                    value={field.value} onChange={(e, { value }) => field.onChange(value)}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Días para el vencimiento" message={errors?.expirationOffsetDays?.message} required={!isDraft} />
              <Controller name="expirationOffsetDays" control={control}
                rules={{
                  required: !isDraft && "Este campo es requerido",
                  validate: value => isDraft || value <= 365 || 'El valor debe ser menor o igual a 365'
                }}
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
          <SubmitAndRestore draft={draft} isLoading={isLoading && watchState !== BUDGET_STATES.DRAFT.id}
            disabled={isLoading} isDirty={isDirty} onReset={handleReset}
            color={currentState.color} onSubmit={handleSubmit(handlePending)}
            icon={currentState.icon} text={currentState.title}
            extraButton={
              <Button disabled={isLoading || !isDirty} loading={isLoading && watchState !== BUDGET_STATES.PENDING.id}
                type="button" onClick={handleDraft} color={BUDGET_STATES.DRAFT.color}>
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
