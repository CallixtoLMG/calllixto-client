import { IconnedButton, SubmitAndRestore } from "@/components/common/buttons";
import { CurrencyFormatInput, Dropdown, FieldsContainer, Flex, Form, FormField, Input, Label, RuledLabel, Segment } from "@/components/common/custom";
import { ControlledComments } from "@/components/common/form";
import { MEASSURE_UNITS, PAGES, PRODUCTS_STATES, RULES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { preventSend } from "@/utils";
import { useCallback, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Header, Modal, Transition } from "semantic-ui-react";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  const [modalAction, setModalAction] = useState(null); // Nuevo estado para saber qué acción se realizará

  const handleModalClose = () => {
    setIsModalOpen(false);
    setConfirmationText('');
    setModalAction(null);
  };

  const handleModalConfirm = async () => {
    let newState;
    if (modalAction === "recover") {
      newState = 'ACTIVE'; // Recuperar el producto
    } else if (modalAction === "activate") {
      newState = 'ACTIVE'; // Activar el producto
    } else if (modalAction === "inactivate") {
      newState = 'INACTIVE'; // Inactivar el producto
    }

    await onSubmit({ ...product, state: newState });
    handleModalClose();
  };

  const handleRecoverClick = () => {
    setModalAction("recover"); // Establecemos la acción como "recuperar"
    setIsModalOpen(true); // Abrimos el modal
  };

  const handleActivateClick = () => {
    setModalAction("activate"); // Establecemos la acción como "activar"
    setIsModalOpen(true);
  };

  const handleInactivateClick = () => {
    setModalAction("inactivate"); // Establecemos la acción como "inactivar"
    setIsModalOpen(true);
  };

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

  const isDeleted = product?.state === PRODUCTS_STATES.DELETED.id;
  const isOOS = product?.state === PRODUCTS_STATES.OOS.id;
  const isInactive = product?.state === PRODUCTS_STATES.INACTIVE.id;

  const getModalText = () => {
    if (modalAction === "recover") {
      return { header: "¿Está seguro que desea recuperar el producto?", confirmText: "recuperar", icon: "undo" };
    }
    if (modalAction === "activate") {
      return { header: "¿Está seguro que desea activar el producto?", confirmText: "activar", icon: "play circle" };
    }
    if (modalAction === "inactivate") {
      return { header: "¿Está seguro que desea desactivar el producto?", confirmText: "desactivar", icon: "pause circle" };
    }
    return { header: "", confirmText: "", icon: "question" };
  };

  const { header, confirmText, icon } = getModalText(); // Obtener el texto dinámico del modal

  useKeyboardShortcuts(() => handleSubmit(handleForm)(), SHORTKEYS.ENTER);
  useKeyboardShortcuts(() => handleReset(isUpdating ? { ...EMPTY_PRODUCT, ...product } : EMPTY_PRODUCT), SHORTKEYS.DELETE);

  return (
    <Form onSubmit={handleSubmit(handleForm)} onKeyDown={preventSend}>
      <Transition visible={isModalOpen} animation='scale' duration={500}>
        <Modal closeIcon open={isModalOpen} onClose={handleModalClose} size="small">
          <Header icon={icon} content={header} />
          <Modal.Actions>
            <Flex justifyContent="flex-end" alignItems="center" columnGap="15px">
              <Input
                height="40px"
                placeholder={`Escriba '${confirmText}' para confirmar`}
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                fluid
                type="text"
                width="250px"
              />
              <IconnedButton
                height="40px"
                text="Cancelar"
                color="red"
                icon="x"
                onClick={handleModalClose}
              />
              <IconnedButton
                height="40px"
                text="Confirmar"
                icon="check"
                color="green"
                onClick={handleModalConfirm}
                disabled={confirmationText.toLowerCase() !== confirmText}
              />
            </Flex>
          </Modal.Actions>
        </Modal>
      </Transition>

      <FieldsContainer>
        <Controller
          name="state"
          control={control}
          render={({ field: { onChange, value } }) => (
            <>
              <IconnedButton
                text={isOOS ? "Sin stock" : "En stock"}
                icon={isOOS ? "x" : "box"}
                basic={isOOS}
                color="orange"
                onClick={() => onChange(isOOS ? "ACTIVE" : "OOS")}
                disabled={isInactive || isDeleted}
              />

              <IconnedButton
                text={isInactive ? "Activar" : "Desactivar"}
                basic={isInactive}
                color="grey"
                icon={isInactive ? "play circle" : "pause circle"}
                onClick={isInactive ? handleActivateClick : handleInactivateClick} // Cambiamos según el estado
                disabled={isDeleted}
              />

              {isDeleted &&
                <IconnedButton
                  text="Recuperar"
                  icon="undo"
                  basic
                  color="red"
                  onClick={handleRecoverClick}
                  disabled={!isDeleted}
                />
              }
            </>
          )}
        />
      </FieldsContainer>
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
                icon="pencil"
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
                icon="cut"
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