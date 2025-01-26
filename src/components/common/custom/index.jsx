export * from './Containers';
export * from './DatePicker';
export * from './Flex';
export * from './PasswordInput';
export * from './RuledLabel';
export * from './Semantic';

import { Icon } from "@/components/common/custom";
import { ICONS } from "@/constants";
import { Flex } from './Flex';
import { formatedNumber } from "@/utils";
import { Input } from './Semantic';

export const Price = ({ value }) => {
  return (
    <Flex alignItems="center" justifyContent="space-between">
      <Icon dollar name={ICONS.DOLLAR} />
      <p>{formatedNumber(value)}</p>
    </Flex>
  );
};

export const PercentInput = ({
  value,
  onChange,
  width = '100%',
  height = '100%',
}) => {
  return (
    <Input
      height={height}
      width={width}
      value={value}
      iconPosition="right"
      onChange={(e) => {
        const value = e.target.value;
        if (!isNaN(value) && value <= 100 && value >= 0) {
          onChange(Number(value));
        }
      }}
      onFocus={(e) => e.target.select()}
    >
      <Icon name='percent' size='small' />
      <input />
    </Input>
  );
}

