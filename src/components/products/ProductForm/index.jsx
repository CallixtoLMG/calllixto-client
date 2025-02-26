import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Flex, Form, Label } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled, PriceControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { COLORS, ICONS, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { BRANDS_STATES } from "@/components/brands/brands.constants";
import { SUPPLIER_STATES } from "@/components/suppliers/suppliers.constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { EMPTY_PRODUCT, MEASSURE_UNITS } from "../products.constants";
import { getBrandCode, getProductCode, getSupplierCode, isProductDeleted } from "../products.utils";

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading, view, isProductSettingsFetching, tags }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
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

  const handleForm = async (data) => {
    const filteredData = { ...data };

    const selectedTags = data.tags || [];

    filteredData.tags = selectedTags.map((tag) =>
      typeof tag === "string" ? JSON.parse(tag) : tag
    );

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

  const tagsOptions = tags?.map(tag => ({
    ...tag,
    content: <Label color={tag?.value?.color}>{tag?.value?.name}</Label>,
  }));

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => reset({ ...EMPTY_PRODUCT, ...product }), SHORTKEYS.DELETE);

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
                content={deactivationReason ?? 'Motivo no especificado'}
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
                content={deactivationReason ?? 'Motivo no especificado'}
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
          {view ? (
            <>
              <TextField width="25%" label="Proveedor" value={product?.supplierName} disabled />
              <TextField width="25%" label="Marca" value={product?.brandName} disabled />
              <TextField
                width="250px"
                label="Código"
                value={getProductCode(product?.code)}
                iconLabel={`${getSupplierCode(product?.code)} ${getBrandCode(product?.code)}`}
                disabled
              />
            </>
          ) : (
            <>
              <DropdownControlled
                width="25%"
                name="supplier"
                label="Proveedor"
                rules={RULES.REQUIRED}
                options={supplierOptions}
              />
              <DropdownControlled
                width="25%"
                name="brand"
                label="Marca"
                rules={RULES.REQUIRED}
                options={brandOptions}
              />
              <TextControlled
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
          <TextControlled
            width="40%"
            name="name"
            label="Nombre"
            rules={RULES.REQUIRED}
            onChange={value => value.toUpperCase()}
            disabled={!isUpdating && view}
          />
        </FieldsContainer>
        <FieldsContainer alignItems="end">
          <PriceControlled width="200px" name="price" label="Precio" disabled={!isUpdating && view} />
          <IconedButtonControlled
            width="fit-content"
            name="editablePrice"
            label="Precio Editable"
            icon={ICONS.PENCIL}
            disabled={!isUpdating && view}
          />
          <IconedButtonControlled
            width="fit-content"
            name="fractionConfig.active"
            label="Producto Fraccionable"
            icon={ICONS.CUT}
            disabled={!isUpdating && view}
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
            disabled={!isUpdating}
            width="40%"
            name="tags"
            label="Etiquetas"
            placeholder="Selecciona etiquetas"
            height="fit-content"
            multiple
            clearable
            search
            selection
            defaultValue={product?.tags}
            loading={isProductSettingsFetching}
            options={tagsOptions}
            renderLabel={(item) => {
              return {
                color: item.value.color,
                content: item.text,
              }
            }}
          />
        </FieldsContainer>
        <TextAreaControlled
          name="comments"
          label="Comentarios"
          rules={RULES.REQUIRED}
          disabled={!isUpdating && view}
        />
        {(isUpdating || !view) && (
          <SubmitAndRestore
            isUpdating={isUpdating}
            isLoading={isLoading}
            isDirty={isDirty}
            onReset={() => reset({ ...EMPTY_PRODUCT, ...product })}
            disabled={isProductDeleted(product?.state)}
          />
        )}
      </Form>
    </FormProvider>
  );
};

export default ProductForm;