"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { CURRENCY, LOCALE, RULES } from "@/constants";
import { formatedPrice, preventSend } from "@/utils";
import { useCallback, useMemo, useRef, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, readonly, isLoading }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors, isSubmitted } } = useForm({ defaultValues: product });
  const supplierRef = useRef(null);
  const brandRef = useRef(null);
  const [supplierId, setSupplierId] = useState("");
  const [brandId, setBrandId] = useState("");
  const isUpdating = useMemo(() => !!product?.code, [product]);

  const handleReset = useCallback((product) => {
    supplierRef.current.clearValue();
    brandRef.current.clearValue();
    reset(product || EMPTY_PRODUCT);
  }, [reset]);

  const handleForm = async (data) => {
    data.code = `${supplierId}${brandId}${data.code}`;
    await onSubmit(data);
  };

  return (
    <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
      <FieldsContainer>
        <FormField width="30%">
          <RuledLabel title="Proveedor" message={isDirty && !supplierId && !isUpdating && isSubmitted && 'Campo requerido'} required />
          {!readonly && !isUpdating ? (
            <Dropdown
              required
              name="supplier"
              placeholder='Proveedores'
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={suppliers}
              clearable
              ref={supplierRef}
              onChange={(e, { value }) => {
                const selectedSupplier = suppliers.find((supplier) => supplier.name === value);
                setSupplierId(selectedSupplier?.id);
              }}
            />
          ) : (
            <Segment>{product?.supplierName}</Segment>
          )}
        </FormField>
        <FormField width="30%">
          <RuledLabel title="Marca" message={isDirty && isSubmitted && !isUpdating && !brandId && 'Campo requerido'} required />
          {!readonly && !isUpdating ? (
            <Dropdown
              required
              name="brand"
              placeholder='Marcas'
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={brands}
              clearable
              ref={brandRef}
              disabled={isUpdating}
              onChange={(e, { value }) => {
                const brandSelected = brands.find((brand) => brand.name === value)
                setBrandId(brandSelected?.id);
              }}
            />
          ) : (
            <Segment>{product?.brandName}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer >
        <FormField width="20%">
          <RuledLabel title="Código" message={errors?.code?.message} required />
          {!readonly && !isUpdating ? (
            <Controller
              name="code"
              control={control}
              rules={RULES.REQUIRED_FIVE_DIGIT}
              render={({ field }) => (
                <Input
                  {...field}
                  placeholder="Código"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isUpdating}
                  {...((supplierId || brandId) && { label: { basic: true, content: `${supplierId ?? ''} ${brandId ?? ''}` } })}
                  labelPosition='left'
                />
              )}
            />
          ) : (
            <Segment>{product?.code}</Segment>
          )}
        </FormField>
        <FormField flex="1" >
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          {!readonly ? (
            <Controller
              name="name"
              control={control}
              rules={RULES.REQUIRED}
              render={({ field }) => <Input height="50px" {...field} placeholder="Nombre" />}
            />
          ) : (
            <Segment>{product?.name}</Segment>
          )}
        </FormField>
        <FormField width="20%">
          <RuledLabel title="Precio" message={errors?.price?.message} required />
          {!readonly ? (
            <Controller
              name="price"
              control={control}
              rules={RULES.REQUIRED_PRICE}
              render={({ field }) => (
                <CurrencyInput
                  value={field.value}
                  locale={LOCALE}
                  currency={CURRENCY}
                  placeholder="Precio"
                  onChangeValue={(_, value) => {
                    field.onChange(value);
                  }}
                  InputElement={<Input height="50px" />}
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
