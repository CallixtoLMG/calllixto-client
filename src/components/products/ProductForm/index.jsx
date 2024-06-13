import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { PAGES, RULES } from "@/constants";
import { formatedPrice, preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, readonly, isLoading }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors, isSubmitted } } = useForm({ defaultValues: product });
  const [supplierId, setSupplierId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const isUpdating = useMemo(() => !!product?.code, [product]);

  const handleReset = useCallback((product) => {
    setSelectedSupplier(null);
    setSelectedBrand(null);
    setSupplierId("");
    setBrandId("");
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
              placeholder={PAGES.SUPPLIERS.NAME}
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={suppliers}
              clearable
              value={selectedSupplier}
              onChange={(e, { value }) => {
                const supplier = suppliers.find((supplier) => supplier.name === value);
                setSupplierId(supplier?.id || "");
                setSelectedSupplier(value);
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
              placeholder={PAGES.BRANDS.NAME}
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={brands}
              clearable
              value={selectedBrand}
              onChange={(e, { value }) => {
                const brand = brands.find((brand) => brand.name === value);
                setBrandId(brand?.id || "");
                setSelectedBrand(value);
              }}
            />
          ) : (
            <Segment>{product?.brandName}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="20%">
          <RuledLabel title="Código" message={errors?.code?.message} required />
          {!readonly && !isUpdating ? (
            <Controller
              name="code"
              control={control}
              rules={RULES.REQUIRED_MAX26_DIGIT_CODE}
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
        <FormField flex="1">
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
          <RuledLabel title="Precio" />
          {!readonly ? (
            <Controller
              name="price"
              control={control}
              render={({ field: { onChange, value } }) => (
                <CurrencyFormatInput
                  height="50px"
                  displayType="input"
                  thousandSeparator={true}
                  decimalScale={2}
                  allowNegative={false}
                  prefix="$ "
                  customInput={Input}
                  onValueChange={value => {
                    onChange(value.floatValue);
                  }}
                  value={value || 0}
                  placeholder="Precio"
                />
              )}
            />
          ) : (
            <Segment>{formatedPrice(product?.price)}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <TextArea
              {...field}
              maxLength="2000"
              placeholder="Comentarios"
              disabled={readonly}
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
  );
};

export default ProductForm;