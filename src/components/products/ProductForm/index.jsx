import { IconnedButton, SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Form, FormField, Input, Label, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { ICONS, MEASSURE_UNITS, PAGES, PRODUCT_STATES, RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading }) => {
  const { handleSubmit, control, reset, watch, formState: { isDirty, errors, isSubmitted }, clearErrors } = useForm({
    defaultValues: {
      fractionConfig: {
        active: false,
        unit: MEASSURE_UNITS.MT.value,
      },
      editablePrice: false,
      ...product,
    }
  });
  const [supplier, setSupplier] = useState();
  const [brand, setBrand] = useState();
  const [watchFractionable] = watch(["fractionConfig.active"]);

  const handleReset = useCallback((product) => {
    setSupplier({ name: "", id: "" });
    setBrand({ name: "", id: "" });

    if (isUpdating) {
      reset(product);
    } else {
      reset({
        ...product,
        fractionConfig: { active: false, unit: MEASSURE_UNITS.MT.value },
        editablePrice: false
      });
    }
  }, [reset, isUpdating]);

  const handleForm = async (data) => {
    if (!isUpdating) {
      data.code = `${supplier?.id}${brand?.id}${data.code}`;
    }
    await onSubmit(data);
  };

  const shouldError = useMemo(() => !isUpdating && isDirty && isSubmitted, [isDirty, isSubmitted, isUpdating]);

  const isDeleted = product?.state === PRODUCT_STATES.DELETED.id;

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT), SHORTKEYS.DELETE);

  return (
    <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
      <FieldsContainer rowGap="5px" alignItems="flex-end">
        <FormField flex="1" error={shouldError && !supplier && 'Campo requerido.'}>
          <RuledLabel title="Proveedor" message={shouldError && !supplier && 'Campo requerido.'} required />
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
                clearErrors("code");
              }}
              disabled={isDeleted}
            />
          ) : (
            <Segment placeholder>{product?.supplierName}</Segment>
          )}
        </FormField>
        <FormField flex="1" error={shouldError && !brand && 'Campo requerido.'}>
          <RuledLabel title="Marca" message={shouldError && !brand && 'Campo requerido.'} required />
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
                clearErrors("code");
              }}
              disabled={isDeleted}
            />
          ) : (
            <Segment placeholder>{product?.brandName}</Segment>
          )}
        </FormField >
        <FormField width="20%">
          <Controller
            name="editablePrice"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <IconnedButton
                {...rest}
                text="Precio Editable"
                icon={ICONS.PENCIL}
                onClick={() => onChange(!value)}
                basic={!value}
                disabled={isDeleted}
              />
            )}
          />
        </FormField>
        <FormField width="20%">
          <Controller
            name="fractionConfig.active"
            control={control}
            render={({ field: { value, onChange, ...rest } }) => (
              <IconnedButton
                {...rest}
                text="Producto Fraccionable"
                icon={ICONS.CUT}
                onClick={() => onChange(!value)}
                basic={!value}
                disabled={isDeleted}
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer rowGap="5px">
        <FormField width="20%" error={errors?.code?.message}>
          <RuledLabel title="Código" message={errors?.code?.message} required={!isUpdating} />
          {isUpdating ? (
            <Segment placeholder>{product?.code}</Segment>
          ) : (
            <Controller
              name="code"
              control={control}
              rules={RULES.REQUIRED_BRAND_AND_SUPPLIER(brand, supplier)}
              render={({ field }) => (
                <Input
                  innerWidth="0"
                  {...field}
                  placeholder="Código"
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                  {...((supplier?.id || brand?.id) && { label: { basic: true, content: `${supplier?.id ?? ''} ${brand?.id ?? ''}` } })}
                  labelPosition='left'
                  disabled={isDeleted}
                />
              )}
            />
          )}
        </FormField>
        <FormField flex="1" error={errors?.name?.message}>
          <RuledLabel title="Nombre" message={errors?.name?.message} required />
          <Controller
            name="name"
            control={control}
            rules={RULES.REQUIRED}
            render={({ field }) => <Input height="50px" {...field} placeholder="Nombre" disabled={isDeleted} />}
          />
        </FormField>
        <FormField width="20%">
          <Label>Precio</Label>
          <Controller
            name="price"
            control={control}
            render={({ field: { onChange, value } }) => (
              <CurrencyFormatInput
                textAlignLast="right"
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
                disabled={isDeleted}
              />
            )}
          />
        </FormField>
        <FormField width="20%">
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
                disabled={!watchFractionable || isDeleted}
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <ControlledComments control={control} disabled={isDeleted} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT)}
        disabled={isDeleted}
      />
    </Form>
  );
};

export default ProductForm;