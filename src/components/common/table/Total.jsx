import { Title } from '@/components/budgets/PDFfile/styles';
import { formatedPercentage } from '@/utils';
import { TotalList } from '.';
import { Flex, Input, Price } from '../custom';

export const Total = ({
  readOnly,
  subtotal = 0,
  subtotalAfterDiscount = 0,
  globalDiscount = 0,
  onGlobalDiscountChange = () => { },
  additionalCharge = 0,
  onAdditionalChargeChange = () => { },
  finalTotal = 0,
}) => {

  const items = [];

  if (readOnly) {
    if ((globalDiscount > 0 || additionalCharge > 0)) {
      items.push(
        {
          id: 1,
          title: "Sub total",
          amount: <Price value={subtotal} />
        }
      );

      if (globalDiscount > 0) {
        items.push(
          {
            id: 2,
            title: "Descuento",
            amount: formatedPercentage(globalDiscount),
          },
          {
            id: 3,
            title: "Sub total",
            amount: <Price value={subtotalAfterDiscount} />
          }
        );
      }

      if (additionalCharge > 0) {
        items.push(
          {
            id: globalDiscount > 0 ? 4 : 2,
            title: "Recargo",
            amount: formatedPercentage(additionalCharge),
          }
        );
      }
    }
  } else {
    items.push(
      {
        id: 1,
        title: "Sub total",
        amount: <Price value={subtotal} />
      }
    );

    items.push(
      {
        id: 2,
        title: "Descuento",
        amount: (
          <Flex rowGap="5px" alignItems="center" justifyContent="flex-end" columnGap="10px">
            <Input
              $marginBottom
              width="80px"
              center
              height="30px"
              type="number"
              value={globalDiscount}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value = e.target.value;
                if (value > 100) {
                  onGlobalDiscountChange(100);
                  return;
                }
                if (value < 0) {
                  onGlobalDiscountChange(0);
                  return;
                }
                onGlobalDiscountChange(value);
              }}
            />
            %
          </Flex>
        )
      },
      {
        id: 3,
        title: "Sub total",
        amount: <Price value={subtotalAfterDiscount} />
      }
    );

    items.push(
      {
        id: 4,
        title: "Recargo",
        amount: (
          <Flex alignItems="center" justifyContent="flex-end" columnGap="10px">
            <Input
              $marginBottom
              width="80px"
              center
              height="30px"
              type="number"
              value={additionalCharge}
              onFocus={(e) => e.target.select()}
              onChange={(e) => {
                const value = e.target.value;
                if (value > 100) {
                  onAdditionalChargeChange(100);
                  return;
                }
                if (value < 0) {
                  onAdditionalChargeChange(0);
                  return;
                }
                onAdditionalChargeChange(value);
              }}
            />
            %
          </Flex>
        )
      }
    );
  }

  items.push({
    id: items.length + 1,
    title: <Title as="h4" width="100px" textAlign="right">TOTAL</Title>,
    amount: <Title as="h3"><Price value={finalTotal} /></Title>
  });

  return (
    <TotalList readOnly={readOnly} items={items} />
  );
};