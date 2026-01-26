import { Controller, useFormContext } from 'react-hook-form';
import SearchField from './SearchField';

export const SearchControlled = ({
  name,
  rules,
  label,
  placeholder,
  onAfterChange,
  clearAfterSelect,
  ...rest
}) => {
  const {
    formState: { errors },
  } = useFormContext();

  return (
    <Controller
      name={name}
      rules={rules}
      render={({ field: { onChange, value } }) => (
        <SearchField
          {...rest}
          label={label}
          error={errors?.[name] && {
            content: errors[name].message,
            pointing: 'above',
          }}
          value={value}
          onAfterChange={onAfterChange}
          onSelect={(val) => {
            onChange(val);
          }}
          placeholder={placeholder ?? label}
          clearAfterSelect={clearAfterSelect}
        />
      )}
    />
  );
};
