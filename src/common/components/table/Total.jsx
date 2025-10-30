import { getFormatedPercentage } from '@/common/utils';
import { Header } from 'semantic-ui-react';
import styled from 'styled-components';
import { TotalList } from '.';
import { PercentField, PriceLabel } from '../form';

const Title = styled(Header)`
  font-weight: bold !important;
`;

export const Total = ({
  readOnly,
  subtotal = 0,
  subtotalAfterDiscount = 0,
  globalDiscount = 0,
  onGlobalDiscountChange = () => { },
  additionalCharge = 0,
  onAdditionalChargeChange = () => { },
  total = 0,
}) => {
  const items = [];

  if (readOnly) {
    if (globalDiscount > 0 || additionalCharge > 0) {
      items.push(
        {
          id: 'sub-total',
          title: "Sub total",
          amount: <PriceLabel value={subtotal} />
        }
      );
    }
    if (globalDiscount > 0) {
      items.push(
        {
          id: 'discount',
          title: 'Descuento',
          amount: getFormatedPercentage(globalDiscount),
        },
        {
          id: 'sub-total-after-discount',
          title: 'Sub total',
          amount: <PriceLabel value={subtotalAfterDiscount} />
        }
      );
    }
    if (additionalCharge > 0) {
      items.push(
        {
          id: 'recharge',
          title: "Recargo",
          amount: getFormatedPercentage(additionalCharge),
        }
      );
    }
  } else {
    items.push(
      {
        id: 'sub-total',
        title: "Sub total",
        amount: <PriceLabel value={subtotal} />
      },
      {
        id: 'global-discount',
        title: "Descuento",
        amount: (
          <PercentField
            value={globalDiscount}
            onChange={onGlobalDiscountChange}
            width="100px"
          />
        )
      },
      {
        id: 'sub-total-global-discount',
        title: "Sub total",
        amount: <PriceLabel value={subtotalAfterDiscount} />
      },
      {
        id: 'recharge',
        title: "Recargo",
        amount: (
          <PercentField
            value={additionalCharge}
            onChange={onAdditionalChargeChange}
            width="100px"
          />
        )
      }
    );
  }

  items.push({
    id: 'total',
    title: <Title >TOTAL</Title>,
    amount: <Title ><PriceLabel value={total || 0} /></Title>
  });

  return (
    <TotalList readOnly={readOnly} items={items} />
  );
};