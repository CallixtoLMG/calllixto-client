import { IconedButton } from "@/common/components/buttons";
import { Flex, FlexColumn, Icon } from "@/common/components/custom";
import { NumberField, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Popup } from "semantic-ui-react";
import { Header } from "../../products/ProductStock/styles";
import { getDeliveryStats } from "../budgets.constants";

const CreateBudgetDeliveriesForm = () => {
  const { control, setValue } = useFormContext();

  const watchedProducts = useWatch({ control, name: "products" });

  const products = useMemo(
    () => watchedProducts ?? [],
    [watchedProducts]
  );

  const deliveryNote = useWatch({ control, name: "deliveryNote", });
  const canCompleteAll = useMemo(() => {
    return products.some((product) => {
      const { pending } = getDeliveryStats(product);
      return pending > 0;
    });
  }, [products]);

  const columns = useMemo(() => [
    {
      id: 1,
      title: "ID",
      key: "id",
      sortable: true,
      value: (product) => {
        const { isCompleted } = getDeliveryStats(product);
        return (
          <Flex $columnGap="10px" justifyContent="space-between">
            {product.id}
            {isCompleted && (
              <Popup
                trigger={
                  <Flex $alignItems="center" >
                    {isCompleted && (
                      <Icon
                        dollar
                        name={ICONS.CHECK}
                        color={COLORS.GREEN}
                      />
                    )}
                  </Flex>
                }
                content="Entrega completa"
                position="right center"
                size="mini"
              />
            )}
          </Flex>
        );
      },
      width: 1,
    },
    {
      id: 2,
      title: "Producto",
      value: (product) => product.name,
      width: 6,
    },
    {
      id: 3,
      title: "Cantidad",
      value: (product) => product.quantity,
      width: 2,
    },
    {
      id: 4,
      title: "Entregar ahora",
      value: (product, index) => {
        const { pending } = getDeliveryStats(product);
        return (
          <Flex className="ui form">
            <NumberField
              width="150px"
              padding="9.5px 14px"
              min={0}
              max={pending}
              error={
                Number(product.delivered ?? 0) > Number(product.quantity ?? 0)
                  ? "No puede ser mayor que la cantidad vendida"
                  : undefined
              }
              value={product.delivered ?? 0}
              onChange={(v) => {
                const numericValue = Number(v ?? 0);

                setValue(
                  `products.${index}.delivered`,
                  numericValue,
                  {
                    shouldDirty: true,
                    shouldValidate: true,
                  }
                );
              }}
            />
          </Flex>
        );
      },
      width: 1,
    },
    {
      id: 5,
      key: "pending",
      title: "Pendiente",
      value: (product) => {
        const { pending } = getDeliveryStats(product);
        return pending;
      },
      sortValue: (product) => getDeliveryStats(product).pending,
      width: 2,
    },
    {
      id: 6,
      title: "Comentario",
      value: (product, index) => (
        <TextField
          width="100%"
          placeholder="Entrega parcial"
          value={product.deliveryComment ?? ""}
          onChange={(e) =>
            setValue(
              `products.${index}.deliveryComment`,
              e.target.value,
              { shouldDirty: true }
            )
          }
        />
      ),
      width: 4,
    },
  ], [setValue]);

  const handleCompleteAll = () => {
    products.forEach((product, index) => {
      setValue(
        `products.${index}.delivered`,
        Number(product.quantity ?? 0),
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    });
  };

  const handleCompleteRow = (product, index) => {
    setValue(
      `products.${index}.delivered`,
      Number(product.quantity ?? 0),
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  };

  const actions = [
    {
      id: 1,
      icon: ICONS.ADD,
      color: COLORS.BLUE,
      onClick: (product, index) => {
        handleCompleteRow(product, index);
      },
      tooltip: 'Completar entrega',
      width: "100%",
      disabled: !canCompleteAll
    },
  ];

  return (
    <FlexColumn width="100%" $rowGap="20px">
      <Flex $columnGap="15px" $justifyContent="space-between">
        <Header>Productos</Header>
        <Flex $columnGap="15px">
          <TextField
            width="250px"
            label="Remito"
            placeholder="0001"
            value={deliveryNote ?? ""}
            onChange={(e) =>
              setValue("deliveryNote", e.target.value, {
                shouldDirty: true,
              })
            }
          />
          <IconedButton
            text="Completar entrega"
            icon={ICONS.ADD}
            color={COLORS.BLUE}
            onClick={handleCompleteAll}
            alignSelf="end"
            disabled={!canCompleteAll}
            height="38px"
          />
        </Flex>
      </Flex>
      <Table
        mainKey="rowId"
        headers={columns}
        elements={products}
        actions={actions}
        $actionButtonInside
      />
    </FlexColumn>
  );
};

export default CreateBudgetDeliveriesForm;
