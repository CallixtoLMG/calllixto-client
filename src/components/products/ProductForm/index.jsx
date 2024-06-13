"use client";
import { SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment, TextArea } from "@/components/common/custom";
import { PAGES, RULES } from "@/constants";
import { formatedPrice, preventSend } from "@/utils";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading }) => {
  const { handleSubmit, control, reset, formState: { isDirty, errors, isSubmitted } } = useForm({ defaultValues: product });
  const [supplierId, setSupplierId] = useState("");
  const [brandId, setBrandId] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

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
          <Label>Proveedor</Label>
          <Segment disabled>{product?.supplierName}</Segment>
        </FormField>
        <FormField width="30%">
          <Label>Marca</Label>
          <Segment disabled>{product?.brandName}</Segment>
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="20%">
          <Label>Código</Label>
          <Segment disabled>{product?.code}</Segment>
        </FormField>
        <FormField flex="1">
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          <Controller
            name="name"
            control={control}
            rules={RULES.REQUIRED}
            render={({ field }) => <Input height="50px" {...field} placeholder="Nombre" />}
          />
        </FormField>
        <FormField width="20%">
          <RuledLabel title="Precio" />
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
            />
          )}
        />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onClick={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : null)}
      />
    </Form>
  );
};

export default ProductForm;