import { useDolarExangeRate } from "@/api/external";
import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, Flex, FlexColumn, Input } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { OnlyPrint } from "@/components/layout";
import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { Modal, Segment, Transition } from "semantic-ui-react";
import PDFfile from "../PDFfile";
import { BUDGET_PDF_FORMAT } from "../budgets.constants";
import styled from "styled-components";

const StyledModal = styled(Modal)`
  width: 80vw !important;
  height: 90vh !important;
  overflow: auto;
`;

const ModalPDF = ({
  budget,
  isModalOpen,
  onClose,
  client,
  total,
  subtotal,
  subtotalAfterDiscount,
  selectedContact
}) => {
  const printRef = useRef();
  const [printPdfMode, setPrintPdfMode] = useState(BUDGET_PDF_FORMAT.CLIENT.key);
  const [formattedDolarRate, setFormattedDolarRate] = useState('');
  const [showDolarExangeRate, setShowDolarExangeRate] = useState(false);
  const { data: dolar } = useDolarExangeRate({ enabled: showDolarExangeRate });
  const [dolarRate, setDolarRate] = useState(dolar);
  const [initialDolarRateSet, setInitialDolarRateSet] = useState(false);
  const [showPrices, setShowPrices] = useState(true);

  useEffect(() => {
    if (dolar && showDolarExangeRate && !initialDolarRateSet) {
      setDolarRate(dolar);
      setFormattedDolarRate(formatValue(dolar));
      setInitialDolarRateSet(true);
    }
    if (!showDolarExangeRate) {
      setInitialDolarRateSet(false);
    }
  }, [dolar, initialDolarRateSet, showDolarExangeRate]);

  const formatValue = (value) => {
    const formattedValue = value?.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return formattedValue?.includes('.') ? formattedValue.split('.').slice(0, 2).join('.') : formattedValue;
  };

  const handleDollarChange = (e) => {
    let value = e.target.value;
    value = value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    if (parts.length > 1) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    } else {
      value = parts[0];
    }
    const numericValue = parseFloat(value.replace(/,/g, ''));

    setFormattedDolarRate(value);
    setDolarRate(numericValue);
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    removeAfterPrint: true,
  });

  return (
    <>
      <Transition visible={isModalOpen} animation='scale' duration={500}>
        <StyledModal closeIcon open={isModalOpen} onClose={() => onClose(false)} width="90vw" height="90vh">
          <Modal.Header>Opciones de Impresión</Modal.Header>
          <Modal.Content>
            <FlexColumn $rowGap="15px">
              <Flex $columnGap="15px" wrap="wrap" $rowGap="5px">
                {Object.values(BUDGET_PDF_FORMAT).map(({ key, title, icon }) => (
                  <IconedButton
                    key={key}
                    text={title}
                    icon={icon}
                    paddingLeft="fit-content"
                    width="fit-content"
                    basic={printPdfMode !== key}
                    color={COLORS.BLUE}
                    onClick={() => {
                      setPrintPdfMode(key);
                    }}
                  />
                ))}
                <IconedButton
                  text="Mostrar Precios"
                  icon={ICONS.EYE}
                  color={COLORS.BLUE}
                  onClick={() => setShowPrices(prev => !prev)}
                  basic={!showPrices}
                />
                <Input
                  type="text"
                  height="35px"
                  width="150px"
                  onChange={handleDollarChange}
                  actionPosition='left'
                  placeholder="Precio"
                  value={formattedDolarRate}
                  disabled={!showDolarExangeRate}
                  action={
                    <IconedButton
                      text="Cotizar en USD"
                      icon={ICONS.DOLLAR}
                      color={COLORS.GREEN}
                      basic={!showDolarExangeRate}
                      onClick={() => {
                        setShowDolarExangeRate(prev => !prev);
                        if (!showDolarExangeRate) {
                          setFormattedDolarRate(formatValue(dolarRate));
                        } else {
                          setFormattedDolarRate('');
                          setDolarRate(0);
                        }
                      }}
                    />
                  }
                />
              </Flex>
              <Segment>
              <PDFfile
                ref={printRef}
                budget={budget}
                client={client}
                id={client?.id}
                printPdfMode={printPdfMode}
                subtotal={subtotal}
                subtotalAfterDiscount={subtotalAfterDiscount}
                total={total}
                selectedContact={selectedContact}
                dolarExchangeRate={showDolarExangeRate && dolarRate}
                showPrices={showPrices}
              />
              </Segment>
            </FlexColumn>
          </Modal.Content>
          <Modal.Actions>
            <ButtonsContainer width="100%">
              <IconedButton
                text="Cancelar"
                icon={ICONS.CANCEL}
                color={COLORS.RED}
                onClick={() => onClose(false)}
              />
              <IconedButton
                text="Imprimir"
                icon={ICONS.CHECK}
                submit
                color={COLORS.GREEN}
                onClick={() => {
                  setTimeout(handlePrint);
                }}
              />
            </ButtonsContainer>
          </Modal.Actions>
        </StyledModal>
      </Transition>
      <OnlyPrint marginTop="20px">
        <PDFfile
          ref={printRef}
          budget={budget}
          client={client}
          id={client?.id}
          printPdfMode={printPdfMode}
          subtotal={subtotal}
          subtotalAfterDiscount={subtotalAfterDiscount}
          total={total}
          selectedContact={selectedContact}
          dolarExchangeRate={showDolarExangeRate && dolarRate}
          showPrices={showPrices}
        />
      </OnlyPrint>
    </>
  );
};

export default ModalPDF;