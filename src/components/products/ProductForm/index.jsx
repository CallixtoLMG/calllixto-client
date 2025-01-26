import { SubmitAndRestore } from "@/components/common/buttons";
import { Dropdown, FieldsContainer, Flex, Form, FormField, Label } from "@/components/common/custom";
import { ControlledComments, ControlledDropdown, ControlledIconedButton, ControlledInput, ControlledNumber } from "@/components/common/form";
import { BRANDS_STATES, COLORS, ICONS, MEASSURE_UNITS, PAGES, RULES, SHORTKEYS, SUPPLIER_STATES } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { isProductDeleted, preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
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

  const { handleSubmit, reset, watch, formState: { isDirty, errors }, clearErrors, setError } = methods;
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

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
        <FieldsContainer rowGap="5px" alignItems="flex-end">
          <FormField
            flex="1"
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
            label="Proveedor"
            error={errors?.supplier ? {
              content: errors.supplier.message,
              pointing: 'above',
            } : null}
            control={Dropdown}
          />
          <FormField
            flex="1"
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
            label="Marca"
            error={errors?.brand ? {
              content: errors.brand.message,
              pointing: 'above',
            } : null}
            control={Dropdown}
          />
          <ControlledInput
            width="20%"
            name="code"
            label="Código"
            placeholder="Código"
            rules={RULES.REQUIRED_BRAND_AND_SUPPLIER(brand, supplier)}
            innerWidth="0"
            onChange={(e) => e.target.value.toUpperCase()}
            labelPosition='left'
            disabled={isProductDeleted(product?.state)}
          />
          <ControlledInput
            flex="1"
            name="name"
            label="Nombre"
            placeholder="Nombre"
            rules={RULES.REQUIRED}
            innerWidth="0"
            onChange={(e) => e.target.value.toUpperCase()}
            labelPosition='left'
            disabled={isProductDeleted(product?.state)}
          />
        </FieldsContainer>
        <FieldsContainer rowGap="5px" alignItems="end">
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
          width="fit-content"
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