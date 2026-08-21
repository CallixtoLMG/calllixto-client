import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, Icon, Message } from "@/common/components/custom";
import { BUTTON_TEXTS, COLORS, ICONS, SIZES } from "@/common/constants";
import { getFormatedPrice } from "@/common/utils";
import { PRODUCT_STATES } from "@/components/products/products.constants";
import { useEffect, useMemo, useRef } from "react";
import { getBudgetProductChanges } from "../productUpdates.utils";
import { Modal, Transition } from "semantic-ui-react";
import { MessageHeader, MessageItem, ModalContent } from "./styles";
const ModalProductUpdates = ({
  shouldShowModal,
  outdatedProducts,
  removedProducts,
  budget,
  onCancel,
  onConfirm
}) => {
  const confirmButtonRef = useRef(null);

  useEffect(() => {
    if (shouldShowModal) {
      const timeout = setTimeout(() => {
        confirmButtonRef.current?.focus();
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [shouldShowModal]);

  const messageItems = useMemo(() => (
    outdatedProducts.map(p => {
      const oldProduct = budget.products.find(op => op.id === p.id);
      const changes = getBudgetProductChanges(oldProduct, p);

      return (
        <MessageItem key={p.id}>
          {`${p.id} | ${p.name} | `}
          {changes.price.changed && (
            <>
              <span style={{ color: COLORS.RED }}>{getFormatedPrice(changes.price.oldValue)}</span>
              {' -> '}
              <span style={{ color: COLORS.GREEN }}>{getFormatedPrice(changes.price.newValue)}</span>
            </>
          )}
          {changes.state.changed && (
            <>
              {' Estado: '}
              <span style={{ color: PRODUCT_STATES[changes.state.oldValue].color }}>{PRODUCT_STATES[changes.state.oldValue].singularTitle}</span>
              {' -> '}
              <span style={{ color: PRODUCT_STATES[changes.state.newValue].color }}>{PRODUCT_STATES[changes.state.newValue].singularTitle}</span>
            </>
          )}
          {changes.editablePrice.changed && changes.editablePrice.newValue && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>Ahora el precio es editable</span>
            </>
          )}
          {changes.editablePrice.changed && !changes.editablePrice.newValue && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>El precio ya no es editable</span>
            </>
          )}
          {changes.fractionConfigActive.changed && changes.fractionConfigActive.newValue && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>
                El producto ahora tiene la medida: {p.fractionConfig.value} {p.fractionConfig.unit}.
              </span>
            </>
          )}
          {changes.fractionConfigActive.changed && !changes.fractionConfigActive.newValue && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>Este producto ya no usa medidas.</span>
            </>
          )}
        </MessageItem>
      );
    })
  ), [outdatedProducts, budget]);

  return (
    <Transition visible={shouldShowModal} animation='scale' duration={500}>
      <Modal
        closeOnDimmerClick={false}
        open={shouldShowModal}
        onClose={onCancel}
        size={SIZES.LARGE}
        data-testid="budget-product-updates-modal"
      >
        <Modal.Header>¿Le gustaría actualizar el presupuesto debido a las recientes modificaciones en algunos productos?</Modal.Header>
        <Message margin="10px 21px 0 21px" size="mini" >Confirmar esta acción solo actualizará el <strong>PRECIO</strong> de los productos, de lo contrario mantendrán el precio anterior.<Icon name={ICONS.INFO_CIRCLE}/></Message>
        <ModalContent>
          {!!outdatedProducts.length && (
            <Message>
              <MessageHeader>Productos con cambios</MessageHeader>
              <Message.List>
                {messageItems}
              </Message.List>
            </Message>
          )}
          {!!removedProducts.length && (
            <Message>
              <MessageHeader>Productos no disponibles</MessageHeader>
              <Message.List>
                {removedProducts.map(p => (
                  <MessageItem key={p.id}>{`${p.id} | ${p.name} | ${getFormatedPrice(p.price)}.`}</MessageItem>
                ))}
              </Message.List>
            </Message>
          )}
        </ModalContent>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              text={BUTTON_TEXTS.CANCEL}
              icon={ICONS.CANCEL}
              color={COLORS.RED}
              onClick={onCancel}
              dataTestId="budget-product-updates-keep-previous-button"
            />
            <IconedButton
              text="Confirmar"
              icon={ICONS.CHECK}
              color={COLORS.GREEN}
              onClick={onConfirm}
              ref={confirmButtonRef}
              dataTestId="budget-product-updates-apply-current-button"
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalProductUpdates;
