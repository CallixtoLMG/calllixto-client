import { useUserContext } from "@/User";
import { useGetSetting } from "@/api/settings";
import { SubmitAndRestore } from "@/common/components/buttons";
import { FieldsContainer, Flex, Form, Label } from "@/common/components/custom";
import { DropdownControlled, IconedButtonControlled, PriceControlled, TextAreaControlled, TextControlled, TextField } from "@/common/components/form";
import { COLORS, ENTITIES, ICONS, RULES, SHORTKEYS } from "@/common/constants";
import { preventSend } from "@/common/utils";
import { BRANDS_STATES } from "@/components/brands/brands.constants";
import { SUPPLIER_STATES } from "@/components/suppliers/suppliers.constants";
import { useArrayTags } from "@/hooks/arrayTags";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { RULES as ACCESS } from "@/roles";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { EMPTY_PRODUCT, MEASSURE_UNITS } from "../products.constants";
import { getBrandCode, getProductCode, getSupplierCode, isProductDeleted } from "../products.utils";

const ProductForm = ({ product, onSubmit, brands, suppliers, isUpdating, isLoading, view }) => {
  const methods = useForm({
    defaultValues: {
      tags: [],
      fractionConfig: {
        active: false,
        unit: MEASSURE_UNITS.MT.value,
      },
      editablePrice: false,
      ...product,
      cost: product?.cost || 0,
    }
  });
  const { data: productsSettings, isFetching: isProductSettingsFetching } = useGetSetting(ENTITIES.PRODUCTS);
  const { tagsOptions, optionsMapper } = useArrayTags(ENTITIES.PRODUCTS, productsSettings);
  const { handleSubmit, reset, watch, formState: { isDirty, errors } } = methods;
  const [watchFractionable, watchSupplier, watchBrand] = watch(['fractionConfig.active', 'supplier', 'brand']);
  const [margin, setMargin] = useState("");
  const [isTypingMargin, setIsTypingMargin] = useState(false);
  const [price, cost] = watch(["price", "cost"]);
  const [supplier, setSupplier] = useState();
  const [brand, setBrand] = useState();
  const { role } = useUserContext();

  const handleMarginChange = (e) => {
    const rawValue = e.target.value;
    setMargin(rawValue);
    setIsTypingMargin(true);

    const marginValue = parseFloat(rawValue);
    if (!isNaN(marginValue)) {
      const validCost = Number(cost) || 0;
      const updatedPrice = validCost > 0 ? validCost + (validCost * marginValue / 100) : 0;

      setValue("price", parseFloat(updatedPrice.toFixed(2)));
    }
  };

  const handleMarginBlur = () => {
    setIsTypingMargin(false);
    const marginValue = parseFloat(margin);
    if (!isNaN(marginValue)) {
      setMargin(marginValue.toString());
    }
  };

  useEffect(() => {
    if (!isTypingMargin) {
      const validCost = Number(cost) || 0;
      const validPrice = Number(price) || 0;

      if (validCost > 0) {
        const calculatedMargin = ((validPrice - validCost) / validCost) * 100;
        setMargin(calculatedMargin.toFixed(2));
      } else {
        setMargin("");
      }
    }
  }, [price, cost, isTypingMargin]);

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
        <FieldsContainer rowGap="5px">
        {ACCESS.canUpdate[role] &&
          <>
            <FormField width="20%">
              <RuledLabel title="Costo" />
              <Controller
                name="cost"
                control={control}
                rules={{ required: "El costo es requerido." }}
                render={({ field }) => (
                  <Input
                    {...field}
                    textAlign="right"
                    type="number"
                    min="0"
                    placeholder="Costo"
                    disabled={isProductDeleted(product?.state)}
                  />
                )}
              />
            </FormField>
            <FormField width="20%">
              <RuledLabel title="Margen (%)" />
              <Input
                textAlign="right"
                type="text"
                value={margin}
                placeholder="Margen"
                onChange={handleMarginChange}
                onBlur={handleMarginBlur}
              />
            </FormField>
          </>
        }
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
                onValueChange={val => onChange(val.floatValue)}
                value={value || 0}
                placeholder="Precio"
                disabled={isProductDeleted(product?.state)}
              />
            )}
          />
        </FormField>
      </FieldsContainer>
      <FieldsContainer>
          <DropdownControlled
            disabled={!isUpdating && view}
            width={(!isUpdating && view) ? "fit-content" : "40%"}
            name="tags"
            label="Etiquetas"
            placeholder="Selecciona etiquetas"
            height="fit-content"
            multiple
            clearable={isUpdating && !view}
            icon={(!isUpdating && view) ? null : undefined}
            search={isUpdating && !view}
            selection
            optionsMapper={optionsMapper}
            loading={isProductSettingsFetching}
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