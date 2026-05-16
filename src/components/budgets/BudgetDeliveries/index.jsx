import { useConsumeStock } from "@/api/stock";
import { IconedButton } from "@/common/components/buttons";
import { FieldsContainer, Flex, OverflowWrapper } from "@/common/components/custom";
import { NumberField, TextField } from "@/common/components/form";
import { ModalAction } from "@/common/components/modals";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useMemo, useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import toast from "react-hot-toast";
import { FlexColumn } from "../../../common/components/custom";
import { Header } from "../../products/ProductStock/styles";
import { ADJUST_DELIVERY, DELIVERY, buildBudgetDeliveriesColumns, getDeliveryStats, hasInvalidStockQuantities } from "../budgets.constants";
import { isBudgetCancelled } from "../budgets.utils";

const BudgetDeliveries = ({ budgetId, onSuccess, state, canPrint, onPrint }) => {
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

    operableProducts.forEach((product) => {
      values[product.rowId] = getRowTargetQuantity(product);
    });

    setQuantityByRow(values);
  };

  const handleClearAll = () => {
    const values = {};

    operableProducts.forEach((product) => {
      values[product.rowId] = 0;
    });

    setQuantityByRow(values);
  };

  const handleToggleAll = () => {
    if (areAllRowsCompleted) {
      handleClearAll();
    } else {
      handleFillAll();
    }
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

  const getRowTargetQuantity = useCallback((product) => {
    const { delivered, pending } = getDeliveryStats(product);

    return mode === DELIVERY ? pending : delivered;
  }, [mode]);

  const handleFillRow = (product) => {
    setQuantityByRow((prev) => ({
      ...prev,
      [product.rowId]: getRowTargetQuantity(product),
    }));
  };

  const handleClearRow = (product) => {
    setQuantityByRow((prev) => ({
      ...prev,
      [product.rowId]: 0,
    }));
  };

  const areAllRowsCompleted = useMemo(() => {
    if (!operableProducts.length) return false;

    return operableProducts.every((product) => {
      const current = Number(quantityByRow[product.rowId] ?? 0);
      const target = Number(getRowTargetQuantity(product) ?? 0);
      return current === target;
    });
  }, [operableProducts, quantityByRow, getRowTargetQuantity]);

  const hasAnyRowValue = useMemo(() => {
    return operableProducts.some(
      (product) => Number(quantityByRow[product.rowId] ?? 0) > 0
    );
  }, [operableProducts, quantityByRow]);

  const modalColumns = useMemo(() => [
    {
      id: 1,
      title: "Producto",
      value: (product) => (
        <OverflowWrapper maxWidth="20vw" popupContent={product.name}>
          {product.name}
        </OverflowWrapper>
      ),
      width: 6,
      align: "left",
    },
    {
      id: 2,
      title: "Cantidad total",
      value: (product) => product.quantity,
      width: 1,
    },
    {
      id: 3,
      title: mode === DELIVERY ? "Pendiente" : "Entregado",
      value: (product) => {
        const { delivered, pending } = getDeliveryStats(product);
        return mode === DELIVERY ? pending : delivered;
      },
      width: 1,
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
          placeholder="Aclaración"
          value={commentsByRow[product.rowId] ?? ""}
          onChange={(e) =>
            setCommentsByRow(prev => ({
              ...prev,
              [product.rowId]: e.target.value,
            }))
          }
        />
      ),
      width: 5,
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
      icon: (product) => {
        const current = Number(quantityByRow[product.rowId] ?? 0);
        const target = Number(getRowTargetQuantity(product) ?? 0);

        return current === target ? ICONS.MINUS : ICONS.ADD;
      },
      color: (product) => {
        const current = Number(quantityByRow[product.rowId] ?? 0);
        const target = Number(getRowTargetQuantity(product) ?? 0);

        return current === target ? COLORS.ORANGE : COLORS.BLUE;
      },
      tooltip: (product) => {
        const current = Number(quantityByRow[product.rowId] ?? 0);
        const target = Number(getRowTargetQuantity(product) ?? 0);

        return current === target ? "Limpiar fila" : "Completar fila"
      },
      onClick: (product) => {
        const current = Number(quantityByRow[product.rowId] ?? 0);
        const target = Number(getRowTargetQuantity(product) ?? 0);

        if (current === target) {
          handleClearRow(product);
        } else {
          handleFillRow(product);
        }
      },
    },
  ];

  return (
    <>
      <FlexColumn width="100%" $rowGap="15px" className="ui form">
        <Flex $columnGap="15px" $justifyContent="space-between">
          <Header>Productos</Header>
          <Flex $columnGap="15px">
            <IconedButton
              labelPosition="left"
              icon={ICONS.ARROW_UP}
              color={COLORS.GREEN}
              text={!canDeliver ? "Se han entregado todos los productos" : "Entregar productos"}
              disabled={!canDeliver || isBudgetCancelled(state)}
              onClick={() => {
                setMode(DELIVERY);
                setShowModal(true);
              }}
              iconOnly
            />
            <IconedButton
              labelPosition="left"
              icon={ICONS.ARROW_DOWN}
              color={COLORS.ORANGE}
              disabled={!canReturn}
              onClick={() => {
                setMode(ADJUST_DELIVERY);
                setShowModal(true);
              }}
              iconOnly
              popupPosition="top left"
              popupContent={
                <>
                  <strong><div>Descontar entregas</div></strong>
                  <div>Permite reducir unidades entregadas cuando se registró una entrega por error.</div>
                </>
              }
            />
            {canPrint && (
              <IconedButton
                icon={ICONS.PRINT}
                color={COLORS.BLUE}
                text="Imprimir entregas"
                onClick={onPrint}
                iconOnly
                popupPosition="top left"
              />
            )}
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
            <Flex $columnGap="14px" $alignSelf="flex-end" >
              <IconedButton
                icon={areAllRowsCompleted ? ICONS.UNDO : ICONS.ADD}
                color={areAllRowsCompleted ? COLORS.ORANGE : COLORS.BLUE}
                text={
                  areAllRowsCompleted
                    ? (mode === DELIVERY ? "Limpiar todo" : "Limpiar descuento")
                    : (mode === DELIVERY ? "Completar todas las entregas" : "Completar descuento")
                }
                onClick={handleToggleAll}
                disabled={!operableProducts.length}
                iconOnly
                popupPosition="top left"
              />
            </Flex>
            <FlexColumn width="100%" >
              <Table
                mainKey="rowId"
                headers={modalColumns}
                elements={operableProducts}
                actions={actions}
                $actionButtonInside
              />
              <Flex $alignSelf="flex-end">
                {mode === ADJUST_DELIVERY &&
                  <small>Las cantidades ingresadas se restarán de las unidades entregadas actualmente.</small>
                }
              </Flex>
            </FlexColumn>
          </FieldsContainer>
        }
      />
    </>
  );
};

export default BudgetDeliveries;
