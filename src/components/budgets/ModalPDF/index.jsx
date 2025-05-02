import { IconnedButton } from "@/components/common/buttons";
import { ButtonsContainer, Flex, FlexColumn, FormField, IconedButton, Label, Segment } from "@/components/common/custom";
import { BUDGET_PDF_FORMAT, COLORS, ICONS } from "@/constants";
import { Modal, Transition } from "semantic-ui-react";
import { Input } from "@/components/common/custom";
import { useEffect, useRef, useState } from "react";
import { useDolarExangeRate } from "@/api/external";
import { OnlyPrint } from "@/components/layout";
import PDFfile from "../PDFfile";
import { useReactToPrint } from "react-to-print";

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
  const [showPrices, setShowPrices] = useState(false);

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
        <Modal size="large" closeIcon open={isModalOpen} onClose={() => onClose(false)}>
          <Modal.Header>Opciones de Impresión</Modal.Header>
          <Modal.Content>
            <FlexColumn rowGap="15px">
              <Flex columnGap="5px" wrap="wrap" rowGap="5px">
                {Object.values(BUDGET_PDF_FORMAT).map(({ key, title }) => (
                  <IconedButton
                    key={key}
                    paddingLeft="fit-content"
                    width="fit-content"
                    basic={printPdfMode !== key}
                    color={COLORS.BLUE}
                    type="button"
                    onClick={() => {
                      console.log({ printPdfMode, key });
                      setPrintPdfMode(key);
                    }}
                  >
                    {title}
                  </IconedButton>
                ))}
              </Flex>
              <Input
                textAlignLast="right"
                innerWidth="90px"
                type="text"
                height="35px"
                width="fit-content"
                onChange={handleDollarChange}
                actionPosition='left'
                placeholder="Precio"
                value={formattedDolarRate}
                disabled={!showDolarExangeRate}
                action={
                  <IconnedButton
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
              <IconnedButton
                text="Mostrar Precios"
                icon={ICONS.EYE}
                onClick={() => setShowPrices(prev => !prev)}
                basic={!showPrices}
              />
            </FlexColumn>
          </Modal.Content>
          <Modal.Actions>
            <ButtonsContainer width="100%">
              <IconnedButton
                text="Cancelar"
                icon={ICONS.CANCEL}
                color={COLORS.RED}
                onClick={() => onClose(false)}
              />
              <IconnedButton
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
        </Modal>
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