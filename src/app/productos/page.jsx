"use client"
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { DropdownItem, Icon, IconedButton } from "@/components/common/custom";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BanProduct from "@/components/products/BanProduct";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { ATTRIBUTES } from "@/components/products/products.common";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { downloadExcel, formatedPrice } from "@/utils";
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
  const { data, isLoading, isRefetching } = useListProducts({ attributes: [ATTRIBUTES.NAME, ATTRIBUTES.PRICE, ATTRIBUTES.CODE, ATTRIBUTES.COMMENTS, ATTRIBUTES.BRAND_NAME, ATTRIBUTES.SUPPLIER_NAME, ATTRIBUTES.FRACTION_CONFIG, ATTRIBUTES.EDITABLE_PRICE] });
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  const products = useMemo(() => data?.products, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const prepareProductDataForExcel = useMemo(() => {
    if (!products) return [];
    const headers = ['Código', 'Nombre', 'Marca', 'Proveedor', 'Precio', 'Comentarios'];

    const productData = products.map(product => [
      product.code,
      product.name,
      product.brandName,
      product.supplierName,
      formatedPrice(product.price),
      product.comments
    ]);

    return [headers, ...productData];
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
              <DropdownItem onClick={() => {
                downloadExcel(prepareProductDataForExcel, "Lista de Productos");
              }}>
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
        text: 'Bloquear'
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
        isLoading={loading}
        products={loading ? [] : products}
        role={role}
      />
    </>
  );
};

export default Products;
