import { IconnedButton, SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Flex, Form, FormField, Input, Label, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { BRANDS_STATES, COLORS, ICONS, MEASSURE_UNITS, PAGES, RULES, SHORTKEYS, SUPPLIER_STATES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { isProductDeleted, preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading, tags }) => {

  const { handleSubmit, control, reset, watch, formState: { isDirty, errors }, clearErrors, setError } = useForm({
    defaultValues: {
      tags: product?.tags || [],
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
  const [localProduct, setLocalProduct] = useState(product);

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
    if (supplier?.state === SUPPLIER_STATES.INACTIVE.id) {
      setError("supplier", { type: "manual", message: "Este proveedor está inactivo." });
      return;
    }

    if (brand?.state === BRANDS_STATES.INACTIVE.id) {
      setError("brand", { type: "manual", message: "Esta marca está inactiva." });
      return;
    }

    const filteredData = { ...data };

    if (data.fractionConfig && !data.fractionConfig.active && product?.fractionConfig?.active === false) {
      delete filteredData.fractionConfig;
    }

    if (data.editablePrice === product?.editablePrice) {
      delete filteredData.editablePrice;
    }

    if (!isUpdating) {
      filteredData.code = `${supplier?.id}${brand?.id}${data.code}`;
    }

    await onSubmit(filteredData);
    const updatedProduct = { ...localProduct, tags: filteredData.tags };
    setLocalProduct(updatedProduct);

    reset(updatedProduct);
  };

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT), SHORTKEYS.DELETE);

  const supplierOptions = useMemo(() => {
    return suppliers?.map(({ id, name, state, deactivationReason }) => ({
      key: id,
      value: name,
      text: name,
      content: (
        <Flex justifyContent="space-between" alignItems="center">
          <span>{name}</span>
          <Flex>
            {state === SUPPLIER_STATES.INACTIVE.id && (
              <Popup
                trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
                content={deactivationReason || 'Motivo no especificado'}
                position="top center"
                size="mini"
              />
            )}
          </Flex>
        </Flex>
      ),
    }));
  }, [suppliers]);

  const brandOptions = useMemo(() => {
    return brands?.map(({ id, name, state, deactivationReason }) => ({
      key: id,
      value: name,
      text: name,
      content: (
        <Flex justifyContent="space-between" alignItems="center">
          <span>{name}</span>
          <Flex>
            {state === BRANDS_STATES.INACTIVE.id && (
              <Popup
                trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
                content={deactivationReason || 'Motivo no especificado'}
                position="top center"
                size="mini"
              />
            )}
          </Flex>
        </Flex>
      ),
    }));
  }, [brands]);

  const handleSupplierChange = (value) => {
    const selectedSupplier = suppliers.find((supplier) => supplier.name === value);
    setSupplier(selectedSupplier);

    if (selectedSupplier?.state === SUPPLIER_STATES.INACTIVE.id) {
      setError("supplier", { type: "manual", message: "No es posible crear un producto con un proveedor inactivo." });
    } else {
      clearErrors("supplier");
    }

    clearErrors("code");
  };

  const handleBrandChange = (value) => {
    const selectedBrand = brands.find((brand) => brand.name === value);
    setBrand(selectedBrand);

    if (selectedBrand?.state === BRANDS_STATES.INACTIVE.id) {
      setError("brand", { type: "manual", message: "No es posible crear un producto con una marca inactiva." });
    } else {
      clearErrors("brand");
    }

    clearErrors("code");
  };

  const filteredTags = useMemo(() => {
    const productTagNames = localProduct?.tags?.map((tag) => tag.name) || [];
    const uniqueTags = tags?.filter((tag) => !productTagNames.includes(tag.name)) || [];
    return [...(localProduct?.tags || []), ...uniqueTags];
  }, [tags, localProduct]);

  return (
    <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
      <FieldsContainer rowGap="5px" alignItems="flex-end">
        <FormField flex="1" error={errors.supplier?.message}>
          <RuledLabel title="Proveedor" message={errors.supplier?.message} required />
          {!isUpdating ? (
            <Dropdown
              required
              name="supplier"
              placeholder={PAGES.SUPPLIERS.NAME}
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={supplierOptions}
              clearable
              value={supplier?.name}
              onChange={(e, { value }) => handleSupplierChange(value)}
              disabled={isProductDeleted(product?.state)}
            />
          ) : (
            <Segment placeholder>{product?.supplierName}</Segment>
          )}
        </FormField>

        <FormField flex="1" error={errors.brand?.message}>
          <RuledLabel title="Marca" message={errors.brand?.message} required />
          {!isUpdating ? (
            <Dropdown
              required
              name="brand"
              placeholder={PAGES.BRANDS.NAME}
              search
              selection
              minCharacters={2}
              noResultsMessage="Sin resultados!"
              options={brandOptions}
              clearable
              value={brand?.name}
              onChange={(e, { value }) => handleBrandChange(value)}
              disabled={isProductDeleted(product?.state)}
            />
          ) : (
            <Segment placeholder>{product?.brandName}</Segment>
          )}
        </FormField>
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
                disabled={isProductDeleted(product?.state)}
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
                disabled={isProductDeleted(product?.state)}
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
                  disabled={isProductDeleted(product?.state)}
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
            render={({ field }) => <Input height="50px" {...field} placeholder="Nombre" disabled={isProductDeleted(product?.state)} />}
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
                disabled={isProductDeleted(product?.state)}
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
                disabled={!watchFractionable || isProductDeleted(product?.state)}
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <FormField flex="1">
          <RuledLabel title="Etiquetas" />
          <Controller
            name="tags"
            control={control}
            render={({ field: { value, onChange } }) => (
              <Dropdown
                padding="10px"
                select
                inputHeight="50px"
                placeholder="Selecciona etiquetas"
                multiple
                search
                selection
                options={filteredTags?.map((tag) => ({
                  key: tag.name,
                  value: JSON.stringify(tag),
                  text: tag.name,
                  content: (
                    <Label color={tag.color}>
                      {tag.name}
                    </Label>
                  ),
                }))}
                value={value.map((tag) => JSON.stringify(tag))}
                onChange={(_, data) => {
                  const selectedTags = data.value.map((item) => JSON.parse(item));
                  onChange(selectedTags);
                }}
                renderLabel={(label) => ({
                  color: filteredTags.find((tag) => tag.name === label.text)?.color || 'grey',
                  content: label.text,
                })}
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
        <ControlledComments control={control} disabled={isProductDeleted(product?.state)} />
      </FieldsContainer>
      <SubmitAndRestore
        isUpdating={isUpdating}
        isLoading={isLoading}
        isDirty={isDirty}
        onReset={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT)}
        disabled={isProductDeleted(product?.state)}
      />
    </Form>
  );
};

export default ProductForm;