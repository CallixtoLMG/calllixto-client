import { editBanProducts, useListBanProducts } from "@/api/products";
import { Button, FieldsContainer, Form, FormField, Input, Label, RuledLabel } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { REGEX } from "@/constants";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Transition } from "semantic-ui-react";
import { BAN_FILTERS, BAN_PRODUCTS_COLUMNS } from "../products.common";
import { Modal, ModalActions } from "./styles";

const BanProduct = ({ open, setOpen }) => {
  const { blacklist, isLoading } = useListBanProducts();
  const { handleSubmit, formState: { isDirty, errors }, setValue, watch } = useForm({ defaultValues: { products: [] } });
  const watchProducts = watch('products');
  const [errorFlag, setErrorFlag] = useState(false);
  const [errorFlagMsg, setErrorFlagMsg] = useState("");

  const deleteProduct = useCallback((element) => {
    const newProducts = watchProducts.filter(product => product !== element.code);
    setValue("products", newProducts);
  }, [watchProducts, setValue]);

  const actions = [
    {
      id: 1,
      icon: 'erase',
      color: 'red',
      onClick: deleteProduct,
      tooltip: 'Eliminar'
    }
  ];

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleAddProduct = (value) => {
    if (REGEX.FIVE_DIGIT_CODE.test(value)) {
      if (!watchProducts.includes(value)) {
        const updatedProducts = [...watchProducts, value];
        setValue("products", updatedProducts);
        setErrorFlag(false);
      } else {
        setErrorFlag(true);
        setErrorFlagMsg("El producto ingresado ya se encuentra en la lista!");
      }
    } else {
      setErrorFlag(true);
      setErrorFlagMsg("El código debe tener entre 5 y 30 carácteres alfanumericos!")
    }
  };

  const handleEnterKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddProduct(e.target.value);
    }
  };

  const handleAccept = async (data) => {
    editBanProducts(data);
    handleModalClose();
  };

  useEffect(() => {
    if (!isLoading) {
      setValue("products", blacklist)
    }
  }, [isLoading]);

  return (
    <Transition animation="fade" duration={500} visible={open}>
      <Modal
        closeIcon
        open={open}
        onClose={handleModalClose}
      >
        <Modal.Content>
          <Form onSubmit={handleSubmit(handleAccept)}>
            <FieldsContainer>
              <FormField width="100%">
                <RuledLabel title="Agregar código" message={errorFlag ? errorFlagMsg : ""} />
                <Input height="30px" type="text" placeholder="Código" onKeyPress={handleEnterKeyPress} />
              </FormField>
            </FieldsContainer>
            <FieldsContainer width="93%">
              <Label>Productos vedados</Label>
              <Table
                mainKey="code"
                headers={BAN_PRODUCTS_COLUMNS}
                elements={watchProducts?.map(p => ({ code: p }))}
                actions={actions}
                filters={BAN_FILTERS}
              />
            </FieldsContainer>
            <ModalActions>
              <Button disabled={isLoading} loading={isLoading} type="submit" color="green" content="Aceptar" />
              <Button disabled={isLoading} onClick={() => setOpen(false)} color="red" content="Cancelar" />
            </ModalActions>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>
  );
};

export default BanProduct;