import { LIST_BANNED_PRODUCTS_QUERY_KEY, editBanProducts, useListBanProducts } from "@/api/products";
import { Button, FieldsContainer, Form, FormField, Input, Label, Modal, RuledLabel } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { Loader } from "@/components/layout";
import { handleEnterKeyPress } from '@/utils';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Transition } from "semantic-ui-react";
import { BAN_FILTERS, BAN_PRODUCTS_COLUMNS } from "../products.common";
import { ModalActions } from "./styles";

const BanProduct = ({ open, setOpen }) => {
  const { data: blacklist, isLoading } = useListBanProducts();
  const { handleSubmit, formState: { isDirty }, setValue, watch } = useForm({ defaultValues: { products: [] } });
  const watchProducts = watch('products');
  const [errorFlag, setErrorFlag] = useState(false);
  const [errorFlagMsg, setErrorFlagMsg] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const queryClient = useQueryClient();

  const deleteProduct = useCallback((element) => {
    const newProducts = watchProducts.filter(product => product !== element.code);
    setValue("products", newProducts, { shouldDirty: true });
    setFilteredProducts(newProducts);
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

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleAddProduct = (event) => {
    const value = event.target.value;
    const newCodes = value.split(',').map(code => code.trim().toUpperCase()).filter(code => !!code);

    const error = newCodes.some(code => {
      if (code.includes(' ')) {
        toast.error(`El código [${code}] contiene espacios no permitidos`);
        return true;
      }
    });

    if (error) {
      return;
    }

    const validProducts = newCodes.filter(code => !watchProducts.includes(code) && !blacklist.includes(code));
    if (validProducts.length > 0) {
      const updatedProducts = [...watchProducts, ...validProducts];
      setValue("products", updatedProducts, { shouldDirty: true });
      setFilteredProducts(updatedProducts);
      setErrorFlag(false);
    }

    event.target.value = '';
  };

  const onKeyPress = (e) => handleEnterKeyPress(e, handleAddProduct);

  const { mutate, isPending } = useMutation({
    mutationFn: async (products) => {
      const { data } = await editBanProducts(products);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_BANNED_PRODUCTS_QUERY_KEY] });
        toast.success('Lista de productos bloquedos actualizada!');
        handleModalClose();
      } else {
        toast.error(response.message);
      }
    },
  });

  useEffect(() => {
    if (!isLoading) {
      setValue("products", blacklist);
      setFilteredProducts(blacklist);
    }
  }, [blacklist, isLoading, setValue]);

  const onFilter = useCallback((filter) => {
    const filtered = watchProducts.filter(product => product.toLowerCase().includes(filter.code.toLowerCase()));
    setFilteredProducts(filtered);
  }, [watchProducts]);

  return (
    <Transition animation="fade" duration={500} visible={open}>
      <Modal width="500px"
        closeIcon
        open={open}
        onClose={handleModalClose}
      >
        <Modal.Content>
          <Form onSubmit={handleSubmit(mutate)}>
            <FieldsContainer>
              <FormField width="100%">
                <RuledLabel title="Agregar código" message={errorFlag ? errorFlagMsg : ""} />
                <Input
                  height="30px"
                  type="text"
                  placeholder="Código"
                  onKeyPress={onKeyPress}
                />
              </FormField>
            </FieldsContainer>
            <FieldsContainer  >
              <Label>Productos vedados</Label>
              <Loader greyColor active={isLoading}>
                <Table
                  deleteButtonInside
                  tableHeight="40vh"
                  mainKey="code"
                  headers={BAN_PRODUCTS_COLUMNS}
                  elements={filteredProducts?.map(p => ({ code: p }))}
                  actions={actions}
                  filters={BAN_FILTERS}
                  onFilter={onFilter}
                  onManuallyRestore={() => setFilteredProducts(watchProducts)}
                ></Table>
              </Loader >
            </FieldsContainer>
            <ModalActions>
              <Button disabled={isPending || !isDirty} loading={isPending} type="submit" color="green" content="Aceptar" />
              <Button disabled={isPending} onClick={() => setOpen(false)} color="red" content="Cancelar" />
            </ModalActions>
          </Form>
        </Modal.Content>
      </Modal>
    </Transition>
  );
};

export default BanProduct;