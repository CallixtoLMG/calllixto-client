import { DropdownControlled, SearchControlled, TextControlled } from "@/common/components/form";
import ModalAction from "@/common/components/modals/ModalAction";
import { Filters, Table } from '@/common/components/table';
import { BUTTON_TEXTS, COLORS, CONTENT_SIZES, DATE_FORMATS, ENTITIES, ICONS, PAGES, SELECT_ALL_OPTION } from "@/common/constants";
import { downloadExcel, getFormatedPercentage, handleUndefined } from '@/common/utils';
import { getFormatedDate } from "@/common/utils/dates";
import { useNavActionsContext } from "@/components/layout";
import { getTotal } from "@/components/products/products.utils";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from 'react-hook-form';
import { Form } from 'semantic-ui-react';
import { BUDGET_STATES, BUDGET_STATES_OPTIONS, BUDGET_STATE_TRANSLATIONS, PAYMENT_STATES_OPTIONS, getBudgetColumns } from "../budgets.constants";

export const downloadBudgetsExcel = (elements) => {
  if (!elements.length) return;
  let maxProductCount = 1;
  const mappedBudgets = elements.map(budget => {
    const translatedState = BUDGET_STATE_TRANSLATIONS[budget.state]?.singularTitle || budget.state || "";
    maxProductCount = Math.max(maxProductCount, budget.products?.length);
    const budgetRow = [
      handleUndefined(budget.id),
      handleUndefined(translatedState),
      handleUndefined(budget.customer.name),
      handleUndefined(getFormatedDate(budget.createdAt, DATE_FORMATS.DATE_WITH_TIME)),
      handleUndefined(budget.total),
      getFormatedPercentage(budget.globalDiscount),
      getFormatedPercentage(budget.additionalCharge),
      handleUndefined(budget.createdBy)
    ];

    const productData = budget.products.map(product => {
      let productName = handleUndefined(product.name);
      if (product.fractionConfig?.active) {
        productName = `${product.name} x ${product.fractionConfig.value} ${product.fractionConfig.unit}`;
      }
      return `Id: ${handleUndefined(product.id)}, Cantidad: ${handleUndefined(product.quantity)}, Nombre: ${productName}, Precio: ${product.price ?? 0}, Descuento: % ${product.discount ?? 0}, Total: ${getTotal(product)};`;
    });

    while (productData.length < maxProductCount) {
      productData.push('');
    }

    return [...budgetRow, ...productData];
  });

  const productsHeaders = Array.from({ length: maxProductCount }, (_, i) => `Producto ${i + 1}`);
  const headers = ['ID', 'Estado', 'Cliente', 'Fecha', "Total", "Descuento", "Cargo adicional", "Vendedor", ...productsHeaders];
  downloadExcel([headers, ...mappedBudgets], "Lista de ventas");
};

