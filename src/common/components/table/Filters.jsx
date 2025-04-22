import { Button as CustomButton, DropdownItem, Flex } from '@/common/components/custom';
import ModalAction from '@/common/components/modals/ModalAction';
import { COLORS, ENTITIES, ICONS, PAGES } from "@/common/constants";
import { LIST_BRANDS_QUERY_KEY } from "@/components/brands/brands.constants";
import { LIST_BUDGETS_QUERY_KEY } from "@/components/budgets/budgets.constants";
import { LIST_CUSTOMERS_QUERY_KEY } from "@/components/customers/customers.constants";
import { LIST_PRODUCTS_QUERY_KEY } from "@/components/products/products.constants";
import { LIST_SUPPLIERS_QUERY_KEY } from '@/components/suppliers/suppliers.constants';
import { LIST_USERS_QUERY_KEY } from '@/components/users/users.constants';
import { useRestoreEntity } from '@/hooks/common';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Button, Dropdown, Icon, Popup } from 'semantic-ui-react';
import { IconedButton } from '../buttons';
import { FiltersContainer, HeaderSegment, MainContainer } from './styles';

const Filters = ({ children, onRestoreFilters, onRefetch, entity }) => {

  const ENTITY_MAPPING = {
    [ENTITIES.CUSTOMERS]: { queryKey: LIST_CUSTOMERS_QUERY_KEY, text: PAGES.CUSTOMERS.NAME },
    [ENTITIES.PRODUCTS]: { queryKey: LIST_PRODUCTS_QUERY_KEY, text: PAGES.PRODUCTS.NAME },
    [ENTITIES.BUDGETS]: { queryKey: LIST_BUDGETS_QUERY_KEY, text: PAGES.BUDGETS.NAME },
    [ENTITIES.BRANDS]: { queryKey: LIST_BRANDS_QUERY_KEY, text: PAGES.BRANDS.NAME },
    [ENTITIES.SUPPLIERS]: { queryKey: LIST_SUPPLIERS_QUERY_KEY, text: PAGES.SUPPLIERS.NAME },
    [ENTITIES.USERS]: { queryKey: LIST_USERS_QUERY_KEY, text: PAGES.USERS.NAME },
  };

  const { formState: { isDirty } } = useFormContext();
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { queryKey, text } = ENTITY_MAPPING[entity] || {};

  const restoreEntity = useRestoreEntity({ entity, key: queryKey });

  const handleHardUpdate = () => {
    setShowModal(true);
  };

  const handleConfirmHardUpdate = async () => {

    setIsLoading(true);

    if (!entity || !queryKey || typeof restoreEntity !== "function") {
      setIsLoading(false);
      return;
    }

    try {
      await restoreEntity();

    } catch (error) {
      console.error("Error en restoreEntity:", error);
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
        <Flex $columnGap="10px" $alignSelf="center">
          <IconedButton
            text="Buscar"
            icon={ICONS.SEARCH}
            submit
            color={isDirty ? COLORS.BLUE : undefined}
            width="130px"
          />
          <Dropdown width="130px" pointing as={CustomButton} text='Actualizar' icon={ICONS.REFRESH} floating labeled button className='icon'>
            <Dropdown.Menu>
              <DropdownItem onClick={onRefetch}>
                <Icon color={COLORS.BLUE} name={ICONS.DOWNLOAD} />Actualización rápida
              </DropdownItem>
              <DropdownItem onClick={handleHardUpdate}>
                <Icon color={COLORS.RED} name={ICONS.DOWNLOAD} />Actualización completa
              </DropdownItem>
            </Dropdown.Menu>
          </Dropdown>
        </Flex>
      </HeaderSegment>
      <ModalAction
        title={`¿Quieres realizar una actualización completa de ${text} ?  `}
        onConfirm={handleConfirmHardUpdate}
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
