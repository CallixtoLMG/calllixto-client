import ModalAction from '@/components/common/modals/ModalAction';
import { COLORS, ICONS } from '@/constants';
import { useRestoreEntity } from '@/hooks/common';
import { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { Dropdown } from '../common/custom';

const OptionsDropdown = ({ entity, queryKey, text }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const restoreEntity = useRestoreEntity({ entity, key: queryKey });

  const handleRestoreClick = () => {
    setShowModal(true);
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    if (entity && queryKey && restoreEntity) {
      await restoreEntity();
    }
    setIsLoading(false);
    setShowModal(false);
  };

  const options = [
    {
      key: 'restore',
      text: `Actualizar ${text}`,
      icon: <Icon name={ICONS.REFRESH} color={COLORS.GREY} />,
      onClick: handleRestoreClick,
    }
  ];

  return (
    <>
      <Dropdown
        hideBorder
        noBgColor="transparent"
        width="fit-content"
        height="100%"
        iconMargin="0"
        item
        icon={<Icon size='large' name={ICONS.OPTIONS} color={COLORS.ORANGE} />}
        direction="bottom"
      >
        <Dropdown.Menu>
          {options.map(option => (
            <Dropdown.Item
              key={option.key}
              icon={option.icon}
              text={option.text}
              onClick={option.onClick}
            />
          ))}
        </Dropdown.Menu>
      </Dropdown>
      <ModalAction
        title={`¿Actualizar ${text}?`}
        onConfirm={handleConfirm}
        confirmButtonText="Actualizar"
        confirmButtonIcon={ICONS.REFRESH}
        showModal={showModal}
        setShowModal={setShowModal}
        isLoading={isLoading}
        noConfirmation={true}
        bodyContent={
          <>
            Esta acción puede tomar varios minutos en completarse, no se recomienda ejecutarla de manera frecuente!
            Si no encuentras un elemento en las tablas, podrías probar primero usando el ícono de <strong>&quot;Actualizar&quot;</strong> al lado del botón <strong>&quot;Buscar&quot;</strong>.
          </>
        }
        warning
      />
    </>
  );
};

export default OptionsDropdown;
