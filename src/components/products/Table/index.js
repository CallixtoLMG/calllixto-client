import { Controller, useForm } from "react-hook-form";
import { Table } from "semantic-ui-react";
import { HEADERS } from "../products.common";
import { ModInput, ModTable, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalModLabel, WarningMessage } from "./styles";

const ModalTable = ({ identification, title, values, dataName }) => {
  const { control } = useForm();

  const validationRules = {
    code: {
      validate: (value) => /^[A-Za-z0-9]{4}$/.test(value),
      message: 'El código debe tener 4 caracteres alfanuméricos.',
    },
    // price: {
    //   validate: (value) => /^\$\s?\d{1,3}(\.\d{3})*(,\d+)?$/.test(value),
    //   message: 'Error de formato. Ejemplo: $ 1.200,54',
    // },
  };

  return (
    <>
      <ModalModLabel >{title}</ModalModLabel>
      <ModTableContainer>
        <ModTable celled compact>
          <Table.Header fullWidth>
            <ModTableRow>
              <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
              {HEADERS
                .filter(header => !header.hide)
                .map((header) => (
                  <ModTableHeaderCell key={header.id}>{header.name}</ModTableHeaderCell>
                ))}
            </ModTableRow>
          </Table.Header>
          {values.map((value, index) => (
            <Table.Body key={value[identification]}>
              <ModTableRow >
                <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                {HEADERS
                  .filter(header => !header.hide)
                  .map((header) =>
                    <Controller
                      key={header.id}
                      name={`${dataName}[${index}].${header.value}`}
                      control={control}
                      defaultValue={header.value === "price" ? (value[header.value]) : value[header.value]}
                      rules={validationRules[header.value]}
                      render={({ field, fieldState }) => (
                        <Table.Cell
                          key={header.id}
                          textAlign='center'>
                          <ModInput {...field} />
                          {fieldState?.invalid && <WarningMessage >{validationRules[header.value].message}</WarningMessage>}
                        </Table.Cell>
                      )}
                    />
                  )
                }
              </ModTableRow>
            </Table.Body>
          ))}
        </ModTable>
      </ModTableContainer>
    </>
  )
}

export default ModalTable;