import { useConsumeStock } from "@/api/stock";
import { Button, FieldsContainer, Flex } from "@/common/components/custom";
import { NumberField, TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { Popup } from "semantic-ui-react";
import { FlexColumn } from "../../../common/components/custom";
import { Header } from "../../products/ProductStock/styles";
import { ADJUST_DELIVERY, DELIVERY, buildBudgetDeliveriesColumns, getDeliveryStats, hasInvalidStockQuantities } from "../budgets.constants";
import { isBudgetCancelled } from "../budgets.utils";

const BudgetDeliveries = ({ budgetId, onSuccess, state }) => {
  const consumeStock = useConsumeStock();

  const { control, setValue } = useFormContext();
  const [showModal, setShowModal] = useState(false);
  const [quantityByRow, setQuantityByRow] = useState({});
  const [commentsByRow, setCommentsByRow] = useState({});
  const [deliveryNote, setDeliveryNote] = useState("");
  const [mode, setMode] = useState(null);

  const watchedProducts = useWatch({ control, name: "products" });

  const products = useMemo(
    () => watchedProducts ?? [],
    [watchedProducts]
  );

  const operableProducts = useMemo(() => {
    if (!products?.length) return [];

    return products.filter(product => {
      const { delivered, pending } = getDeliveryStats(product);

      if (mode === DELIVERY) return pending > 0;
      if (mode === ADJUST_DELIVERY) return delivered > 0;

      return false;
    });
  }, [products, mode]);

  const hasInvalidQuantities = useMemo(
    () =>
      hasInvalidStockQuantities({
        products: operableProducts,
        quantities: quantityByRow,
        mode,
      }),
    [operableProducts, quantityByRow, mode]
  );

  const { mutate: consumeStockMutate, isPending } = useMutation({

    mutationFn: consumeStock,
    onSuccess: () => {

      toast.success(
        mode === DELIVERY
          ? 'Entrega registrada correctamente'
          : 'Entrega descontada correctamente'
      );
      onSuccess?.();
      resetModalState();
      setShowModal(false);
    },
    onError: (err) => {
      toast.error(err.message || 'Error al registrar movimiento');
    },
  });

  const buildFlows = () =>
    operableProducts
      .filter(p => quantityByRow[p.rowId] > 0)
      .map(p => ({
        productId: p.id,
        rowId: p.rowId,
        quantity: quantityByRow[p.rowId],
        comments: commentsByRow[p.rowId]?.trim() || undefined,
        date: new Date().toISOString(),
        stockControl: p.stockControl ?? true,
      }));

  const handleConfirm = () => {
    if (hasInvalidQuantities) {
      toast.error("Hay cantidades inválidas");
      return;
    }

    const flows = buildFlows();
    if (!flows.length) return;

    consumeStockMutate({
      deliveryNote,
      budgetId,
      inflow: mode === ADJUST_DELIVERY,
      flows,
    });
  };

  const handleFillAll = () => {
    const values = {};

    operableProducts.forEach(product => {
      const { delivered, pending } = getDeliveryStats(product);

      values[product.rowId] =
        mode === DELIVERY ? pending : delivered;
    });

    setQuantityByRow(values);
  };

  const handleResetModal = () => {
    setQuantityByRow({});
    setCommentsByRow({});
    setDeliveryNote("");
  };

  const resetModalState = () => {
    setQuantityByRow({});
    setCommentsByRow({});
    setDeliveryNote("");
    setMode(null);
  };

  const hasFlowsToSubmit = useMemo(() => {
    return operableProducts.some(
      (p) => Number(quantityByRow[p.rowId] ?? 0) > 0
    );
  }, [operableProducts, quantityByRow]);

  const headers = useMemo(
    () => buildBudgetDeliveriesColumns({
      create: false,
      setValue,
    }),
    [, setValue]
  );

  const modalColumns = useMemo(() => [
    {
      id: 1,
      title: "Producto",
      value: (product) => product.name,
      width: 6,
    },
    {
      id: 2,
      title: "Cantidad total",
      value: (product) => product.quantity,
      width: 4,
    },
    {
      id: 3,
      title: mode === DELIVERY ? "Pendiente" : "Entregado",
      value: (product) => {
        const { delivered, pending } = getDeliveryStats(product);
        return mode === DELIVERY ? pending : delivered;
      },
      width: 4,
    },
    {
      id: 4,
      title: "Cantidad",
      value: (product) => {
        const { pending, delivered } = getDeliveryStats(product);
        const maxAllowed =
          mode === DELIVERY
            ? pending
            : delivered;

        const currentValue = Number(quantityByRow[product.rowId] ?? 0);

        const hasError =
          currentValue > 0 && currentValue > maxAllowed;

        return (
          <FlexColumn className="ui form">
            <NumberField
              width="130px"
              padding="9.5px 14px"
              min={1}
              max={maxAllowed}
              value={currentValue}
              error={hasError ? "Cantidad inválida" : undefined}
              onChange={(v) =>
                setQuantityByRow(prev => ({
                  ...prev,
                  [product.rowId]: Number(v),
                }))
              }
            />
          </FlexColumn>
        );
      },
      width: 1,
    },
    {
      id: 5,
      title: "Comentario",
      value: (product) => (
        <TextField
          width="100%"
          placeholder="Aclaración (opcional)"
          value={commentsByRow[product.rowId] ?? ""}
          onChange={(e) =>
            setCommentsByRow(prev => ({
              ...prev,
              [product.rowId]: e.target.value,
            }))
          }
        />
      ),
      width: 4,
    },
  ], [mode, quantityByRow, commentsByRow]);

  const canDeliver = useMemo(
    () => products.some(product => getDeliveryStats(product).pending > 0),
    [products]
  );

  const canReturn = useMemo(
    () => products.some(product => getDeliveryStats(product).delivered > 0),
    [products]
  );

  const actions = [
    {
      id: "fill-row",
      icon: ICONS.ADD,
      color: COLORS.BLUE,
      tooltip: mode === DELIVERY
        ? "Completar entrega"
        : "Completar descuento",
      onClick: (product) => {
        const delivered = Number(product.delivered ?? 0);
        const pending = (product.quantity ?? 0) - delivered;

        setQuantityByRow(prev => ({
          ...prev,
          [product.rowId]:
            mode === DELIVERY
              ? pending
              : delivered,
        }));
      },
    },
  ]

  return (
    <>
      <FlexColumn width="100%" $rowGap="15px" className="ui form">
        <Flex $columnGap="15px" $justifyContent="space-between">
          <Header>Productos</Header>
          <Flex $columnGap="15px">
            <Button
              labelPosition="left"
              icon={ICONS.ARROW_UP}
              color={COLORS.GREEN}
              content="Entregar"
              disabled={!canDeliver || isBudgetCancelled(state)}
              onClick={() => {
                setMode(DELIVERY);
                setShowModal(true);
              }}
            />
            <Popup
              trigger={
                <Button
                  labelPosition="left"
                  icon={ICONS.ARROW_DOWN}
                  color={COLORS.ORANGE}
                  width="fit-content"
                  content="Descontar entregas"
                  disabled={!canReturn}
                  onClick={() => {
                    setMode(ADJUST_DELIVERY);
                    setShowModal(true);
                  }}
                />
              }
              content="Permite reducir unidades entregadas cuando se registró una entrega por error."
              position="top center"
              size="mini"
            />
          </Flex>
        </Flex>
        <Table
          mainKey="rowId"
          headers={headers}
          elements={products}
        />
      </FlexColumn>
      <ModalAction
        titleIcon={mode === DELIVERY ? ICONS.ARROW_UP : ICONS.ARROW_DOWN}
        title={mode === DELIVERY ? 'Registrar entrega' : 'Registrar descuento'}
        showModal={showModal}
        setShowModal={(open) => {
          if (!open) resetModalState();
          setShowModal(open);
        }}
        onConfirm={handleConfirm}
        isLoading={isPending}
        disableButtons={!hasFlowsToSubmit}
        noConfirmation
        size="large"
        bodyContent={
          <FieldsContainer $justifyContent="space-between" $rowGap="14px">
            <TextField
              width="250px"
              label="Remito"
              placeholder="0001"
              value={deliveryNote}
              onChange={(e) =>
                setDeliveryNote(e.target.value)
              }
            />

            <Flex $columnGap="14px" $alignSelf="self-end" >
              <Button
                width="fit-content"
                labelPosition="left"
                icon={ICONS.CHECK}
                color={COLORS.BLUE}
                content={mode === DELIVERY ? "Completar todo" : "Completar descuento"}
                onClick={handleFillAll}
              />
              <Button
                width="fit-content"
                labelPosition="left"
                color={COLORS.BROWN}
                icon={ICONS.UNDO}
                content="Restaurar"
                onClick={handleResetModal}
              />
            </Flex>
            <FlexColumn width="100%" $marginRight="30px">
              <Table
                mainKey="rowId"
                headers={modalColumns}
                elements={operableProducts}
                actions={actions}
              />
              <Flex $alignSelf="self-end">
                <small>Las cantidades ingresadas se restarán de las unidades entregadas actualmente.</small>
              </Flex>
            </FlexColumn>
          </FieldsContainer>
        }
      />
    </>
  );
};

export default BudgetDeliveries;
