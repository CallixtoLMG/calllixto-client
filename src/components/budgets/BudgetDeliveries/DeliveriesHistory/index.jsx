import { Flex, FlexColumn, Icon, OverflowWrapper } from "@/common/components/custom";
import { COLORS, DATE_FORMATS, ICONS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import React, { useState } from "react";
import { Accordion, AccordionContent, AccordionTitle } from "./styles";

const DeliveriesHistory = ({ history }) => {

  const [activeHistory, setActiveHistory] = useState(false);
  const [activeIndexes, setActiveIndexes] = useState([]);

  const handleHistoryClick = () => {
    setActiveHistory(!activeHistory);
  };

  const handleEntryClick = (index) => {
    setActiveIndexes((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index);
      }
      return [...prev, index];
    });
  };

  return (
    <Accordion fluid styled>
      <AccordionTitle
        active={activeHistory}
        onClick={handleHistoryClick}
      >
        <Icon name="dropdown" />
        Historial
      </AccordionTitle>
      <Accordion.Content active={activeHistory} >
        <Accordion fluid styled>
          {history?.map((entry, index) => {
            const isReturn = entry.inflow === true;
            return (
              <React.Fragment key={entry.id}>
                <Accordion.Title
                  active={activeIndexes.includes(index)}
                  index={index}
                  onClick={() => handleEntryClick(index)}
                >
                  <Flex>
                    <Icon color={isReturn ? COLORS.ORANGE : COLORS.GREEN} name={ICONS.DROPDOWN} />
                    <Flex $columnGap="5px">
                      <Flex $columnGap="10px" width="70px" > {isReturn ? "Descuento" : "Entrega"} </Flex>
                      🕒{getFormatedDate(entry.date, DATE_FORMATS.DATE_WITH_TIME_SECONDS)}
                      {entry.deliveryNote &&
                        <OverflowWrapper
                          popupContent={entry.deliveryNote}
                          maxWidth="30vw"
                        >{`–  Remito: ${entry.deliveryNote}`}
                        </OverflowWrapper>}
                    </Flex>
                  </Flex>
                </Accordion.Title>
                <AccordionContent active={activeIndexes.includes(index)}>
                  <FlexColumn $rowGap="5px">
                    {entry.rows.map((row, index) => (
                      <Flex $textWrapMode="nowrap" $columnGap="10px" key={index}>
                        <span><strong> Id: </strong>{row.productId}</span>
                        <OverflowWrapper
                          popupContent={row.productName}
                          maxWidth="30vw"
                        >
                          <span><strong> Nombre: </strong>{row.productName}</span>
                        </OverflowWrapper>
                        <span><strong> Cantidad: </strong>{row.quantity}</span>
                        {row.comments && (
                          <OverflowWrapper
                            $alignSelf="left"
                            popupContent={row.comments}
                            maxWidth="50%"
                          >
                            <span><strong>Comentario:</strong> {row.comments}</span>
                          </OverflowWrapper>
                        )}
                        {row.dispatchComment && (
                          <OverflowWrapper
                            $alignSelf="left"
                            popupContent={row.dispatchComment}
                            maxWidth="50%"
                          >
                            <span>Comentario producto: {row.dispatchComment}</span>
                          </OverflowWrapper>
                        )}
                      </Flex>
                    ))}
                  </FlexColumn>
                </AccordionContent>
              </React.Fragment>
            );
          })}
        </Accordion>
      </Accordion.Content>
    </Accordion>
  );
};

export default DeliveriesHistory;