import { formatedPercentage } from '@/utils';
import { TotalList } from './';
import { PercentField, PriceLabel } from '../form';

const Title = styled(SHeader)`
  margin: 0!important;
  color: rgba(235,124,21,255) !important;
  align-content: center;
  align-self: center !important;
  text-align:  right !important;
  width: ${({ width = 'auto' }) => width}!important;
  font-weight: normal !important;
`;

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
        amount: <PriceLabel value={subtotal} />
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
          amount: <PriceLabel value={subtotalAfterDiscount} />
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
        amount: <PriceLabel value={subtotal} />
      },
      {
        id: 'global-discount',
        title: "Descuento",
        amount: (
          <PercentField
            value={globalDiscount}
            onChange={onGlobalDiscountChange}
            width="85px"
            height="35px"
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
            width="85px"
            height="35px"
          />
        )
      }
    );
  }

  items.push({
    id: 'total',
    title: <Title as="h4" width="100px" textAlign="right">TOTAL</Title>,
    amount: <Title as="h3"><PriceLabel value={total} /></Title>
  });

  return (
    <TotalList readOnly={readOnly} items={items} />
  );
};