"use client";
import { LIST_PRODUCTS_QUERY_KEY, deleteProduct } from "@/api/products";
import { ModalDelete } from "@/components/common/modals";
import { Table } from "@/components/common/table";
import { PAGES } from "@/constants";
import { Rules } from "@/visibilityRules";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import { toast } from "react-hot-toast";
import { FILTERS, PRODUCT_COLUMNS } from "../products.common";

const ProductsPage = ({ products = [], role }) => {
  const visibilityRules = Rules(role);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const queryClient = useQueryClient();

  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el producto "${name}"?`;

  const mapProductsForTable = useCallback((c) => {
    return c.map(customer => ({ ...customer, key: customer.code }));
  }, []);

  const actions = visibilityRules.canSeeActions ? [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (product) => {
        setSelectedProduct(product);
        setShowModal(true);
      },
      tooltip: 'Eliminar'
    }
  ] : [];

  const { mutate, isPending } = useMutation({
    mutationFn: async () => {
      const { data } = await deleteProduct(selectedProduct?.code);
      return data
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Producto eliminado!');
        setShowModal(false);
      } else {
        toast.error(response.message);
      }
    },
  });

  return (
    <>
      <Table
        mainKey="code"
        headers={PRODUCT_COLUMNS}
        elements={mapProductsForTable(products)}
        page={PAGES.PRODUCTS}
        actions={actions}
        filters={FILTERS}
      />
     
      <ModalDelete
        showModal={showModal}
        setShowModal={setShowModal}
        title={deleteQuestion(selectedProduct?.name)}
        onDelete={mutate}
        isLoading={isPending}
      />
    </>
  )
};

export default ProductsPage;
