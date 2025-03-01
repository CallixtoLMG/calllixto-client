import { useUserContext } from "@/User";
import { editBanProducts, useGetBlackList } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { FieldsContainer, Flex, Form, FormField, Modal } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { handleEnterKeyPress } from '@/common/utils';
import { Loader } from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import { isEqual, sortBy } from 'lodash';
import { useCallback, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Transition } from "semantic-ui-react";
import { BAN_PRODUCTS_COLUMNS } from "../products.constants";
import { ModalActions } from "./styles";

const BanProduct = ({ open, setOpen }) => {
  const { handleSubmit, setValue, watch } = useForm({ defaultValues: { products: [] } });
  const { updateSessionData, userData } = useUserContext();
  const watchProducts = watch('products');
  const formRef = useRef(null);
  const { data: blacklist, isLoading, isFetching, refetch } = useGetBlackList();

  useEffect(() => {
    setValue("products", blacklist);
  }, [blacklist, setValue]);

  useEffect(() => {
    if (open) {
      refetch();
    }
  }, [open, refetch]);

  const deleteProduct = useCallback((element) => {
    const newProducts = watchProducts.filter(product => product !== element.code);
    setValue("products", newProducts, { shouldDirty: true });
  }, [watchProducts, setValue]);

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      onClick: deleteProduct,
      tooltip: 'Eliminar'
    }
  ];

  const handleAddProduct = (event) => {
    const value = event.target.value;
    const newCodes = value.split(',').map(code => code.trim().toUpperCase()).filter(Boolean);

    const error = newCodes.some(code => {
      if (code.includes(' ')) {
        toast.error(`El código [${code}] contiene espacios en blanco, no permitidos!`);
        return true;
      }
      if (code.length < 5) {
        toast.error(`El código [${code}] debe tener más de 5 caracteres!`);
        return true;
      }
      if (watchProducts.includes(code)) {
        toast.error(`El código [${code}] ya existe en la lista!`);
        return true;
      }
      return false;
    });

    if (error) {
      event.target.value = '';
      return;
    }

    const updatedProducts = [...watchProducts, ...newCodes];
    setValue("products", updatedProducts, { shouldDirty: true });
    event.target.value = '';
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (products) => {
      const { data } = await editBanProducts(products);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        const updatedUser = { ...userData, client: { ...userData.client, blacklist: watchProducts } };
        updateSessionData(updatedUser);
        toast.success('Lista de productos bloqueados actualizada!');
        setOpen(false);
      } else {
        toast.error(response.error.message);
      }
    },
  });

  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  return (
    <Transition animation="fade" duration={500} visible={open}>
      <Modal width="500px"
        closeIcon
        open={open}
        onClose={() => setOpen()}
      >
        <Modal.Content>
          <Form ref={formRef} onSubmit={handleSubmit(mutate)}>
            <FieldsContainer>
              <TextField
                placeholder="Código"
                label="Código"
                onKeyPress={(e) => handleEnterKeyPress(e, handleAddProduct)}
                showPopup
                iconLabel
                popupContent={
                  <div>
                    <p>* Para añadir un código nuevo a la lista, anótelo y luego pulse &quot;enter&quot;.</p>
                    <p>* Puede agregar múltiples códigos separados por coma, por ejemplo: PCMU123, PCMU124.</p>
                  </div>
                }
              />
            </FieldsContainer>
            <FieldsContainer rowGap="5px">
              <FormField control={Loader} label="Productos vedados" >
                <Loader $marginTop active={isLoading || isFetching} greyColor>
                  <Table
                    deleteButtonInside
                    tableHeight="40vh"
                    mainKey="code"
                    headers={BAN_PRODUCTS_COLUMNS}
                    elements={watchProducts?.map(p => ({ code: p }))}
                    actions={actions}
                  />
                </Loader>
              </FormField>
            </FieldsContainer>
          </Form>
        </Modal.Content>
        <ModalActions>
          <Flex columnGap="5px">
            <IconedButton
              text="Cancelar"
              icon={ICONS.CANCEL}
              disabled={isPending}
              onClick={() => setOpen(false)}
              color={COLORS.RED}
            />
            <IconedButton
              text="Aceptar"
              icon={ICONS.CHECK}
              disabled={isPending || isEqual(sortBy(blacklist), sortBy(watchProducts))}
              loading={isPending}
              submit
              color={COLORS.GREEN}
              onClick={handleConfirmClick}
            />
          </Flex>
        </ModalActions>
      </Modal>
    </Transition>
  );
};

export default BanProduct;