const BudgetsPage = ({
  budgets,
  filterControls,
  serverPagination,
  isLoading,
  onRefetch,
  usersOptions,
  sideActions = [],
  useSideActions: useExternalSideActions = false,
  onFilteredBudgetsChange,
}) => {
  const { push } = useRouter();
  const { setActions } = useNavActionsContext();
  const [filteredBudgets, setFilteredBudgets] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [isUpdateLoading, setIsUpdateLoading] = useState(false);
  const filteredBudgetsRef = useRef([]);
  const onRefetchRef = useRef(onRefetch);
  const shouldRegisterSideActions = sideActions.length > 0;
  const useSideActions = shouldRegisterSideActions || useExternalSideActions;

  useEffect(() => {
    onRefetchRef.current = onRefetch;
  }, [onRefetch]);

  useEffect(() => {
    filteredBudgetsRef.current = filteredBudgets;
  }, [filteredBudgets]);

  const handleQuickUpdate = useCallback(() => {
    onRefetchRef.current?.();
  }, []);

  const handleDownloadFilteredBudgets = useCallback(() => {
    downloadBudgetsExcel(filteredBudgetsRef.current);
  }, []);

  const handleConfirmHardUpdate = useCallback(async () => {
    setIsUpdateLoading(true);

    try {
      await onRefetchRef.current?.();
    } catch (error) {
      console.error("Error al consultar ventas:", error);
    }

    setIsUpdateLoading(false);
    setShowUpdateModal(false);
  }, []);

  const {
    onRestoreFilters,
    onSubmit,
    filters,
    draftFilters,
    setFilters,
    methods,
    appliedCount,
    hydrated
  } = filterControls;

  const { setValue } = methods;


  const budgetColumns = useMemo(
    () => getBudgetColumns(filters.state),
    [filters.state]
  );

  useEffect(() => {
    if (draftFilters.state !== BUDGET_STATES.CONFIRMED.id && draftFilters.paymentStatus && draftFilters.paymentStatus !== SELECT_ALL_OPTION.value) {
      setValue('paymentStatus', SELECT_ALL_OPTION.value, { shouldDirty: true });
    }
  }, [draftFilters.state, draftFilters.paymentStatus, setValue]);

  const actions = [
    {
      id: 1,
      icon: ICONS.COPY,
      color: COLORS.GREEN,
      onClick: (budget) => { push(PAGES.BUDGETS.CLONE(budget?.id)) },
      tooltip: 'Clonar'
    }
  ];

  const railActions = useMemo(() => {
    if (!shouldRegisterSideActions) return [];

    return [
      ...sideActions,
      {
        id: "update",
        icon: ICONS.SYNC_ALTERNATE,
        color: COLORS.BLUE,
        text: "Actualizar ventas",
        items: [
          {
            id: "quick-update",
            icon: ICONS.BOLT,
            color: COLORS.BLUE,
            text: "Actualización rápida",
            onClick: handleQuickUpdate,
          },
          {
            id: "hard-update",
            icon: ICONS.CLOUD_DOWNLOAD,
            color: COLORS.BLUE,
            text: "Actualización completa",
            onClick: () => setShowUpdateModal(true),
          },
        ],
        modal: (
          <ModalAction
            title={`¿Quieres realizar una actualización completa de ${PAGES.BUDGETS.NAME} ?  `}
            onConfirm={handleConfirmHardUpdate}
            confirmButtonText={BUTTON_TEXTS.UPDATE}
            confirmButtonIcon={ICONS.REFRESH}
            showModal={showUpdateModal}
            setShowModal={setShowUpdateModal}
            isLoading={isUpdateLoading}
            noConfirmation={true}
            bodyContent={
              <>
                Se volverá a consultar la página actual con sus filtros.
              </>
            }
            warning
          />
        ),
      },
      {
        id: "download-excel",
        icon: ICONS.FILE_EXCEL,
        onClick: handleDownloadFilteredBudgets,
        text: "Descargar ventas en Excel",
        width: CONTENT_SIZES.FIT,
        disabled: !filteredBudgets.length,
        showTooltipWhenExpanded: true,
      },
    ];
  }, [filteredBudgets.length, handleConfirmHardUpdate, handleDownloadFilteredBudgets, handleQuickUpdate, isUpdateLoading, shouldRegisterSideActions, showUpdateModal, sideActions]);

  useEffect(() => {
    if (!shouldRegisterSideActions) return;

    setActions(railActions);
  }, [railActions, setActions, shouldRegisterSideActions]);

  const handleFilteredBudgetsChange = useCallback((nextFilteredBudgets) => {
    setFilteredBudgets((currentFilteredBudgets) => {
      const hasSameBudgets =
        currentFilteredBudgets.length === nextFilteredBudgets.length &&
        currentFilteredBudgets.every((budget, index) => budget === nextFilteredBudgets[index]);

      return hasSameBudgets ? currentFilteredBudgets : nextFilteredBudgets;
    });
    onFilteredBudgetsChange?.(nextFilteredBudgets);
  }, [onFilteredBudgetsChange]);

  if (!hydrated) return null;
  return (
    <>
      <FormProvider {...methods}>
        <Form onSubmit={onSubmit}>
          <Filters
            remote
            entity={ENTITIES.BUDGETS}
            onRefetch={onRefetch}
            onRestoreFilters={onRestoreFilters}
            appliedCount={appliedCount}
            hydrated={hydrated}
            showRefetchAction={!useSideActions}
          >
            <DropdownControlled
              filter
              minWidth="150px"
              width={CONTENT_SIZES.MIN}
              name="state"
              label="Estado"
              options={BUDGET_STATES_OPTIONS}
              defaultValue={SELECT_ALL_OPTION.state}
            />
            <TextControlled
              width="8vw"
              minWidth="100px"
              name="id"
              label="Id"
              placeholder="MI525"
            />
            <TextControlled
              width="13vw"
              minWidth="120px"
              name="customer"
              label="Cliente"
              placeholder="Martín Bueno"
            />
            <SearchControlled
              width="13vw"
              minWidth="125px"
              name="createdBy"
              label="Vendedor"
              placeholder="Leandro Gómez"
              elements={usersOptions}
              searchFields={['text', 'value']}
              getResultProps={(option) => ({
                key: option.key,
                title: option.text,
                description: option.id,
                value: option.text,
              })}
              getDisplayValue={(value) => value ?? ''}
              onQueryChange={value => setValue('createdBy', value, { shouldDirty: true })}
              persistSelection
            />
            {draftFilters.state === BUDGET_STATES.CONFIRMED.id && (
              <DropdownControlled
                minWidth={CONTENT_SIZES.MIN}
                width="130px"
                filter
                name="paymentStatus"
                label="Estado de pago"
                options={PAYMENT_STATES_OPTIONS}
              />
            )}
          </Filters>
        </Form>
      </FormProvider >
      <Table
        isLoading={isLoading}
        headers={budgetColumns}
        elements={budgets}
        page={PAGES.BUDGETS}
        actions={actions}
        color={BUDGET_STATES[filters.state]?.color}
        serverPagination={serverPagination}
        paginate
        filters={filters}
        setFilters={setFilters}
        onDownloadExcel={useSideActions ? undefined : downloadBudgetsExcel}
        onFilteredElementsChange={useSideActions ? handleFilteredBudgetsChange : undefined}
        $ribbonOverflow
      />
    </>
  );
};

export default BudgetsPage;
