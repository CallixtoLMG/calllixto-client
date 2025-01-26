import { Title } from '@/components/budgets/PDFfile/styles';
import { formatedPercentage } from '@/utils';
import { TotalList } from '.';
import { PercentInput, Price } from '../custom';

export const Total = ({
  readOnly,
  subtotal = 0,
  subtotalAfterDiscount = 0,
  globalDiscount = 0,
  onGlobalDiscountChange = () => {},
  additionalCharge = 0,
  onAdditionalChargeChange = () => {},
  total = 0,
}) => {

  const items = [];

  if (readOnly && (globalDiscount > 0 || additionalCharge > 0)) {
    items.push(
      {
        id: 'sub-total',
        title: "Sub total",
        amount: <Price value={subtotal} />
      }
    );
    if (globalDiscount > 0) {
      items.push(
        {
          id: 'discount',
          title: 'Descuento',
          amount: formatedPercentage(globalDiscount),
        },
        {
          id: 'sub-total-after-discount',
          title: 'Sub total',
          amount: <Price value={subtotalAfterDiscount} />
        }
      );
    }
    if (additionalCharge > 0) {
      items.push(
        {
          id: 'recharge',
          title: "Recargo",
          amount: formatedPercentage(additionalCharge),
        }
      );
    }
  } else {
    items.push(
      {
        id: 'sub-total',
        title: "Sub total",
        amount: <Price value={subtotal} />
      },
      {
        id: 'global-discount',
        title: "Descuento",
        amount: (
          <PercentInput
            value={globalDiscount}
            onChange={onGlobalDiscountChange}
            width="90px"
            height="35px"
          />
        )
      },
      {
        id: 'sub-total-global-discount',
        title: "Sub total",
        amount: <Price value={subtotalAfterDiscount} />
      },
      {
        id: 'recharge',
        title: "Recargo",
        amount: (
          <PercentInput
            value={additionalCharge}
            onChange={onAdditionalChargeChange}
            width="90px"
            height="35px"
          />
        )
      }
    );
  }

  items.push({
    id: 'total',
    title: <Title as="h4" width="100px" textAlign="right">TOTAL</Title>,
    amount: <Title as="h3"><Price value={total} /></Title>
  });

  return (
    <TotalList readOnly={readOnly} items={items} />
  );
};