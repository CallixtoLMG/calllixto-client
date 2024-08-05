import { LIST_BANNED_PRODUCTS_QUERY_KEY, editBanProducts, useListBanProducts } from "@/api/products";
import { FieldsContainer, Flex, Form, FormField, IconedButton, Input, Label, Modal } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { Loader } from "@/components/layout";
import { handleEnterKeyPress } from '@/utils';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isEqual, sortBy } from 'lodash';
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Icon, Transition } from "semantic-ui-react";
import { BAN_FILTERS, BAN_PRODUCTS_COLUMNS } from "../products.common";
import { ModalActions } from "./styles";

const BanProduct = ({ open, setOpen }) => {
  const { data: blacklist, isLoading } = useListBanProducts();
  const { handleSubmit, setValue, watch } = useForm();
  const watchProducts = watch('products');
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('');
  const formRef = useRef(null);

  const deleteProduct = useCallback((element) => {
    const newProducts = watchProducts.filter(product => product !== element.code);
    setValue("products", newProducts, { shouldDirty: true });
  }, [watchProducts, setValue]);

  const actions = [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
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
        toast.error(`El código [${code}] debe más de 5 caracteres!`);
        return true;
      }
    });

    if (error) {
      return;
    }

    const validProducts = newCodes.filter(code => !watchProducts.includes(code));
    if (validProducts.length) {
      const updatedProducts = [...watchProducts, ...validProducts];
      setValue("products", updatedProducts, { shouldDirty: true });
    }

    event.target.value = '';
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (products) => {
      const { data } = await editBanProducts(products);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BANNED_PRODUCTS_QUERY_KEY] });
        toast.success('Lista de productos bloquedos actualizada!');
        setOpen(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  useEffect(() => {
    if (!isLoading) {
      setValue("products", blacklist);
    }
  }, [blacklist, isLoading, setValue]);

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
              <FormField width="100%">
                <Label>Agregar código</Label>
                <Input
                  height="30px"
                  type="text"
                  placeholder="Código"
                  onKeyPress={(e) => handleEnterKeyPress(e, handleAddProduct)}
                />
              </FormField>
            </FieldsContainer>
            <FieldsContainer rowGap="5px"  >
              <Label>Productos vedados</Label>
              <Loader greyColor active={isLoading}>
                <Table
                  deleteButtonInside
                  tableHeight="40vh"
                  mainKey="code"
                  headers={BAN_PRODUCTS_COLUMNS}
                  elements={watchProducts?.map(p => ({ code: p })).filter(p => p.code.includes(filter))}
                  actions={actions}
                  filters={BAN_FILTERS}
                  onFilter={(filter) => setFilter(filter.code.toUpperCase().trim())}
                  onManuallyRestore={() => {
                    setFilter('');
                  }}
                ></Table>
              </Loader >
            </FieldsContainer>
          </Form>
        </Modal.Content>
        <ModalActions>
          <Flex columnGap="5px">
            <IconedButton
              icon
              labelPosition="left"
              disabled={isPending}
              onClick={() => setOpen(false)}
              color="red"
            >
              <Icon name="cancel" />
              Cancelar
            </IconedButton>
            <IconedButton
              icon
              labelPosition="left"
              disabled={isPending || isEqual(sortBy(blacklist), sortBy(watchProducts))}
              loading={isPending}
              type="submit"
              color="green"
              onClick={handleConfirmClick}
            >
              <Icon name="check" />
              Aceptar
            </IconedButton>
          </Flex>
        </ModalActions>
      </Modal>
    </Transition>
  );
};

export default BanProduct;
