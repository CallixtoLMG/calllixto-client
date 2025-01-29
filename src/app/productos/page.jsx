"use client"
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { IconedButton } from "@/components/common/buttons";
import { DropdownItem, Icon } from "@/components/common/custom";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { COLORS, ICONS, PAGES, PRODUCT_STATES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel, formatedPrice } from "@/utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
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
  const { data, isLoading, isRefetching, refetch } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLabels(['Productos']);
    refetch();
  }, [setLabels, refetch]);

  const products = useMemo(() => data?.products, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback(() => {
    if (!products) return;
    const headers = ['Código', 'Nombre', 'Marca', 'Proveedor', 'Precio', 'Estado', 'Comentarios'];
    const mappedPRoducts = products.map(product => {
      const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
      return [
        product.code,
        product.name,
        product.brandName,
        product.supplierName,
        formatedPrice(product.price),
        productState,
        product.comments
      ];
    });
    downloadExcel([headers, ...mappedPRoducts], "Lista de Productos");
  }, [products]);

  useEffect(() => {
    const actions = RULES.canCreate[role] ? [
      {
        id: 1,
        icon: ICONS.ADD,
        color: COLORS.GREEN,
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
            icon={ICONS.FILE_EXCEL}
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
              <DropdownItem onClick={handleDownloadExcel}>
                <Icon name={ICONS.DOWNLOAD} />Productos
              </DropdownItem>
              <DropdownItem onClick={() => downloadExcel(mockData, "Ejemplo de tabla")}>
                <Icon name={ICONS.FILE_EXCEL_OUTLINE} />Plantilla
              </DropdownItem>
            </Dropdown.Menu>
          </Dropdown>
        )
      },
      {
        id: 3,
        icon: ICONS.BAN,
        color: COLORS.RED,
        onClick: () => setOpen(true),
        text: 'Bloquear',
        basic: true
      },
    ] : [];
    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.PRODUCTS.CREATE), SHORTKEYS.ENTER);

  return (
    <>
      {open && <BanProduct open={open} setOpen={setOpen} />}
      <ProductsPage
        onRefetch={refetch}
        isLoading={loading}
        products={loading ? [] : products}
        role={role}
      />
    </>
  );
};

export default Products;
