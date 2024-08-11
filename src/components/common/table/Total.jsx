import { Divider, Title } from '@/components/budgets/PDFfile/styles';
import { formatedPercentage } from '@/utils';
import { Flex, FlexColumn, Input, Price } from '../custom';
import { Field } from '../form';

export const Total = ({
  readOnly,
  subtotal = 0,
  subtotalAfterDiscount = 0,
  globalDiscount = 0,
  onGlobalDiscountChange = () => { },
  additionalCharge = 0,
  onAdditionalChargeChange = () => { },
  finalTotal = 0,
  showAllways = true
}) => {

  return (
    <FlexColumn marginLeft="auto" rowGap={readOnly ? "0" : '5px'} width="250px">
      {(showAllways || !!globalDiscount) && (
        <>
          <Field label="Sub total"><Price value={subtotal} /></Field>
          <Divider />
          <Field label="Descuento">
            {!readOnly ?
              <Flex alignItems="center" justifyContent="flex-end" columnGap="10px">
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
                    };
                    if (value < 0) {
                      onGlobalDiscountChange(0);
                      return;
                    };
                    onGlobalDiscountChange(value);
                  }}
                />
                %
              </Flex>
              : <>{formatedPercentage(globalDiscount)}</>
            }
          </Field>
          <Divider />
        </>
      )}
      {(showAllways || !!additionalCharge) && (
        <>
          <Field label="Sub total"><Price value={subtotalAfterDiscount} /></Field>
          <Divider />
          <Field label="Recargo">
            {!readOnly ?
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
                    };
                    if (value < 0) {
                      onAdditionalChargeChange(0);
                      return;
                    };
                    onAdditionalChargeChange(value);
                  }}
                />
                %
              </Flex>
              : <>{formatedPercentage(additionalCharge)}</>
            }
          </Field>
          <Divider />
        </>
      )}
      <Flex justifyContent="space-between" height="30px">
        <Title as="h4" width="100px" textAlign="right">TOTAL</Title>
        <Title as="h3"><Price value={finalTotal} /></Title>
      </Flex>
    </FlexColumn>
  );
};
