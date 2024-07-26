"use client";
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { PopupActions } from "@/components/common/buttons";
import { usePaginationContext } from "@/components/common/table/Pagination";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { ATTRIBUTES } from "@/components/products/products.common";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button, Icon } from "semantic-ui-react";

const mockData = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

const Products = () => {
  useValidateToken();
  const { role } = useUserContext();
  const { handleEntityChange } = usePaginationContext();

  useEffect(() => {
    handleEntityChange(ENTITIES.PRODUCTS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data, isLoading } = useListProducts({ sort: 'date', order: false, attributes: [ATTRIBUTES.NAME, ATTRIBUTES.PRICE, ATTRIBUTES.CODE, ATTRIBUTES.COMMENTS, ATTRIBUTES.BRAND_NAME, ATTRIBUTES.SUPPLIER_NAME] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: 'add',
        color: 'green',
        onClick: () => { push(PAGES.PRODUCTS.CREATE) },
        text: 'Crear'
      },
      {
        id: 2,
        button: (
          <PopupActions
            title="Excel"
            icon="file excel"
            color="blue"
            buttons={
              [
                <BatchImport key="batch-create" isCreating />,
                <BatchImport key="batch-update" />,
                <Button
                  size="small"
                  icon
                  labelPosition="left"
                  key="batch-template"
                  color="blue"
                  onClick={() => downloadExcel(mockData, "Ejemplo de tabla")}
                >
                  <Icon name="download" />Plantilla
                </Button>
              ]
            }
          />
        )
      },
      {
        id: 5,
        icon: 'ban',
        color: 'red',
        onClick: () => setOpen(true),
        text: 'Bloquear'
      },
    ] : [];
    setActions(actions);
  }, [push, role, setActions]);

  useKeyboardShortcuts(() => push(PAGES.PRODUCTS.CREATE), SHORTKEYS.ENTER);

  return (
    <>
      {open && <BanProduct open={open} setOpen={setOpen} />}
      <ProductsPage
        isLoading={isLoading}
        products={data?.products}
        role={role}
      />
    </>
  );
};

export default Products;
