import {
  TableRow,
  TableBody,
  Label,
  Table,
} from 'semantic-ui-react';
import { Flex } from 'rebass';
import { Input, Price } from '../custom';
import { Cell } from './styles';

export const Total = ({
  total = 0,
  globalDiscount,
  onGlobalDiscountChange = () => {},
  additionalCharge = 0,
  onAdditionalChargeChange = () => {},
}) => (
  <Flex ml="auto">
    <Table celled>
      <TableBody>
        <TableRow>
          <Cell width={1} align="right">Sub total</Cell>
          <Cell><Price value={total} /></Cell>
        </TableRow>
        <TableRow>
          <Cell align="left">
            <Label ribbon color="olive">Descuento</Label>
          </Cell>
          <Cell>
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
          </Cell>
        </TableRow>
        <TableRow>
          <Cell align="right">Sub total</Cell>
          <Cell><Price value={total} /></Cell>
        </TableRow>
        <TableRow>
          <Cell align="left">
            <Label ribbon color="pink">Recargo</Label>
          </Cell>
          <Cell>
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
          </Cell>
        </TableRow>
        <TableRow>
          <Cell align="right">
            <b>Total</b>
          </Cell>
          <Cell><b><Price value={total} /></b></Cell>
        </TableRow>
      </TableBody>
    </Table>
  </Flex>
)
