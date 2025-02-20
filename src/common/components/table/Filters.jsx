import { LIST_BRANDS_QUERY_KEY } from "@/api/brands";
import { LIST_CUSTOMERS_QUERY_KEY } from "@/api/customers";
import { LIST_PRODUCTS_QUERY_KEY } from "@/api/products";
import { LIST_SUPPLIERS_QUERY_KEY } from "@/api/suppliers";
import { Button as CustomButton, DropdownItem, Flex } from '@/common/components/custom';
import ModalAction from '@/common/components/modals/ModalAction';
import { COLORS, ENTITIES, ICONS, PAGES } from "@/common/constants";
import { useRestoreEntity } from '@/hooks/common';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Dropdown, Icon, Popup } from 'semantic-ui-react';
import { IconedButton } from '../buttons';
import { FiltersContainer, HeaderSegment, MainContainer } from './styles';

const ENTITY_MAPPING = {
  [ENTITIES.CUSTOMERS]: { queryKey: LIST_CUSTOMERS_QUERY_KEY, text: PAGES.CUSTOMERS.NAME },
  [ENTITIES.PRODUCTS]: { queryKey: LIST_PRODUCTS_QUERY_KEY, text: PAGES.PRODUCTS.NAME },
  [ENTITIES.BUDGETS]: { queryKey: "listAllBudgets", text: PAGES.BUDGETS.NAME },
  [ENTITIES.BRANDS]: { queryKey: LIST_BRANDS_QUERY_KEY, text: PAGES.BRANDS.NAME },
  [ENTITIES.SUPPLIERS]: { queryKey: LIST_SUPPLIERS_QUERY_KEY, text: PAGES.SUPPLIERS.NAME },
};

// const entityMapping = {
//   [PAGES.CUSTOMERS.BASE]: { entity: ENTITIES.CUSTOMERS, queryKey: LIST_CUSTOMERS_QUERY_KEY, text: PAGES.CUSTOMERS.NAME },
//   [PAGES.PRODUCTS.BASE]: { entity: ENTITIES.PRODUCTS, queryKey: LIST_PRODUCTS_QUERY_KEY, text: PAGES.PRODUCTS.NAME },
//   [PAGES.BUDGETS.BASE]: { entity: ENTITIES.BUDGETS, queryKey: LIST_BUDGETS_QUERY_KEY, text: PAGES.BUDGETS.NAME },
//   [PAGES.BRANDS.BASE]: { entity: ENTITIES.BRANDS, queryKey: LIST_BRANDS_QUERY_KEY, text: PAGES.BRANDS.NAME },
//   [PAGES.SUPPLIERS.BASE]: { entity: ENTITIES.SUPPLIERS, queryKey: LIST_SUPPLIERS_QUERY_KEY, text: PAGES.SUPPLIERS.NAME },
// };

const Filters = ({ children, onRestoreFilters, onRefetch, entity }) => {
  // agregar el mapeo aca sin entityt
  const { formState: { isDirty } } = useFormContext();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const { queryKey, text } = ENTITY_MAPPING[entity] || {};

  // Hook para restaurar la entidad (antes estaba en OptionsDropdown)
  const restoreEntity = useRestoreEntity({ entity, key: queryKey });

  // Abre el modal de confirmación
  const handleStrongUpdateClick = () => {
    setShowModal(true);
  };

  // Confirma y ejecuta restoreEntity
  const handleConfirm = async () => {
    console.log("Ejecutando handleConfirm...");
    console.log("Entity:", entity);
    console.log("QueryKey:", queryKey);
    console.log("RestoreEntity (función):", restoreEntity);

    setIsLoading(true);

    if (!entity || !queryKey || typeof restoreEntity !== "function") {
      console.warn("No se pudo ejecutar restoreEntity, revisa los valores.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Llamando a restoreEntity...");
      const response = await restoreEntity();
      console.log("Respuesta de restoreEntity:", response);
      console.log("restoreEntity ejecutado correctamente.");
    } catch (error) {
      console.error("Error al ejecutar restoreEntity:", error);
    }

    setIsLoading(false);
    setShowModal(false);
  };



  return (
    <MainContainer>
      <HeaderSegment flex="1">
        <FiltersContainer>
          <Popup
            content="Restaurar filtros"
            position="top center"
            size="tiny"
            trigger={(
              <Button circular icon type="button" onClick={onRestoreFilters}>
                <Icon name={ICONS.UNDO} />
              </Button>
            )}
          />
          {children}
        </FiltersContainer>

        <Flex columnGap="10px" alignSelf="center">
          <IconedButton
            text="Buscar"
            icon={ICONS.SEARCH}
            submit
            color={isDirty ? COLORS.PRIMARY : COLORS.SOFT_GREY}
            width="130px"
          />

          <Dropdown width="130px" pointing as={CustomButton} text='Actualizar' icon={ICONS.REFRESH} floating labeled button className='icon'>
            <Dropdown.Menu>
              <DropdownItem onClick={onRefetch}>
                <Icon color={COLORS.BLUE} name={ICONS.DOWNLOAD} />Actualización rápida
              </DropdownItem>
              <DropdownItem onClick={handleStrongUpdateClick}>
                <Icon color={COLORS.RED} name={ICONS.DOWNLOAD} />Actualización completa
              </DropdownItem>
            </Dropdown.Menu>
          </Dropdown>
        </Flex>
      </HeaderSegment>
      <ModalAction
        title={`¿Quieres realizar una actualización completa de ${text} ?  `}
        onConfirm={handleConfirm}
        confirmButtonText="Sí, Actualizar"
        confirmButtonIcon={ICONS.REFRESH}
        showModal={showModal}
        setShowModal={setShowModal}
        isLoading={isLoading}
        noConfirmation={true}
        bodyContent={
          <>
            <strong>¡Atención!</strong> Esta acción puede tomar varios minutos en completarse, no se recomienda ejecutarla de manera frecuente!
            Si no encuentras un elemento en las tablas, podrías probar primero usando opción de <strong>&quot;Actualización ligera&quot;</strong>.
          </>
        }
        warning
      />
    </MainContainer>
  );
}

export default Filters;
