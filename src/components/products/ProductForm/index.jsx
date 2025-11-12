import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Flex, Form, Label, OverflowWrapper } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled, PercentField, PriceControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { Text } from "@/common/components/search/styles";
import { COLORS, ENTITIES, ICONS, RULES, SHORTKEYS } from "@/common/constants";
import { BRAND_STATES } from "@/components/brands/brands.constants";
import { SUPPLIER_STATES } from "@/components/suppliers/suppliers.constants";
import { useKeyboardShortcuts } from "@/hooks";
import useSettingArrayField from "@/hooks/useSettingArrayField";
import { forwardRef, useImperativeHandle, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";
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
  const [watchFractionable, watchSupplier, watchBrand, watchCost, watchPrice] = watch([
    'fractionConfig.active',
    'supplier',
    'brand',
    'cost',
    'price',
  ]);

  const handleForm = async (data) => {
    const filteredData = { ...data };

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

  const supplierOptions = useMemo(() => {
    return suppliers?.map(({ id, name, state, inactiveReason }) => ({
      key: id,
      value: { id, state },
      text: name,
      content: (
        <Flex $justifyContent="space-between" $alignItems="center">
          <OverflowWrapper maxWidth="80%" popupContent={name}>
            <Text>{name}</Text>
          </OverflowWrapper>
          <Flex>
            {state === SUPPLIER_STATES.INACTIVE.id && (
              <Popup
                trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
                content={inactiveReason ?? 'Motivo no especificado'}
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
    return brands?.map(({ id, name, state, inactiveReason }) => ({
      key: id,
      value: { id, state },
      text: name,
      content: (
        <Flex $justifyContent="space-between" $alignItems="center">
          <OverflowWrapper maxWidth="80%" popupContent={name}>
            <Text>{name}</Text>
          </OverflowWrapper>
          <Flex>
            {state === BRAND_STATES.INACTIVE.id && (
              <Popup
                trigger={<Label color={COLORS.GREY} size="mini">Inactivo</Label>}
                content={inactiveReason ?? 'Motivo no especificado'}
                position="top center"
                size="mini"
              />
            )}
          </Flex>
        </Flex>
      ),
    }));
  }, [brands]);

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)}>
        <FieldsContainer $rowGap="5px">
          {view ? (
            <>
              <TextField width="25%" label="Proveedor" value={product?.supplierName} disabled />
              <TextField width="25%" label="Marca" value={product?.brandName} disabled />
              <TextField
                width="250px"
                label="Id"
                value={getProductId(product?.id)}
                iconLabel={`${getSupplierId(product?.id)} ${getBrandId(product?.id)}`}
                disabled
              />
            </>
          ) : (
            <>
              <DropdownControlled
                width="25%"
                name="supplier"
                label="Proveedor"
                rules={{
                  validate: {
                    required: value => {
                      return !!value?.id || 'Campo requerido.';
                    },
                    activeSupplier: value => {
                      return value?.state === SUPPLIER_STATES.ACTIVE.id || 'No es posible usar un proveedor inactivo.';
                    },
                  }
                }}
                options={supplierOptions}
              />
              <DropdownControlled
                width="25%"
                name="brand"
                label="Marca"
                rules={{
                  validate: {
                    required: value => {
                      return !!value?.id || 'Campo requerido.';
                    },
                    activeBrand: value => {
                      return value?.state === BRAND_STATES.ACTIVE.id || 'No es posible usar una marca inactiva.';
                    },
                  }
                }}
                options={brandOptions}
              />
              <TextControlled
                width="250px"
                name="id"
                label="Id"
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
            rules={RULES.REQUIRED}
            disabled={!isUpdating && view}
          />
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
            label="Precio Editable"
            icon={ICONS.PENCIL}
            color={COLORS.BLUE}
            disabled={!isUpdating && view}
          />
          <IconedButtonControlled
            width="fit-content"
            name="fractionConfig.active"
            label="Producto Fraccionable"
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