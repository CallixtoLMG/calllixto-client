"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Form, FormField, Input, Label, Segment, TextArea } from "@/components/common/custom";
import { PAGES, RULES } from "@/constants";
import { formatedPrice } from "@/utils";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplier: '', brand: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, readonly }) => {
  const { push } = useRouter();
  const { handleSubmit, control, reset, formState: { isDirty } } = useForm({ defaultValues: product });
  const [supplierId, setSupplierId] = useState("");
  const [brandId, setBrandId] = useState("");

  const isUpdating = useMemo(() => !!product?.code, [product]);
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = useCallback((product) => {
    reset(product || EMPTY_PRODUCT);
  }, [reset]);

  const handleForm = (data) => {
    data.code = `${supplierId}${brandId}${data.code}`;
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
            <Dropdown
              required
              name="supplier"
              placeholder='Proveedores'
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={suppliers}
              onChange={(e, { value }) => {
                const selectedSupplier = suppliers.find((supplier) => supplier.name === value);
                setSupplierId(selectedSupplier.id);
              }}
            />
          ) : (
            <Segment>{product?.supplier}</Segment>
          )}
        </FormField>
        <FormField>
          <Label>Marca</Label>
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
              disabled={isUpdating}
              onChange={(e, { value }) => {
                const brandSelected = brands.find((brand) => brand.name === value)
                setBrandId(brandSelected.id);
              }}
            />
          ) : (
            <Segment>{product?.brand}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width={3}>
          <Label >Código</Label>
          {!readonly && !isUpdating ? (
            <Controller
              name="code"
              control={control}
              rules={RULES.REQUIRED_THREE_DIGIT}
              render={({ field }) => (
                <Input
                  {...field}
                  maxLength={3}
                  placeholder="Código (A12)"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  disabled={isUpdating}
                  {...((supplierId || brandId) && { label: { basic: true, content: `${supplierId} ${brandId}` } })}
                  labelPosition='left'
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
