import { Title } from '@/components/budgets/PDFfile/styles';
import { formatedPercentage } from '@/utils';
import { TotalList } from '.';
import { Flex, FormField, Input, Price } from '../custom';
import { Icon } from 'semantic-ui-react';

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
          <Input
            width="90px"
            height="35px"
            value={globalDiscount}
            iconPosition='right'
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/,/g, '.');
              const regex = /^[0-9]+([.,][0-9]*)?$/;
              if (regex.test(value) || value === '') {
                const parts = value.split(".");
                if (parts[1] && parts[1].length > 2) {
                  value = parts[0] + "." + parts[1].substring(0, 2);
                }
                if (value > 100) {
                  onGlobalDiscountChange(100);
                  return;
                }
                if (value < 0) {
                  onGlobalDiscountChange(0);
                  return;
                }
                onGlobalDiscountChange(value);
              }
            }}
            onFocus={(e) => e.target.select()}
          >
            <Icon name='percent' size='small' />
            <input />
          </Input>
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
          <Input
            width="90px"
            height="35px"
            value={additionalCharge}
            iconPosition='right'
            onChange={(e) => {
              let value = e.target.value;
              value = value.replace(/,/g, '.');
              const regex = /^[0-9]+([.,][0-9]*)?$/;
              if (regex.test(value) || value === '') {
                const parts = value.split(".");
                if (parts[1] && parts[1].length > 2) {
                  value = parts[0] + "." + parts[1].substring(0, 2);
                }
                if (value > 100) {
                  onAdditionalChargeChange(100);
                  return;
                }
                if (value < 0) {
                  onAdditionalChargeChange(0);
                  return;
                }
                onAdditionalChargeChange(value);
              }
            }}
            onFocus={(e) => e.target.select()}
          >
            <Icon name='percent' size='small' />
            <input />
          </Input>
        )
      }
    );
  }

  items.push({
    id: items.length + 1,
    title: <Title as="h4" width="100px" textAlign="right">TOTAL</Title>,
    amount: <Title as="h3"><Price value={total} /></Title>
  });

  return (
    <TotalList readOnly={readOnly} items={items} />
  );
};