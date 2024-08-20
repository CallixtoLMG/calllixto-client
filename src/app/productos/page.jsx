"use client"
import { useUserContext } from "@/User";
import { LIST_PRODUCTS_QUERY_KEY, useListProducts } from "@/api/products";
import { DropdownItem, Icon, IconedButton } from "@/components/common/custom";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { ENTITIES, PAGES, SHORTKEYS } from "@/constants";
import { useRestoreEntity } from "@/hooks/common";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel } from "@/utils";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Dropdown } from "semantic-ui-react";

const mockData = [
  ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
  ['AABB001', "Producto 1", 200, 'Comentarios...'],
  ['AABB002', "Producto 2", 300, 'Comentarios...'],
  ['AABB003', "Producto 3", 400, 'Comentarios...'],
];

const Products = () => {
  useValidateToken();
  const { role } = useUserContext();
  const { data, isLoading, isRefetching } = useListProducts();
  const restoreEntity = useRestoreEntity({ entity: ENTITIES.PRODUCTS, key: LIST_PRODUCTS_QUERY_KEY });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  const products = useMemo(() => data?.products, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  useEffect(() => {
    const handleRestore = async () => {
      await restoreEntity();
    };

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
          <Dropdown
            pointing
            as={IconedButton}
            text='Excel'
            icon='file excel'
            floating
            labeled
            button
            className='icon'
          >
            <Dropdown.Menu>
              <DropdownItem>
                <BatchImport key="batch-create" isCreating />
              </DropdownItem>
              <DropdownItem>
                <BatchImport key="batch-update" />
              </DropdownItem>
              <DropdownItem onClick={() => downloadExcel(mockData, "Ejemplo de tabla")}>
                <Icon name="download" />Plantilla
              </DropdownItem>
            </Dropdown.Menu>
          </Dropdown>
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
    actions.push({
      id: 6,
      icon: 'undo',
      color: 'grey',
      onClick: handleRestore,
      text: 'Actualizar',
      disabled: loading
    });
    setActions(actions);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.PRODUCTS.CREATE), SHORTKEYS.ENTER);

  return (
    <>
      {open && <BanProduct open={open} setOpen={setOpen} />}
      <ProductsPage
        isLoading={loading}
        products={loading ? [] : products}
        role={role}
      />
    </>
  );
};

export default Products;
