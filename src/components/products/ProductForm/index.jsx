import { SubmitAndRestore } from "@/components/common/buttons";
import { FieldsContainer, Flex, Form, Label } from "@/components/common/custom";
import { ControlledComments, ControlledDropdown, ControlledIconedButton, ControlledText, ControlledNumber, DropdownField, TextField } from "@/components/common/form";
import { BRANDS_STATES, COLORS, ICONS, MEASSURE_UNITS, RULES, SHORTKEYS, SUPPLIER_STATES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { getBrandCode, getProductCode, getSupplierCode, isProductDeleted, preventSend } from "@/utils";
import { useCallback, useMemo } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";

const EMPTY_PRODUCT = { name: '', price: 0, code: '', comments: '', supplierId: '', brandId: '' };

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading }) => {
  const methods = useForm({
    defaultValues: {
      fractionConfig: {
        active: false,
        unit: MEASSURE_UNITS.MT.value,
      },
      editablePrice: false,
      ...product,
    }
  });

  const { handleSubmit, reset, watch, formState: { isDirty, errors } } = methods;
  const [watchFractionable, watchSupplier, watchBrand] = watch(['fractionConfig.active', 'supplier', 'brand']);

  const handleReset = useCallback((product) => {
    if (isUpdating) {
      reset(product);
    } else {
      reset({
        ...product,
        supplier: '',
        brand: '',
        fractionConfig: { active: false, unit: MEASSURE_UNITS.MT.value },
        editablePrice: false
      });
    }
  }, [reset, isUpdating]);

  const handleForm = async (data) => {
    const filteredData = { ...data };

    if (data.fractionConfig && !data.fractionConfig.active && product?.fractionConfig?.active === false) {
      delete filteredData.fractionConfig;
    }

    if (data.editablePrice === product?.editablePrice) {
      delete filteredData.editablePrice;
    }

    if (!isUpdating) {
      filteredData.code = `${data.supplier}${data.brand}${data.code.toUpperCase()}`;
      delete filteredData.supplier;
      delete filteredData.brand;
    }

    await onSubmit(filteredData);
  };

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT), SHORTKEYS.DELETE);

  const supplierOptions = useMemo(() => {
    return suppliers?.map(({ id, name, state, deactivationReason }) => ({
      key: id,
      value: id,
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
      value: id,
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

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
        <FieldsContainer rowGap="5px">
          {isUpdating ? (
            <>
              <TextField width="25%" label="Proveedor" value={product?.supplierName} />
              <TextField width="25%" label="Marca" value={product?.brandName} />
              <TextField
                width="250px"
                label="Código"
                value={getProductCode(product?.code)}
                iconLabel={`${getSupplierCode(product?.code)} ${getBrandCode(product?.code)}`}
              />
            </>
          ) : (
            <>
              <Controller
                name="supplier"
                control={methods.control}
                rules={RULES.REQUIRED}
                render={({ field: { onChange, ...rest } }) => {
                  return (
                    <DropdownField
                      {...rest}
                      width="25%"
                      options={supplierOptions}
                      onChange={(e, { value }) => {
                        onChange(value);
                      }}
                      disabled={isProductDeleted(product?.state)}
                      label="Proveedor"
                      error={errors?.supplier ? {
                        content: errors.supplier.message,
                        pointing: 'above',
                      } : null}
                    />
                  )
                }}
              />
              <Controller
                name="brand"
                rules={RULES.REQUIRED}
                render={({ field: { onChange, ...rest } }) => {
                  return (
                    <DropdownField
                      {...rest}
                      width="25%"
                      required
                      options={brandOptions}
                      onChange={(e, { value }) => onChange(value)}
                      disabled={isProductDeleted(product?.state)}
                      label="Marca"
                      error={errors?.brand ? {
                        content: errors.brand.message,
                        pointing: 'above',
                      } : null}
                    />
                  )
                }}
              />
              <ControlledText
                width="250px"
                name="code"
                label="Código"
                rules={RULES.REQUIRED}
                onChange={value => value.toUpperCase()}
                disabled={isProductDeleted(product?.state)}
                iconLabel={`${watchSupplier ?? ''} ${watchBrand ?? ''}`}
              />
            </>
          )}
        </FieldsContainer>
        <FieldsContainer rowGap="5px" alignItems="flex-end">
          <ControlledText
            width="40%"
            name="name"
            label="Nombre"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={isProductDeleted(product?.state)}
          />
        </FieldsContainer>
        <FieldsContainer alignItems="end">
          <ControlledNumber width="200px" name="price" label="Precio" price />
          <ControlledIconedButton
            width="fit-content"
            name="editablePrice"
            label="Precio Editable"
            icon={ICONS.PENCIL}
            disabled={isProductDeleted(product?.state)}
          />
          <ControlledIconedButton
            width="fit-content"
            name="fractionConfig.active"
            label="Producto Fraccionable"
            icon={ICONS.CUT}
            disabled={isProductDeleted(product?.state)}
          />
          <ControlledDropdown
            width="200px"
            name="fractionConfig.unit"
            label="Unidad de Medida"
            options={Object.values(MEASSURE_UNITS)}
            defaultValue={Object.values(MEASSURE_UNITS)[0].value}
            disabled={!watchFractionable || isProductDeleted(product?.state)}
          />
        </FieldsContainer>
        <ControlledComments disabled={isProductDeleted(product?.state)} />
        <SubmitAndRestore
          isUpdating={isUpdating}
          isLoading={isLoading}
          isDirty={isDirty}
          onReset={() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT)}
          disabled={isProductDeleted(product?.state)}
        />
      </Form>
    </FormProvider>
  );
};

export default ProductForm;