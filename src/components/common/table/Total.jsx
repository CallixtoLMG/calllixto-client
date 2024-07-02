import { formatedPercentage, getSubtotal } from '@/utils';
import { useMemo } from "react";
import { Flex } from 'rebass';
import {
  Label,
  Table,
  TableBody,
  TableRow,
} from 'semantic-ui-react';
import { Input, Price } from '../custom';
import { Cell } from './styles';

export const Total = ({
  readOnly,
  subtotal = 0,
  globalDiscount = 0,
  onGlobalDiscountChange = () => { },
  additionalCharge = 0,
  onAdditionalChargeChange = () => { },
}) => {
  const subtotalAfterDiscount = useMemo(() => getSubtotal(subtotal, -globalDiscount), [subtotal, globalDiscount]);
  const finalTotal = useMemo(() => getSubtotal(subtotalAfterDiscount, additionalCharge), [subtotalAfterDiscount, additionalCharge]);

  return (
    <Flex ml="auto">
      <Table celled>
        <TableBody>
          <TableRow>
            <Cell width={1} align="right">Sub total</Cell>
            <Cell><Price value={subtotal} /></Cell>
          </TableRow>
          <TableRow>
            <Cell align="left">
              <Label ribbon color="olive">Descuento</Label>
            </Cell>
            <Cell>
              {!readOnly ?
                <Flex alignItems="center" justifyContent="flex-end" style={{ gridColumnGap: '10px' }}>
                  <Input
                    $marginBottom
                    width="75px"
                    center
                    height="35px"
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
                : <>{formatedPercentage(globalDiscount)}</>}
            </Cell>
          </TableRow>
          <TableRow>
            <Cell align="right">Sub total</Cell>
            <Cell><Price value={subtotalAfterDiscount} /></Cell>
          </TableRow>
          <TableRow>
            <Cell align="left">
              <Label ribbon color="pink">Recargo</Label>
            </Cell>
            <Cell>
              {!readOnly ?
                <Flex alignItems="center" justifyContent="flex-end" style={{ gridColumnGap: '10px' }}>
                  <Input
                    $marginBottom
                    width="75px"
                    center
                    height="35px"
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
                : <>{formatedPercentage(additionalCharge)}</>}
            </Cell>
          </TableRow>
          <TableRow>
            <Cell align="right">
              <b>Total</b>
            </Cell>
            <Cell><b><Price value={finalTotal} /></b></Cell>
          </TableRow>
        </TableBody>
      </Table>
    </Flex>
  );
};
