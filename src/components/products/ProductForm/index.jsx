"use client";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon } from "semantic-ui-react";
import { Button, ButtonsContainer, CodeInput, Dropdown, FieldsContainer, FormField, Input, Label, Textarea } from "./styles";
import { Segment, FormContainer } from "@/components/common/custom";

const ProductForm = ({ product, onSubmit, brands, suppliers }) => {
  const { push } = useRouter();
  const { handleSubmit, setValue, control, reset, formState: { isDirty } } = useForm({ defaultValues: product });
  const validateCode = (value) => {
    return /^[A-Z0-9]{3}$/.test(value);
  };
  const isUpdating = useMemo(() => !!product?.code, [product]);
  const [isLoading, setIsLoading] = useState(false);
  const [customField, setCustomField] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [selectedBrand, setSelectedBrand] = useState(null);

  const handleReset = useCallback((product) => {
    reset(product || { name: '', price: '', code: '', comments: "" });
  }, [reset]);

  const buttonConfig = useMemo(() => {
    return {
      submit: {
        icon: isUpdating ? "edit" : "add",
        title: isUpdating ? "Actualizar" : "Crear",
      },
      restore: {
        onClick: () => handleReset(isUpdating ? product : null),
        icon: isUpdating ? 'undo' : 'erase',
        title: isUpdating ? 'Restaurar' : 'Limpiar'
      }
    }
  }, [product, handleReset, isUpdating]);

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
      <FormContainer>
        <FieldsContainer>
          <FormField>
            <Label>Proveedor</Label>
            {!isUpdating ? (
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
            {!isUpdating ? (
              <Controller
                name="brand"
                control={control}
                rules={{ required: true }}
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
        {customField && <CodeInput
          value={customField}
          disabled
          onChange={(e) => {
            updateCustomField(selectedSupplier?.id, selectedBrand?.id);
          }}
        />}
        <FieldsContainer>
          <FormField>
            <Label >Código</Label>
            {!isUpdating ? (
              <Controller
                name="code"
                control={control}
                rules={{ required: true, validate: validateCode }}
                render={({ field }) => (
                  <>
                    <Input paddingLeft={customField} required {...field}
                      maxLength={3}
                      placeholder="Código (A12)"
                      onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                      disabled={isUpdating}
                    ></Input>
                  </>
                )}
              />
            ) : (
              <Segment>{product?.code}</Segment>
            )}
          </FormField>
          <FormField>
            <Label >Código del proveedor</Label>
            <Controller
              name="supplierCode"
              control={control}
              render={({ field }) => (
                <Input  {...field} placeholder="Código proveedor" />
              )}
            />
          </FormField>
        </FieldsContainer>
        <FieldsContainer >
          <FormField flex="1" >
            <Label>Nombre</Label>
            <Controller
              name="name"
              control={control}
              rules={{ required: true }}
              render={({ field }) => <Input {...field} placeholder="Nombre" />}
            />
          </FormField>
          <FormField>
            <Label>Precio</Label>
            <Controller
              name="price"
              control={control}
              rules={{ required: true, min: 0.01 }}
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
          </FormField>
        </FieldsContainer>
        <FieldsContainer flex="1">
          <Label >Comentarios</Label>
          <Controller
            name="comments"
            control={control}
            render={({ field }) => <Textarea maxLength="2000" {...field} placeholder="Comentarios" />}
          />
        </FieldsContainer>
        <ButtonsContainer>
          <Button
            disabled={isLoading || !isDirty}
            loading={isLoading}
            type="submit"
            color="green">
            <Icon name={buttonConfig.submit.icon} />{buttonConfig.submit.title}</Button>
          <Button type="button" onClick={buttonConfig.restore.onClick} color="brown" disabled={isLoading || !isDirty}>
            <Icon name={buttonConfig.restore.icon} />{buttonConfig.restore.title}
          </Button>
        </ButtonsContainer>
      </FormContainer>
    </Form>
  )
};

export default ProductForm;
