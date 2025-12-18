import { Flex } from "@/common/components/custom";
import { DATE_FORMATS } from "@/common/constants";
import { getFormatedDate } from "@/common/utils/dates";
import Payments from "@/components/payments";
import { FormProvider } from "react-hook-form";
import { Form } from "semantic-ui-react";
import { TextField } from "../../form";

const EntityPayments = ({
  total,
  entityState,
  isCancelled = () => false,
  isUpdating,
  isLoading,
  methods,
  dueDate,
  onAdd,
  onEdit,
  onDelete,
  payment,
  refetchPayment,
  showDeleteModal,
  setShowDeleteModal,
  isModalPaymentOpen,
  setIsModalPaymentOpen,
}) => {

  return (
    <>
      {!isCancelled(entityState) && dueDate && (
        <Flex $justifyContent="space-between">
          <TextField
            width="20%"
            value={getFormatedDate(dueDate, DATE_FORMATS.ONLY_DATE)}
            label="Fecha de Vencimiento"
            disabled
          />
        </Flex>
      )}
      <FormProvider {...methods}>
        <Form >
          <Payments
            entityState={entityState}
            payment={payment}
            onAdd={onAdd}
            onEdit={onEdit}
            onDelete={onDelete}
            deleteButtonInside
            padding="14px 0"
            noBorder
            noBoxShadow
            update={isUpdating}
            total={total}
            dueDate={dueDate}
            refetchPayment={refetchPayment}
            isCancelled={isCancelled}
            isLoading={isLoading}
            showDeleteModal={showDeleteModal}
            setShowDeleteModal={setShowDeleteModal}
            isModalPaymentOpen={isModalPaymentOpen}
            setIsModalPaymentOpen={setIsModalPaymentOpen}
          />
        </Form>
      </FormProvider>
    </>
  );
};

EntityPayments.displayName = "EntityPayments";

export default EntityPayments;
