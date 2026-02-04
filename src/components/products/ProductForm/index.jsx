import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Form, Icon, Message } from "@/common/components/custom";
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
import { COLORS, ENTITIES, ICONS, RULES, SHORTKEYS } from "@/common/constants";
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

  const [watchFractionable, watchSupplier, watchBrand, watchCost, watchPrice, watchStockControl] = watch([
    'fractionConfig.active',
    'supplier',
    'brand',
    'cost',
    'price',
    'stockControl',
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
        <FieldsContainer $rowGap="5px">
          {view ? (
            <>
              <TextField width="25%" label="Proveedor" value={product?.supplierName} disabled required />
              <TextField width="25%" label="Marca" value={product?.brandName} disabled required />
              <TextField
                width="250px"
                label="Id"
                value={getProductId(product?.id)}
                iconLabel={`${getSupplierId(product?.id)} ${getBrandId(product?.id)}`}
                disabled
                required
              />
            </>
          ) : (
            <>
              <SearchControlled
                clearable
                width="25%"
                disabled={isUpdating || isLoading}
                name="supplier"
                label="Proveedor"
                placeholder="Suministro Estrella"
                persistSelection
                required
                rules={{
                  validate: {
                    required: (value) => !!value?.id || 'Campo requerido.',
                    activeSupplier: (value) =>
                      value?.state === SUPPLIER_STATES.ACTIVE.id || 'No es posible usar un proveedor inactivo.',
                  },
                }}
                elements={suppliers}
                searchFields={['name', 'id']}
                getResultProps={(supplier) => ({
                  key: supplier.id,
                  title: getSupplierSearchTitle(supplier),
                  description: getSupplierSearchDescription(supplier),
                  value: supplier,
                })}
              />
              <SearchControlled
                clearable
                disabled={isUpdating || isLoading}
                width="25%"
                name="brand"
                label="Marca"
                placeholder="CallixtoGLM"
                persistSelection
                required
                rules={{
                  validate: {
                    required: (value) => !!value?.id || 'Campo requerido.',
                    activeBrand: (value) =>
                      value?.state === BRAND_STATES.ACTIVE.id || 'No es posible usar una marca inactiva.',
                  },
                }}
                elements={brands}
                searchFields={['name', 'id']}
                getResultProps={(brand) => ({
                  key: brand.id,
                  title: getBrandSearchTitle(brand),
                  description: getBrandSearchDescription(brand),
                  value: brand,
                })}
              />
              <TextControlled
                width="250px"
                name="id"
                label="Id"
                required
                placeholder="A0001"
                rules={{
                  required: "Este campo es obligatorio.",
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
            </>
          )}
        </FieldsContainer>
        <FieldsContainer $rowGap="5px" $alignItems="flex-end">
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            placeholder="Televisor 100”"
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
            required
          />
          <IconedButtonControlled
            width="fit-content"
            name="stockControl"
            text="Stock habilitado"
            icon={ICONS.BOXES}
            color={COLORS.BLUE}
            disabled={!isUpdating && view}
          />
          {watchStockControl && !isUpdating &&
            <Message opacity={view} height="38px" padding="0.5rem 1rem" margin="0" color={COLORS.BLUE} >
              <Icon name={ICONS.BOXES} /> Stock Total: {product?.stock ?? 0}
            </Message>
          }
        </FieldsContainer>
        <FieldsContainer $alignItems="end">
          <PriceControlled
            width="200px"
            name="cost"
            label="Costo"
            disabled={!isUpdating && view}
          />
          <PriceControlled
            width="200px"
            name="price"
            label="Precio"
            disabled={!isUpdating && view}
          />
          <PercentField
            width="150px"
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
          <IconedButtonControlled
            width="fit-content"
            name="editablePrice"
            text="Precio Editable"
            icon={ICONS.PENCIL}
            color={COLORS.BLUE}
            disabled={!isUpdating && view}
          />
          <IconedButtonControlled
            width="fit-content"
            name="fractionConfig.active"
            text="Producto Fraccionable"
            icon={ICONS.CUT}
            disabled={!isUpdating && view}
            color={COLORS.BLUE}
          />
          <DropdownControlled
            width="200px"
            name="fractionConfig.unit"
            label="Unidad de Medida"
            options={Object.values(MEASSURE_UNITS)}
            defaultValue={Object.values(MEASSURE_UNITS)[0].value}
            disabled={(!isUpdating && view) || !watchFractionable}
          />
        </FieldsContainer>
        <FieldsContainer>
          <DropdownControlled
            disabled={!isUpdating && view}
            width={(!isUpdating && view) ? "fit-content" : "40%"}
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
        </FieldsContainer>
        <TextAreaControlled
          name="comments"
          label="Comentarios"
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
    </FormProvider>
  );
});

ProductForm.displayName = "ProductForm";

export default ProductForm;