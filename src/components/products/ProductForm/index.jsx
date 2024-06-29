import { SubmitAndRestore } from "@/components/common/buttons";
import { Checkbox, CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { MEASSURE_UNITS, PAGES, RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading }) => {
  const { handleSubmit, control, reset, watch, formState: { isDirty, errors, isSubmitted } } = useForm({ defaultValues: { ...product, fractionConfig: {
    unit: MEASSURE_UNITS.MT.value,
  } } });
  const [supplier, setSupplier] = useState();
  const [brand, setBrand] = useState();
  const [watchFractionable] = watch(["fractionConfig.active"]);

  const handleReset = useCallback((product) => {
    setSupplier({ name: "", id: "" });
    setBrand({ name: "", id: "" });
    reset(product);
  }, [reset]);

  const handleForm = async (data) => {
    if (!isUpdating) {
      data.code = `${supplier.id}${brand.id}${data.code}`;
    }
    await onSubmit(data);
  };

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT), SHORTKEYS.DELETE);

  return (
    <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
      <FieldsContainer>
        <FormField width="30%">
          <RuledLabel title="Proveedor" message={!isUpdating && isDirty && isSubmitted && !supplier && 'Campo requerido.'} required />
          {!isUpdating ? (
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
              value={supplier?.name}
              onChange={(e, { value }) => {
                const supplier = suppliers.find((supplier) => supplier.name === value);
                setSupplier(supplier);
              }}
            />
          ) : (
            <Segment disabled>{product?.supplierName}</Segment>
          )}
        </FormField>
        <FormField width="30%">
          <RuledLabel title="Marca" message={!isUpdating && isDirty && isSubmitted && !brand && 'Campo requerido.'} required />
          {!isUpdating ? (
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
              value={brand?.name}
              onChange={(e, { value }) => {
                const brand = brands.find((brand) => brand.name === value);
                setBrand(brand);
              }}
              disabled={isUpdating}
            />
          ) : (
            <Segment disabled>{product?.brandName}</Segment>
          )}
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField width="20%">
          <RuledLabel title="Código" message={errors?.code?.message} required />
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
                {...((supplier?.id || brand?.id) && { label: { basic: true, content: `${supplier?.id ?? ''} ${brand?.id ?? ''}` } })}
                labelPosition='left'
              />
            )}
          />
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
        <FormField>
          <Controller
            name="editablePrice"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Checkbox {...rest} toggle checked={value} onChange={() => onChange(!value)} label="Precio editable" />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField>
          <Controller
            name="fractionConfig.active"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <Checkbox {...rest} toggle checked={value} onChange={() => onChange(!value)} label="Producto Fraccionable" />
            )}
          />
        </FormField>
        {watchFractionable && (
          <FormField>
            <Label>Unidad de Medida</Label>
            <Controller
              name="fractionConfig.unit"
              control={control}
              render={({ field: { onChange, ...rest } }) => (
                <Dropdown
                  {...rest}
                  selection
                  options={Object.values(MEASSURE_UNITS)}
                  defaultValue={Object.values(MEASSURE_UNITS)[0].value}
                  onChange={(e, { value }) => onChange(value)}
                />
              )}
            />
          </FormField>
        )}
      </FieldsContainer>
      <FieldsContainer>
        <Label>Comentarios</Label>
        <ControlledComments control={control} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT)}
      />
    </Form>
  );
};

export default ProductForm;