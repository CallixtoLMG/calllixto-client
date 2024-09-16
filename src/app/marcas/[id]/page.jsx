"use client";
import { useUserContext } from "@/User";
import { LIST_BRANDS_QUERY_KEY, deleteBrand, edit, useGetBrand } from "@/api/brands";
import BrandForm from "@/components/brands/BrandForm";
import BrandView from "@/components/brands/BrandView";
import ModalAction from "@/components/common/modals/ModalAction";
import { Loader, useBreadcrumContext, useNavActionsContext } from "@/components/layout";
import { COLORS, ICONS, PAGES } from "@/constants";
import { useAllowUpdate } from "@/hooks/allowUpdate";
import { useValidateToken } from "@/hooks/userData";
import { RULES } from "@/roles";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

const modalConfig = {
  header: "¿Está seguro que desea eliminar PERMANENTEMENTE esta marca?",
  confirmText: "eliminar",
  icon: ICONS.TRASH
};

const Brand = ({ params }) => {
  useValidateToken();
  const { role } = useUserContext();
  const { push } = useRouter();
  const { data: brand, isLoading } = useGetBrand(params.id);
  const { setLabels } = useBreadcrumContext();
  const { resetActions, setActions } = useNavActionsContext();
  const [isUpdating, Toggle] = useAllowUpdate({ canUpdate: RULES.canUpdate[role] });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const queryClient = useQueryClient();
  const [activeAction, setActiveAction] = useState(null); // Estado para la acción activa

  useEffect(() => {
    resetActions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  useEffect(() => {
    setLabels([PAGES.BRANDS.NAME, brand?.name]);
  }, [setLabels, brand]);

  const { mutate, isPending } = useMutation({
    mutationFn: async (brand) => {
      const { data } = await edit(brand);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca actualizada!");
        push(PAGES.BRANDS.BASE);
      } else {
        toast.error(response.message);
      }
    },
  });

  const { mutate: mutateDelete, isPending: isDeletePending } = useMutation({
    mutationFn: () => {
      return deleteBrand(params.id);
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success("Marca eliminada permanentemente!");
        queryClient.invalidateQueries({ queryKey: [LIST_BRANDS_QUERY_KEY], refetchType: "all" });
        push(PAGES.BRANDS.BASE);
      } else {
        toast.error(response.message);
      }
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleActionConfirm = async () => {
    setActiveAction("delete"); 
    handleModalClose();       
  
    mutateDelete({}, {
      onSettled: () => setActiveAction(null), 
    });
  };

  useEffect(() => {
    if (brand) {
      const actions = [
        {
          id: 1,
          icon: ICONS.TRASH,
          color: COLORS.RED,
          onClick: () => {
            setIsModalOpen(true);
          },
          text: "Eliminar",
          loading: isDeletePending,
          disabled: isDeletePending,
        },
      ];

      setActions(actions);
    }
  }, [brand, setActions, isPending, isDeletePending]);

  if (!isLoading && !brand) {
    push(PAGES.NOT_FOUND.BASE);
  }

  return (
    <Loader active={isLoading}>
      {Toggle}
      {isUpdating ? (
        <BrandForm
          brand={brand}
          onSubmit={mutate}
          isLoading={isPending}
          isUpdating
        />
      ) : (
        <BrandView brand={brand} />
      )}
      <ModalAction
        title={modalConfig.header}
        onConfirm={handleActionConfirm}
        confirmationWord={modalConfig.confirmText}
        confirmButtonIcon={modalConfig.icon}
        showModal={isModalOpen}
        setShowModal={setIsModalOpen}
        isLoading={isPending || isDeletePending}
      />
    </Loader>
  );
};

export default Brand;
