import { PAYMENT_METHODS } from "@/components/budgets/budgets.common";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Button, Checkbox, CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, Price, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { Table } from "@/components/common/table";
import { NoPrint, OnlyPrint } from "@/components/layout";
import { BUDGET_STATES, PAGES, RULES } from "@/constants";
import { actualDate, expirationDate, formatProductCodePopup, formatedDateOnly, formatedPrice, formatedSimplePhone, getTotal, getTotalSum, removeDecimal } from "@/utils";
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
  customer: {
    name: '',
    addresses: [],
    phoneNumbers: []
  },
  products: [],
  comments: '',
  confirmed: false,
  globalDiscount: 0,
  paymentMethods: PAYMENT_METHODS.map((method) => method.value),
  expirationOffsetDays: ''
});

const BudgetForm = ({ onSubmit, products, customers, budget, user, isLoading, isCloning, printPdfMode, draft }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isModalCommentOpen, setIsModalCommentOpen] = useState(false);
  const [outdatedProducts, setOutdatedProducts] = useState([]);
  const [removedProducts, setRemovedProducts] = useState([]);
  const [expiration, SetExpiration] = useState(false);
  const { control, handleSubmit, setValue, getValues, watch, reset, formState: { isDirty, errors, isSubmitted } } = useForm({
    defaultValues: budget ? {
      ...budget,
      confirmed: isCloning ? false : budget?.confirmed,
      seller: `${user?.firstName} ${user?.lastName}`,
      customer: draft ? budget.customer : null,
    } : EMPTY_BUDGET(user),
  });
  const [watchProducts, watchGlobalDiscount, watchConfirmed, watchCustomer] = watch(['products', 'globalDiscount', 'confirmed', 'customer', 'state']);
  const [total, setTotal] = useState(0);
  const productSearchRef = useRef(null);
  const [loadingState, setLoadingState] = useState(null);

  const resetLoadingState = () => {
    setLoadingState(null);
  };

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [budget, isCloning, products]);

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
    if (draft && budget && budget.customer) {
      setValue('customer', budget.customer);
    }
  }, [draft, budget, setValue]);

  useEffect(() => {
    calculateTotal();
  }, [watchProducts, calculateTotal]);

  const handleCreate = async (data, state) => {
    if (!watchProducts.length) return;

    const { seller, products, customer, confirmed, globalDiscount, expirationOffsetDays, paymentMethods, comments } = data;

    const formData = {
      seller,
      products,
      customer,
      confirmed,
      globalDiscount,
      expirationOffsetDays,
      paymentMethods,
      comments,
      state
    };
    
    await onSubmit(formData);
  };

  const handleDraft = async () => {
    setValue('state', BUDGET_STATES.DRAFT.id);
    setLoadingState(BUDGET_STATES.DRAFT.id);
    const data = getValues();
    await handleCreate(data, BUDGET_STATES.DRAFT.id);
    resetLoadingState();
  };

  const handlePending = async (data) => {
    setValue('state', BUDGET_STATES.PENDING.id);
    setLoadingState(BUDGET_STATES.PENDING.id);
    await handleCreate(data, BUDGET_STATES.PENDING.id);
    resetLoadingState();
  };

  const handleReset = useCallback(() => {
    reset(EMPTY_BUDGET(user));
    setValue('customer', null);
    if (productSearchRef.current) {
      productSearchRef.current.clear();
    }
  }, [reset, user, productSearchRef]);

  const handleOpenCommentModal = useCallback((product, index) => {
    setSelectedProduct({ ...product });
    setIsModalCommentOpen(true);
  }, []);

  const handleModalCommentClose = () => {
    setIsModalCommentOpen(false);
  };

  const handleUpdateModalClose = () => {
    setIsUpdateModalOpen(false);
  };

  const actions = [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (element, index) => {
        deleteProduct(index);
      },
      tooltip: 'Eliminar'
    }, {
      id: 2,
      icon: 'add',
      color: 'green',
      onClick: (element, index) => {
        handleOpenCommentModal(element, index);
      },
      tooltip: 'Comentario para remito'
    },
  ];

  const onAddComment = async (data) => {
    const { comment, name, quantity } = data;
    const newProducts = [...watchProducts];
    const product = newProducts.find(p => p.code === selectedProduct.code);
    product.dispatch = {
      ...(comment && { comment }),
      ...(name && { name }),
      ...(quantity && { quantity })
    };
    setValue("products", newProducts);
    setIsModalCommentOpen(false)
  };

  const BUDGET_FORM_PRODUCT_COLUMNS = useMemo(() => {
    return [
      {
        title: "Código",
        value: (product) => (
          <>
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(0, 2)}</span>}
              position="top center"
              on="hover"
              content={product.brandName}
            />
            {'-'}
            <Popup
              size="tiny"
              trigger={<span>{formatProductCodePopup(product.code).formattedCode.substring(3, 5)}</span>}
              position="top center"
              on="hover"
              content={product.supplierName}
            />
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
                <Popup
                  size="mini"
                  content={product.comments}
                  position="top center"
                  trigger={
                    <Box>
                      <Icon name="info circle" color="yellow" />
                    </Box>
                  }
                />
              )}
              {(product.dispatch?.comment || product.dispatch?.name || product.dispatch?.quantity) && (
                <Popup
                  size="mini"
                  content={
                    <List>
                      {product.dispatch?.name && <ListItem>Nombre Remito: <b>{product.dispatch.name}</b></ListItem>}
                      {product.dispatch?.comment && <ListItem>Comentario Remito: <b>{product.dispatch.comment}</b></ListItem>}
                      {product.dispatch?.quantity && <ListItem>Cantidad Remito: <b>{product.dispatch.quantity}</b></ListItem>}
                    </List>
                  }
                  position="top center"
                  trigger={
                    <Box>
                      <Icon name="truck" color="orange" />
                    </Box>
                  }
                />
              )}
            </Flex>
          </Container>
        ),
        id: 2,
        width: 7,
        wrap: true,
        align: 'left'
      },
      {
        title: "Precio",
        value: (product) => <Price value={product.price} />,
        id: 3,
        width: 2,
      },
      {
        title: "Cantidad", value: (product, index) => (
          <Controller
            name={`products[${index}].quantity`}
            control={control}
            rules={RULES.REQUIRED}
            render={({ field: { onChange, ...rest } }) => (
              <CurrencyFormatInput
                {...rest}
                height="35px"
                shadow
                thousandSeparator={true}
                decimalScale={2}
                displayType="input"
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value < 0) {
                    onChange(Math.abs(value));
                    return;
                  }
                  onChange(value);
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
          <Controller
            name={`products[${index}].discount`}
            control={control}
            defaultValue={product.discount || 0}
            render={({ field: { onChange, ...rest } }) => (
              <Input
                {...rest}
                height="35px"
                center
                fluid
                type="number"
                onFocus={(e) => e.target.select()}
                onChange={(e) => {
                  let value = removeDecimal(e.target.value);
                  if (value > 100) return;
                  if (value < 0) {
                    onChange(Math.abs(value));
                    return;
                  }
                  onChange(value);
                  calculateTotal();
                }}
              />
            )}
          />
        ),
        id: 5,
        width: 1
      },
      {
        title: "Total",
        value: (product) => <Price value={getTotal(product)} />,
        id: 6,
        width: 3
      },
    ];
  }, [control, calculateTotal]);

  return (
    <>
      <NoPrint>
        <ModalComment
          onAddComment={onAddComment}
          isModalOpen={isModalCommentOpen}
          onClose={handleModalCommentClose}
          product={selectedProduct}
        />
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
              <Controller
                name="confirmed"
                control={control}
                render={({ field: { value, onChange, ...rest } }) => (
                  <Checkbox
                    {...rest}
                    toggle
                    checked={value}
                    onChange={() => {
                      onChange(!value);
                    }}
                    label={value ? "Confirmado" : "Confirmar presupuesto"}
                    customColors={{
                      false: 'orange',
                      true: 'green'
                    }}
                  />
                )}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <Label>Vendedor</Label>
              <Controller
                name="seller"
                control={control}
                rules={{ required: 'Campo requerido' }}
                render={({ field: { value } }) => <Segment>{value}</Segment>}
              />
            </FormField>
          </FieldsContainer>
          <FieldsContainer>
            <FormField width="300px">
              <RuledLabel title="Cliente" message={errors?.customer?.name?.message} required />
              <Controller
                name="customer"
                control={control}
                rules={RULES.REQUIRED}
                render={({ field }) => (
                  <Dropdown
                    placeholder={PAGES.CUSTOMERS.NAME}
                    search
                    selection
                    minCharacters={2}
                    noResultsMessage="No se ha encontrado cliente!"
                    options={customers?.map(customer => ({ key: customer.id, value: customer.id, text: customer.name }))}
                    value={draft ? budget?.customer?.id : field.value?.id || ''}
                    onChange={(e, { value }) => {
                      const customer = customers.find((opt) => opt.id === value);
                      field.onChange(customer);
                      setValue('customer', customer);
                    }}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Dirección" message={watchConfirmed && errors?.customer?.addresses[0].message} required={watchConfirmed} />
              <Controller
                name="customer.addresses[0]"
                control={control}
                rules={watchConfirmed && RULES.REQUIRED}
                render={({ field: { value } }) => <Segment>{watchCustomer?.addresses[0]?.address}</Segment>}
              />
            </FormField>
            <FormField width="200px">
              <RuledLabel title="Teléfono" message={errors?.customer?.phoneNumbers[0]?.message} required={watchConfirmed} />
              <Controller
                name="customer.phoneNumbers[0]"
                control={control}
                rules={watchConfirmed && RULES.REQUIRED}
                render={({ field: { value } }) => <Segment>{formatedSimplePhone(watchCustomer?.phoneNumbers[0])}</Segment>}
              />
            </FormField>
          </FieldsContainer>
          <FormField width="300px">
            <RuledLabel title="Agregar producto" message={!watchProducts?.length && isSubmitted && isDirty && 'Al menos 1 producto es requerido'} required />
            <ProductSearch
              ref={productSearchRef}
              products={products}
              onProductSelect={(selectedProduct) => {
                setValue("products", [...watchProducts, { ...selectedProduct, quantity: 1, discount: 0, key: Date.now().toString(36) + selectedProduct.code }]);
              }}
            />
          </FormField>
          <Table
            mainKey="key"
            headers={BUDGET_FORM_PRODUCT_COLUMNS}
            elements={watchProducts}
            actions={actions}
            total={total}
            globalDiscount={watchGlobalDiscount || 0}
            setGlobalDiscount={(value) => setValue('globalDiscount', value)}
            showTotal={!!watchProducts.length}
          />
          <FieldsContainer>
            <Label>Comentarios</Label>
            <ControlledComments control={control} />
          </FieldsContainer>
          <FieldsContainer>
            <FormField flex={3}>
              <Label>Metodos de pago</Label>
              <Controller
                name={`paymentMethods`}
                control={control}
                rules={{ required: true }}
                defaultValue={PAYMENT_METHODS.map((method) => method.value)}
                render={({ field }) => (
                  <Dropdown
                    minHeight="50px"
                    min
                    height="fit-content"
                    name={`paymentMethods`}
                    placeholder='Metodos de pago'
                    multiple
                    selection
                    fluid
                    minCharacters={2}
                    noResultsMessage="No se ha encontrado metodo!"
                    options={PAYMENT_METHODS}
                    value={field.value}
                    onChange={(e, { value }) => {
                      field.onChange(value);
                    }}
                  />
                )}
              />
            </FormField>
            <FormField flex={1}>
              <RuledLabel title="Días para el vencimiento" message={errors?.expirationOffsetDays?.message} required />
              <Controller
                name="expirationOffsetDays"
                control={control}
                rules={{
                  ...RULES.REQUIRED_THREE_NUMBERS,
                  validate: value => value <= 365 || 'El valor debe ser menor o igual a 365'
                }}
                render={({ field }) => (
                  <Input
                    {...field}
                    maxLength={3}
                    type="text"
                    placeholder="Cant. en días (p. ej: 3, 10, etc)"
                    onChange={(e) => {
                      let value = e.target.value;
                      value = value.replace(/\D/g, '');
                      if (parseInt(value, 10) > 365) {
                        value = '365';
                      };
                      field.onChange(value);
                      SetExpiration(value);
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
            isLoading={loadingState === BUDGET_STATES.PENDING.id}
            disabled={isLoading}
            isDirty={isDirty}
            onReset={handleReset}
            color={watchConfirmed ? BUDGET_STATES.CONFIRMED.color : BUDGET_STATES.PENDING.color}
            onSubmit={handleSubmit(handlePending)}
            icon={watchConfirmed ? BUDGET_STATES.CONFIRMED.icon : BUDGET_STATES.PENDING.icon}
            text={watchConfirmed ? BUDGET_STATES.CONFIRMED.title : BUDGET_STATES.PENDING.title}
            extraButton={
              <Button
                disabled={isLoading || !isDirty}
                loading={loadingState === BUDGET_STATES.DRAFT.id}
                type="button"
                onClick={handleDraft}
                color="teal">
                <Icon name="erase" />Borrador
              </Button>
            }
          />
        </Form >
      </NoPrint >
      <OnlyPrint>
        <PDFfile total={total} budget={budget} client={user.client?.metadata} printPdfMode={printPdfMode} />
      </OnlyPrint>
    </>
  );
};

export default BudgetForm;
