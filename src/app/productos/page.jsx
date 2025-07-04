"use client"
import { useUserContext } from "@/User";
import { useListProducts } from "@/api/products";
import { Button, DropdownItem, Icon } from "@/common/components/custom";
import { COLORS, ICONS, PAGES, SHORTKEYS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import { useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import BatchImport from "@/components/products/BatchImport";
import ProductsPage from "@/components/products/ProductsPage";
import { EXAMPLE_TEMPLATE_DATA, PRODUCT_STATES } from "@/components/products/products.constants";
import { getFormatedMargin } from "@/components/products/products.utils";
import { useKeyboardShortcuts, useValidateToken } from "@/hooks";
import { RULES } from "@/roles";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo } from "react";
import { Dropdown } from "semantic-ui-react";

const Products = () => {
  useValidateToken();
  const { role } = useUserContext();
  const { data, isLoading, isRefetching, refetch } = useListProducts();
  const { setLabels } = useBreadcrumContext();
  const { setActions } = useNavActionsContext();
  const { push } = useRouter();

  useEffect(() => {
    setLabels(['Productos']);
  }, [setLabels]);

  const products = useMemo(() => data?.products, [data]);
  const loading = useMemo(() => isLoading || isRefetching, [isLoading, isRefetching]);

  const handleDownloadExcel = useCallback(() => {
    if (!products) return;
    const headers = ['Código', 'Nombre', 'Marca', 'Proveedor', 'Costo', 'Precio', 'Margen', 'Estado', 'Comentarios'];
    const mappedPRoducts = products.map(product => {
      const productState = PRODUCT_STATES[product.state]?.singularTitle || product.state;
      return [
        product.code,
        product.name,
        product.brandName,
        product.supplierName,
        product.cost,
        product.price,
        getFormatedMargin(product.price, product.cost),
        productState,
        product.comments
      ];
    });
    downloadExcel([headers, ...mappedPRoducts], "Lista de Productos");
  }, [products]);

  useEffect(() => {
    const actions = [];

    if (RULES.canCreate[role]) {
      actions.push({
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
              as={Button}
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
                <DropdownItem onClick={() => downloadExcel(EXAMPLE_TEMPLATE_DATA, "Ejemplo de tabla")}>
                  <Icon name={ICONS.FILE_EXCEL_OUTLINE} />Plantilla
                </DropdownItem>
              </Dropdown.Menu>
            </Dropdown>
          )
        });
    }

    setActions(actions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [push, role, setActions, loading]);

  useKeyboardShortcuts(() => push(PAGES.PRODUCTS.CREATE), SHORTKEYS.ENTER);

  return (
    <>
      <ProductsPage
        onRefetch={refetch}
        isLoading={loading}
        products={loading ? [] : products}
      />
    </>
  );
};

export default Products;
