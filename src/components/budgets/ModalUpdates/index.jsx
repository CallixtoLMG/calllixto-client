import { IconedButton } from "@/components/common/buttons";
import { ButtonsContainer } from "@/components/common/custom";
import { COLORS, ICONS, PRODUCT_STATES } from "@/constants";
import { formatedPrice } from "@/utils";
import { useMemo } from "react";
import { Message, Modal, Transition } from "semantic-ui-react";
import { MessageHeader, MessageItem } from "./styles";

const ModalUpdates = ({
  shouldShowModal,
  outdatedProducts,
  removedProducts,
  budget,
  onCancel,
  onConfirm
}) => {
  const messageItems = useMemo(() => (
    outdatedProducts.map(p => {
      const oldProduct = budget.products.find(op => op.code === p.code);
      const priceChanged = oldProduct.price !== p.price;
      const stateChanged = oldProduct.state !== p.state;
      const editablePriceBecameTrue = !oldProduct.editablePrice && p.editablePrice;
      const editablePriceBecameFalse = oldProduct.editablePrice && !p.editablePrice;
      const fractionConfigBecameActive = !oldProduct.fractionConfig?.active && p.fractionConfig?.active;
      const fractionConfigBecameInactive = oldProduct.fractionConfig?.active && !p.fractionConfig?.active;

      return (
        <MessageItem key={p.code}>
          {`${p.code} | ${p.name} | `}
          {priceChanged && (
            <>
              <span style={{ color: COLORS.RED }}>{formatedPrice(oldProduct.price)}</span>
              {' -> '}
              <span style={{ color: COLORS.GREEN }}>{formatedPrice(p.price)}</span>
            </>
          )}
          {stateChanged && (
            <>
              {' | Estado: '}
              <span style={{ color: PRODUCT_STATES[oldProduct.state].color }}>{PRODUCT_STATES[oldProduct.state].singularTitle}</span>
              {' -> '}
              <span style={{ color: PRODUCT_STATES[p.state].color }}>{PRODUCT_STATES[p.state].singularTitle}</span>
            </>
          )}
          {editablePriceBecameTrue && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>Ahora el precio es editable</span>
            </>
          )}
          {editablePriceBecameFalse && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>El precio ya no es editable</span>
            </>
          )}
          {fractionConfigBecameActive && p.fractionConfig?.active && (
            <>
              {' | '}
              <span style={{ color: COLORS.GREY }}>
                El producto ahora tiene la medida: {p.fractionConfig.value} {p.fractionConfig.unit}.
              </span>
            </>
          )}
          {fractionConfigBecameInactive && (
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
      <Modal closeOnDimmerClick={false} open={shouldShowModal} onClose={onCancel} size="large">
        <Modal.Header>¿Le gustaría actualizar el presupuesto debido a las recientes modificaciones en algunos productos?</Modal.Header>
        <Modal.Content>
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
                  <MessageItem key={p.code}>{`${p.code} | ${p.name} | ${formatedPrice(p.price)}.`}</MessageItem>
                ))}
              </Message.List>
            </Message>
          )}
        </Modal.Content>
        <Modal.Actions>
          <ButtonsContainer>
            <IconedButton
              text="Cancelar"
              icon={ICONS.CANCEL}
              color={COLORS.RED}
              onClick={onCancel}
            />
            <IconedButton
              text="Confirmar"
              icon={ICONS.CHECK}
              color={COLORS.GREEN}
              onClick={onConfirm}
            />
          </ButtonsContainer>
        </Modal.Actions>
      </Modal>
    </Transition>
  );
};

export default ModalUpdates;
