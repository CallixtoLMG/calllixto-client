"use client";
import { deleteCustomer, edit, LIST_CUSTOMERS_QUERY_KEY, useGetCustomer } from "@/api/customers";
import ModalAction from "@/components/common/modals/ModalAction";
import CustomerForm from "@/components/customers/CustomerForm";
import CustomerView from "@/components/customers/CustomerView";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";

const Customer = ({ params }) => {
  useValidateToken();
  const { push } = useRouter();
  const { data: customer, isLoading } = useGetCustomer(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: true });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalAction, setModalAction] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
    setModalAction(null);
  };

  useEffect(() => {
    setLabels([PAGES.CUSTOMERS.NAME, customer?.name]);
  }, [customer, setLabels]);


  const { mutate, isPending } = useMutation({
    mutationFn: async (customer) => {
      const { data } = await edit(customer);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Cliente actualizado!');
        push(PAGES.CUSTOMERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: async () => {
      const response = await deleteCustomer(params.id);
      return response;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success('Cliente eliminado permanentemente!');
        queryClient.invalidateQueries({ queryKey: [LIST_CUSTOMERS_QUERY_KEY], refetchType: "all" });
        push(PAGES.CUSTOMERS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const modalConfig = useMemo(() => ({
    hardDelete: {
      header: "¿Está seguro que desea eliminar PERMANENTEMENTE este cliente?",
      confirmText: "eliminar",
      icon: ICONS.TRASH
    },
  }), []);

  const handleActionConfirm = async () => {
    if (modalAction === "hardDelete") {
      mutateDelete();
    } else {
      mutate(customer);
    }
    handleModalClose();
  };

  useEffect(() => {
    if (customer) {
      const actions = [
        {
          id: 1,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: () => {
            setModalAction("hardDelete");
            setIsModalOpen(true);
          },
          text: "Eliminar",
          loading: isDeletePending,
        },
      ];

      setActions(actions);
    }
  }, [customer, setActions, isPending, isDeletePending]);

  if (!isLoading && !customer) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading}>
      {Toggle}
      {isUpdating ? (
        <CustomerForm
          customer={customer}
          onSubmit={mutate}
          isLoading={isPending}
          isUpdating
        />
      ) : (
        <CustomerView customer={customer} />
      )}
      <ModalAction
        title={modalConfig[modalAction]?.header}
        onConfirm={handleActionConfirm}
        confirmationWord={modalConfig[modalAction]?.confirmText}
        confirmButtonIcon={modalConfig[modalAction]?.icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isPending || isDeletePending}
      />
    </Loader>
  );
};

export default Customer;
