"use client";
import { PAGES, RULES } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { CodeInput } from "./styles";
import { Segment, Form, FieldsContainer, FormField, Input, Label, TextArea, Dropdown } from "@/components/common/custom";
import { SubmitAndRestore } from "@/components/common/buttons";
import { formatedPrice } from "@/utils";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, readonly }) => {
  const { push } = useRouter();
  const { handleSubmit, setValue, control, reset, formState: { isDirty } } = useForm({ defaultValues: product });

  const isUpdating = useMemo(() => !!product?.code, [product]);
  const [isLoading, setIsLoading] = useState(false);
  const [customField, setCustomField] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleReset = useCallback((product) => {
    reset(product || EMPTY_PRODUCT);
  }, [reset]);

  const handleSupplierChange = (e, { value }) => {
    setValue(`supplier`, value);
    const supplier = suppliers.find((opt) => opt.value === value);
    setSelectedSupplier(supplier);
    updateCustomField(supplier?.id, selectedBrand?.id);
  };

  const handleBrandChange = (e, { value }) => {
    setValue(`brand`, value);
    const brand = brands.find((opt) => opt.value === value);
    setSelectedBrand(brand);
    updateCustomField(selectedSupplier?.id, brand?.id);
  };

  const updateCustomField = (supplierValue, brandValue) => {
    let newCustomField = '';
    if (supplierValue) {
      newCustomField += supplierValue;
      if (brandValue) {
        newCustomField += '-';
      };
    };
    if (brandValue) {
      newCustomField += brandValue + "-";
    };
    setCustomField(newCustomField);
    setValue('customField', newCustomField);
  };

  const handleForm = (data) => {
    const formattedCode = `${customField.replace(/[-\s]/g, '')}${data.code}`;
    data.code = formattedCode;
    setIsLoading(true);
    onSubmit(data);
    setTimeout(() => {
      setIsLoading(false);
      push(PAGES.PRODUCTS.BASE);
    }, 2000);
  };

  const locale = "es-AR";
  const currency = "ARS";

  return (
    <Form onSubmit={handleSubmit(handleForm)}>
      <FieldsContainer>
        <FormField>
          <Label>Proveedor</Label>
          {!readonly && !isUpdating ? (
            <Controller
              name="supplier"
              control={control}
              render={({ field }) => (
                <Dropdown
                  required
                  name={`supplier`}
                  placeholder='Proveedores'
                  search
                  selection
                  minCharacters={2}
                  noResultsMessage="Sin resultados!"
                  options={suppliers}
                  onChange={(e, { value }) => {
                    field.onChange(value);
                    handleSupplierChange(e, { value });
                  }}
                />
              )}
            />
          ) : (
            <Segment>{product?.supplier}</Segment>
          )}
        </FormField>
        <FormField>
          <Label>Marca</Label>
          {!readonly && !isUpdating ? (
            <Controller
              name="brand"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => (
                <Dropdown
                  required
                  name={`brand`}
                  placeholder='Marcas'
                  search
                  selection
                  minCharacters={2}
                  noResultsMessage="Sin resultados!"
                  options={brands}
                  disabled={isUpdating}
                  onChange={(e, { value }) => {
                    field.onChange(value);
                    handleBrandChange(e, { value });
                  }}
                />
              )}
            />
          ) : (
            <Segment>{product?.brand}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      {customField && (
        <CodeInput
          value={customField}
          disabled
          onChange={(e) => {
            updateCustomField(selectedSupplier?.id, selectedBrand?.id);
          }}
        />
      )}
      <FieldsContainer>
        <FormField>
          <Label >Código</Label>
          {!readonly && !isUpdating ? (
            <Controller
              name="code"
              control={control}
              rules={RULES.REQUIRED_THREE_DIGIT}
              render={({ field }) => (
                <Input
                  {...field}
                  paddingLeft={customField}
                  maxLength={3}
                  placeholder="Código (A12)"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isUpdating}
                />
              )}
            />
          ) : (
            <Segment>{product?.code}</Segment>
          )}
        </FormField>
        <FormField>
          <Label >Código del proveedor</Label>
          {!readonly ? (
            <Controller
              name="supplierCode"
              control={control}
              render={({ field }) => (
                <Input  {...field} placeholder="Código proveedor" />
              )}
            />
          ) : (
            <Segment>{product?.supplierCode}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer >
        <FormField flex="1" >
          <Label>Nombre</Label>
          {!readonly ? (
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          ) : (
            <Segment>{product?.name}</Segment>
          )}
        </FormField>
        <FormField>
          <Label>Precio</Label>
          {!readonly ? (
            <Controller
              name="price"
              control={control}
              rules={RULES.REQUIRED_PRICE}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  locale={locale}
                  currency={currency}
                  placeholder="Precio"
                  onChangeValue={(_, value) => {
                    field.onChange(value);
                  }}
                  InputElement={<Input />}
                />
              )}
            />
          ) : (
            <Segment>{formatedPrice(product?.price)}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label >Comentarios</Label>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              maxLength="2000"
              placeholder="Comentarios"
              disabled={readonly}
              readonly
            />
          )}
        />
      </FieldsContainer>
      <SubmitAndRestore
        show={!readonly}
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : null)}
      />
    </Form>
  )
};

export default ProductForm;
