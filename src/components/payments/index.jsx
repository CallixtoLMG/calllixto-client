import { PriceLabel } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import { COLORS, DATE_FORMATS, ICONS, SIZES } from "@/common/constants";
import { getFormatedDate, getSortedPaymentsByDate } from "@/common/utils/dates";
import { ModalAddPayment } from "@/components/payments/ModalAddPayment";
import { useMemo, useState } from "react";
import { Header, Popup } from "semantic-ui-react";
import { Box, Button, Flex, FlexColumn, Icon, OverflowWrapper, Segment } from "../../common/components/custom";
import { Table, TotalList } from "../../common/components/table";
import { calculateTotals } from "@/common/utils";

const getPaymentTableHeaders = () => [
  {
    id: 'date',
    title: 'Fecha de Pago',
    width: 2,
    value: (element) => (
      <Flex $columnGap="10px">
        {getFormatedDate(element.date, DATE_FORMATS.DATE_WITH_TIME)}
        {element.isOverdue && (
          <Popup
            content="Pago posterior a la fecha de vencimiento"
            position="top center"
            size={SIZES.MINI}
            trigger={<Icon name={ICONS.EXCLAMATION_CIRCLE} color={COLORS.RED} size={SIZES.SMALL} />}
          />
        )}
      </Flex>
    ),
  },
  {
    id: 'method',
    width: 4,
    title: 'Método',
    value: (element) => element.method
  },
  {
    id: 'amount',
    width: 3,
    title: 'Monto',
    value: (element) => <PriceLabel value={element.amount} />
  },
  {
    id: 'comments',
    width: 9,
    align: "left",
    title: 'Comentarios',
    value: (element) => (
      <OverflowWrapper maxWidth="30vw" popupContent={element.comments}>
        {element.comments}
      </OverflowWrapper>
    )
  }
];

const Payments = ({
  payments,
  isModalPaymentOpen,
  setIsModalPaymentOpen,
  showDeleteModal,
  setShowDeleteModal,
  total,
  isLoading,
  onAdd,
  onEdit,
  onDelete,
  allowUpdates,
}) => {
  const { totalPending, totalPaid } = useMemo(() => calculateTotals(payments, total), [payments, total]);
  const isTotalCovered = useMemo(() => totalPending <= 0, [totalPending]);
  const [paymentToEdit, setPaymentToEdit] = useState(null);
  const [paymentToDelete, setPaymentToDelete] = useState(null);
  const elements = useMemo(() => getSortedPaymentsByDate(payments), [payments]);

  const TOTAL_LIST_ITEMS = [
    { id: 1, title: "Pagado", amount: <PriceLabel value={totalPaid ?? 0} /> },
    { id: 2, title: "Pendiente", amount: <PriceLabel value={totalPending ?? 0} /> },
    { id: 3, title: "Total", amount: <PriceLabel value={total} /> },
  ];

  return (
    <Flex width="100%" className="ui form">
      <Segment $noBorder $noBoxShadow padding="14px 0">
        <Header>
          Detalle de Pagos
        </Header>
        <FlexColumn $rowGap="15px">
          {allowUpdates && (
            <>
              <Popup
                trigger={
                  <Box width="fit-content">
                    <Button
                      icon={ICONS.ADD}
                      isLoading={isLoading}
                      content="Agregar pago"
                      labelPosition="left"
                      color={COLORS.GREEN}
                      type="button"
                      onClick={() => {
                        setPaymentToEdit(null);
                        setIsModalPaymentOpen(true);
                      }}
                      disabled={isTotalCovered || isLoading}
                      width="fit-content"
                    />
                  </Box>
                }
                disabled={!isTotalCovered}
                content="El pago esta completo"
                position='right center'
                size={SIZES.TINY}
              />
              <ModalAddPayment
                open={isModalPaymentOpen}
                setIsModalPaymentOpen={setIsModalPaymentOpen}
                paymentData={paymentToEdit}
                totalPending={totalPending}
                isLoading={isLoading}
                totalListItem={TOTAL_LIST_ITEMS}
                onAdd={async (newPayment) => {
                  if (paymentToEdit) {
                    await onEdit({ ...paymentToEdit, ...newPayment });
                  } else {
                    await onAdd(newPayment);
                  }
                }}
              />
            </>
          )}
          <Flex width="100%">
            <Table
              headers={getPaymentTableHeaders()}
              elements={elements}
              {...allowUpdates && {
                actions: [
                  {
                    id: 1,
                    icon: ICONS.TRASH,
                    color: COLORS.RED,
                    onClick: (element) => {
                      setPaymentToDelete(element);
                      setShowDeleteModal(true);
                    },
                    tooltip: 'Eliminar',
                  },
                  {
                    id: 2,
                    icon: ICONS.EDIT,
                    color: COLORS.BLUE,
                    onClick: (element) => {
                      setPaymentToEdit(element);
                      setIsModalPaymentOpen(true);
                    },
                    tooltip: "Editar",
                    width: "100%"
                  }
                ]
              }}
              $deleteButtonInside
            />
          </Flex>
          <TotalList readOnly items={TOTAL_LIST_ITEMS} />
        </FlexColumn>
      </Segment>
      <ModalAction
        title="¿Estás seguro de que querés eliminar este pago?"
        onConfirm={async () => {
          await onDelete(paymentToDelete);
        }}
        showModal={showDeleteModal}
        setShowModal={setShowDeleteModal}
        confirmationWord="eliminar"
        placeholder='Escriba "eliminar" para confirmar'
        confirmButtonIcon={ICONS.TRASH}
        isLoading={isLoading}
      />
    </Flex>
  );
};

export default Payments;
