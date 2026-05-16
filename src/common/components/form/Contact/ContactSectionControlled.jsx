import { BUTTON_TEXTS, COLORS, ICONS, TOOLTIPS } from "@/common/constants";
import { handleEnterKeyDown, handleEscapeKeyDown } from "@/common/utils";
import { useEffect, useRef, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { Form, Popup } from "semantic-ui-react";
import { IconedButton } from "../../buttons";
import { Box, FieldsContainer, Flex, FormField, Input } from '../../custom';
import { Table } from '../../table';
import { clearErrorField, updateFieldToAdd } from "./contact.helpers";

export const ContactSectionControlled = ({
  addButtonText,
  emptyValue,
  fieldArrayName,
  fieldsConfig,
  popupWidth,
  section,
  tableHeaders,
  tableWrap = false,
  validateItem,
}) => {
  const [error, setError] = useState();
  const [open, setOpen] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(emptyValue);
  const { control } = useFormContext();
  const buttonRef = useRef(null);
  const firstInputRef = useRef(null);

  const { fields, append, remove } = useFieldArray({
    control,
    name: fieldArrayName
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && open) setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open && firstInputRef.current) {
      firstInputRef.current.focus();
    }
  }, [open]);

  const clearSectionErrorField = (field) => clearErrorField(error, setError, section, field);

  const handleAdd = () => {
    const nextError = validateItem(fields, itemToAdd);

    if (Object.keys(nextError).length) {
      setError({ [section]: nextError });
      return;
    }

    append(itemToAdd);
    setItemToAdd(emptyValue);
    setError(undefined);
    setOpen(false);
  };

  const handleClose = () => {
    setItemToAdd(emptyValue);
    setError(undefined);
    setOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <Flex $flex="1" $flexDirection="column">
      <Popup
        trigger={
          <Box
            width="fit-content"
            tabIndex={0}
            role="button"
            ref={buttonRef}
            onClick={() => setOpen(true)}
            onKeyDown={(e) => {
              handleEscapeKeyDown(e, () => setOpen(false));
              handleEnterKeyDown(e, () => setOpen(true));
            }}
          >
            <IconedButton
              text={addButtonText}
              icon={ICONS.ADD}
              color={COLORS.GREEN}
            />
          </Box>
        }
        open={open}
        on='click'
        onClose={handleClose}
        closeOnDocumentClick
        position='top left'
      >
        <Form>
          <FieldsContainer width={popupWidth} $alignItems="center" $rowGap="5px">
            {fieldsConfig.map((fieldConfig, index) => {
              const errorKey = fieldConfig.errorKey || fieldConfig.name;
              const errorContent = error?.[section]?.[errorKey];

              return (
                <FormField
                  key={fieldConfig.name}
                  flex={fieldConfig.flex}
                  label={fieldConfig.label}
                  control={Input}
                  error={errorContent ? {
                    content: errorContent,
                    pointing: 'above',
                  } : null}
                  required={fieldConfig.required}
                  maxLength={fieldConfig.maxLength}
                  placeholder={fieldConfig.placeholder}
                  value={itemToAdd[fieldConfig.name]}
                  onChange={(e) => {
                    const value = e.target.value;
                    const nextItem = { ...itemToAdd, [fieldConfig.name]: value };

                    updateFieldToAdd(setItemToAdd, fieldConfig.name, value);

                    if (fieldConfig.shouldClearError?.({ fields, itemToAdd, nextItem, value })) {
                      clearSectionErrorField(errorKey);
                    }
                  }}
                  onKeyDown={(e) => handleEnterKeyDown(e, handleAdd)}
                >
                  {index === 0 ? <input ref={firstInputRef} /> : undefined}
                </FormField>
              );
            })}
            <IconedButton
              text={BUTTON_TEXTS.ADD}
              icon={ICONS.ADD}
              color={COLORS.GREEN}
              onClick={handleAdd}
              onKeyDown={(e) => handleEnterKeyDown(e, handleAdd)}
              alignSelf="end"
              height="38px"
            />
          </FieldsContainer>
        </Form>
      </Popup>
      <Box $marginTop="8px" />
      <Table
        $wrap={tableWrap}
        headers={tableHeaders}
        actions={[
          { id: 1, icon: ICONS.TRASH, color: COLORS.RED, onClick: (item, index) => remove(index), tooltip: TOOLTIPS.DELETE }
        ]}
        elements={fields}
      />
    </Flex>
  );
};
