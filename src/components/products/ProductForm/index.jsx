import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, FormField, Icon, Message } from "@/common/components/custom";
import {
  DropdownControlled,
  IconedButtonControlled,
  PercentField,
  PriceControlled,
  SearchControlled,
  TextAreaControlled,
  TextControlled,
  TextField
} from "@/common/components/form";
import { SearchResultContent, SearchResultDescription, SearchResultTitle } from "@/common/components/form/Search/styles";
import { COLORS, ENTITIES, ERROR_MESSAGES, FIELD_LABELS, ICONS, RULES, SHORTKEYS } from "@/common/constants";
import { removeNullish } from "@/common/utils";
import { BRAND_STATES, getBrandSearchDescription, getBrandSearchTitle } from "@/components/brands/brands.constants";
import { SUPPLIER_STATES, getSupplierSearchDescription, getSupplierSearchTitle } from "@/components/suppliers/suppliers.constants";
import { useKeyboardShortcuts } from "@/hooks";
import useSettingArrayField from "@/hooks/useSettingArrayField";
import { forwardRef, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { EMPTY_PRODUCT, MEASSURE_UNITS } from "../products.constants";
import { calculateMargin, calculatePriceFromMargin, getBrandId, getMargin, getProductId, getSupplierId, isProductDeleted } from "../products.utils";

const ProductForm = forwardRef(({
  product, onSubmit, brands, suppliers, isUpdating, isLoading, view, isDeletePending, blacklist },
  ref) => {
  const initialMargin = getMargin(product?.price, product?.cost);
  const getInitialValues = (product) => ({
    ...EMPTY_PRODUCT,
    margin: initialMargin,
    tags: [],
    fractionConfig: {
      active: false,
      unit: MEASSURE_UNITS.MT.value,
      value: 1
    },
    editablePrice: false,
    supplier: product?.supplier ? { id: product.supplier, state: product.supplierState } : null,
    brand: product?.brand ? { id: product.brand, state: product.brandState } : null,
    ...product,
  });

  const methods = useForm({
    defaultValues: getInitialValues(product)
  });
  const { options: tagsOptions, optionsMapper } = useSettingArrayField(ENTITIES.PRODUCT, "tags", product?.tags || []);
  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;

  useImperativeHandle(ref, () => ({
    isDirty: () => isDirty,
    submitForm: () => handleSubmit(handleForm)(),
    resetForm: () => reset(getInitialValues(product))
  }));

  const [watchFractionable, watchSupplier, watchBrand, watchCost, watchPrice, watchStockControl, WatchEditablePrice] = watch([
    'fractionConfig.active',
    'supplier',
    'brand',
    'cost',
    'price',
    'stockControl',
    'editablePrice',
  ]);

  const handleForm = async (data) => {
    const filteredData = removeNullish({ ...data });

    if (data.fractionConfig && !data.fractionConfig.active && product?.fractionConfig?.active === false) {
      delete filteredData.fractionConfig;
    }

    if (data.editablePrice === product?.editablePrice) {
      delete filteredData.editablePrice;
    }

    if (!isUpdating) {
      filteredData.id = `${data.supplier?.id ?? ''}${data.brand?.id ?? ''}${data.id.toUpperCase()}`;
      delete filteredData.supplier;
      delete filteredData.brand;
    }

    await onSubmit(filteredData);
    reset(getInitialValues({ ...product, ...filteredData }));
  };

  const validateShortcuts = {
    canConfirm: () => !isLoading && isDirty,
    canReset: () => isDirty,
  };

  useKeyboardShortcuts([
    {
      key: SHORTKEYS.ENTER,
      action: handleSubmit(handleForm),
      condition: validateShortcuts.canConfirm,
    },
    {
      key: SHORTKEYS.DELETE,
      action: () => reset(getInitialValues(product)),
      condition: validateShortcuts.canReset,
    }
  ]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)}>
        <FieldsContainer $rowGap="5px" >
          {view ? (
            <>
              <FormField flex="1">
                <TextField label="Proveedor" value={product?.supplierName} disabled />
              </FormField>
              <FormField flex="1">
                <TextField label="Marca" value={product?.brandName} disabled />
              </FormField>
              <FormField flex="1">
                <TextField
                  $truncateInput
                  label={FIELD_LABELS.ID}
                  value={getProductId(product?.id)}
                  iconLabel={`${getSupplierId(product?.id)} ${getBrandId(product?.id)}`}
                  disabled
                />
              </FormField>
            </>
          ) : (
            <>
              <FormField flex="1">
                <SearchControlled
                  clearable
                  disabled={isUpdating || isLoading}
                  name="supplier"
                  label="Proveedor"
                  placeholder="Suministro Estrella"
                  persistSelection
                  required
                  rules={{
                    validate: {
                      required: (value) => !!value?.id || ERROR_MESSAGES.REQUIRED_FIELD,
                      activeSupplier: (value) =>
                        value?.state === SUPPLIER_STATES.ACTIVE.id || 'No es posible usar un proveedor inactivo.',
                    },
                  }}
                  elements={suppliers}
                  searchFields={['name', 'id']}
                  getResultProps={(supplier) => ({
                    key: supplier.id,
                    title: supplier.name ?? "",
                    description: supplier.comments ?? "",
                    value: supplier,
                  })}
                  resultRenderer={({ value: supplier }) => (
                    <SearchResultContent>
                      <SearchResultTitle>
                        {getSupplierSearchTitle(supplier)}
                      </SearchResultTitle>
                      <SearchResultDescription>
                        {getSupplierSearchDescription(supplier)}
                      </SearchResultDescription>
                    </SearchResultContent>
                  )}
                />
              </FormField>
              <FormField flex="1">
                <SearchControlled
                  clearable
                  disabled={isUpdating || isLoading}
                  name="brand"
                  label="Marca"
                  placeholder="CallixtoGLM"
                  persistSelection
                  required
                  rules={{
                    validate: {
                      required: (value) => !!value?.id || ERROR_MESSAGES.REQUIRED_FIELD,
                      activeBrand: (value) =>
                        value?.state === BRAND_STATES.ACTIVE.id || 'No es posible usar una marca inactiva.',
                    },
                  }}
                  elements={brands}
                  searchFields={['name', 'id']}
                  getResultProps={(brand) => ({
                    key: brand.id,
                    title: brand.name ?? "",
                    description: brand.comments ?? "",
                    value: brand,
                  })}
                  resultRenderer={({ value: brand }) => (
                    <SearchResultContent>
                      <SearchResultTitle>
                        {getBrandSearchTitle(brand)}
                      </SearchResultTitle>
                      <SearchResultDescription>
                        {getBrandSearchDescription(brand)}
                      </SearchResultDescription>
                    </SearchResultContent>
                  )}
                />
              </FormField>
              <FormField flex="1">
                <TextControlled
                  name="id"
                  label={FIELD_LABELS.ID}
                  required
                  placeholder="A0001"
                  rules={{
                    required: ERROR_MESSAGES.REQUIRED_FIELD_ALT,
                    validate: (value) => {
                      if (blacklist?.includes(value.trim().toUpperCase())) {
                        return "Este id se encuentra dentro de la lista de productos bloqueados.";
                      }
                      return true;
                    },
                  }}
                  onChange={value => value.toUpperCase()}
                  disabled={isProductDeleted(product?.state)}
                  iconLabel={`${watchSupplier?.id ?? ''} ${watchBrand?.id ?? ''}`}
                />
              </FormField>
            </>
          )}
        </FieldsContainer>
        <FieldsContainer $rowGap="5px" $alignItems="flex-end">
          <FormField flex="1">
            <TextControlled
              name="name"
              label={FIELD_LABELS.NAME}
              placeholder="Televisor 100”"
              rules={RULES.REQUIRED}
              disabled={!isUpdating && view}
              required={isUpdating || !view}
            />
          </FormField>
          <FormField $flexDirection="row" flex="1">
            <FormField $maxWidth="fit-content" flex="1" >
              <IconedButtonControlled
                name="stockControl"
                text={watchStockControl ? "Deshabilitar control de stock" : "Habilitar control de stock"}
                icon={ICONS.BOXES}
                color={COLORS.BLUE}
                disabled={!isUpdating && view}
                iconOnly
              />
            </FormField>
            {watchStockControl &&
              <FormField flex="1">
                <Message $minWidth="max-content" $opacity={view} height="38px" margin="0" color={COLORS.BLUE} >
                  <Icon name={ICONS.BOXES} /> Stock: {product?.stock ?? 0}
                </Message>
              </FormField>
            }
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        <FieldsContainer>
          <FormField flex="1">
            <PriceControlled
              name="cost"
              label={FIELD_LABELS.COST}
              disabled={!isUpdating && view}
              maxLength={19}
            />
          </FormField>
          <FormField $flexDirection="row" flex="1">
            <FormField flex="1">
              <PriceControlled
                name="price"
                label={FIELD_LABELS.PRICE}
                disabled={!isUpdating && view}
              />
            </FormField>
            <FormField $maxWidth="max-content" $alignItems="end" $flexDirection="row" flex="1">
              <IconedButtonControlled
                name="editablePrice"
                text={WatchEditablePrice ? "Deshabilitar precio editable" : "Habilitar precio editable"}
                icon={ICONS.PENCIL}
                color={COLORS.BLUE}
                disabled={!isUpdating && view}
                iconOnly
              />
            </FormField>
          </FormField>
          <FormField $alignItems="end" $flexDirection="row" flex="1">
            <FormField flex="1">
              <PercentField
                width="50%"
                label="Margen"
                value={calculateMargin(watchPrice, watchCost)}
                disabled={!isUpdating && view}
                onChange={(newMargin) => {
                  if (!newMargin || !watchCost) {
                    return;
                  }
                  const newPrice = calculatePriceFromMargin(watchCost, newMargin);
                  methods.setValue('price', newPrice);
                }}
                maxValue={1000000}
              />
            </FormField>
          </FormField>
        </FieldsContainer>
        <FieldsContainer>
          <FormField $height="62px" $flexDirection="row" flex="1">
            <FormField  flex="1" >
              <DropdownControlled
                name="fractionConfig.unit"
                label="Unidad de medida"
                options={Object.values(MEASSURE_UNITS)}
                defaultValue={Object.values(MEASSURE_UNITS)[0].value}
                disabled={(!isUpdating && view || !watchFractionable)}
              />
            </FormField>
            <FormField $maxWidth="max-content" $alignItems="end" $flexDirection="row" flex="1">
              <IconedButtonControlled
                name="fractionConfig.active"
                text={watchFractionable ? "Deshabilitar producto fraccionable" : "Habilitar producto fraccionable"}
                icon={ICONS.CUT}
                disabled={!isUpdating && view}
                color={COLORS.BLUE}
                iconOnly
              />
            </FormField>
          </FormField>
          <FormField flex="1">
            <DropdownControlled
              disabled={!isUpdating && view}
              name="tags"
              label="Etiquetas"
              placeholder="Selecciona etiquetas"
              multiple
              clearable={isUpdating && !view}
              icon={(!isUpdating && view) ? null : undefined}
              search={isUpdating && !view}
              selection
              optionsMapper={optionsMapper}
              options={Object.values(tagsOptions)}
              renderLabel={(item) => ({
                color: item.value.color,
                content: item.value.name,
              })}
            />
          </FormField>
          <FormField flex="1" />
        </FieldsContainer>
        <TextAreaControlled
          name="comments"
          label={FIELD_LABELS.COMMENTS}
          placeholder="Realmente son muchas pulgadas"
          readOnly={!isUpdating && view}
        />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset(getInitialValues(product))}
            disabled={isProductDeleted(product?.state) || isDeletePending}
            submit
          />
        )}
      </Form>
    </FormProvider >
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;
