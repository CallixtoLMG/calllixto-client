import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Form, Icon, Modal, Segment, Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { PRODUCT_COLUMNS } from "../products.common";
import { ContainerModal, DataNotFoundContainer, ModTable, ModTableCell, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage } from "./styles";
import { Input, Button, ImportLabel } from "@/components/common/custom";

const ImportExcel = ({ products, createBatch, editBatch }) => {
  const { handleSubmit, control, reset, setValue, watch } = useForm();
  const { refresh } = useRouter()
  const [open, setOpen] = useState(false);
  const [newProducts, setNewProducts] = useState([]);
  const [editProducts, setEditProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const locale = "es-AR";
  const currency = "ARS";
  const inputRef = useRef();

  const handleClick = useCallback(() => {
    inputRef?.current?.click();
  }, [inputRef]);

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleModalOpen = () => {
    setOpen(open);
  };

  const handleFileUpload = (e) => {
    reset();
    const fileName = e.target.files[0]?.name;
    if (!fileName) {
      return;
    };
    setSelectedFile(fileName);
    const reader = new FileReader();
    const file = e.target.files[0];
    if (!(file instanceof Blob)) {
      return;
    };
    reader.readAsBinaryString(file);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const headersRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];
      const columnMapping = {
        Codigo: "code",
        Nombre: "name",
        Precio: "price",
        "Codigo Proveedor": "providerCode"
      };
      const transformedHeaders = headersRow.map((header) => {
        return columnMapping[header] || header;
      });
      for (let i = 0; i < transformedHeaders.length; i++) {
        sheet[XLSX.utils.encode_cell({ r: 0, c: i })] = {
          v: transformedHeaders[i],
          t: 's',
        };
      };
      let parsedData = XLSX.utils.sheet_to_json(sheet, { header: transformedHeaders, range: 1 });
      const nonExistingProducts = [];
      const existingProducts = [];
      const existingCodes = {};
      products.forEach((product) => {
        existingCodes[product.code.toUpperCase()] = true;
      });
      parsedData.forEach((product) => {
        const code = String(product.code).toUpperCase();
        const price = typeof product.price === 'string'
          ? parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'))
          : product.price;
        const formattedProduct = { ...product, code, price };
        if (existingCodes[code]) {
          existingProducts.push(formattedProduct);
        } else {
          nonExistingProducts.push(formattedProduct);
        }
      });
      setEditProducts(existingProducts);
      setNewProducts(nonExistingProducts);
      setValue('newProducts', nonExistingProducts);
      setValue('editProducts', existingProducts);
      setOpen(true);
    };
  };

  const validationRules = {
    code: {
      validate: (value) => /^[A-Z0-9]{7}$/.test(value),
      message: 'Código: 7 caracteres alfanuméricos y en mayúscula.',
    }
  };

  const handleAcceptCreate = (data) => {
    data?.newProducts?.length && createBatch(data.newProducts);
    data?.editProducts?.length && editBatch(data.editProducts);

    setTimeout(() => {
      refresh();
    }, 1000);

    setIsLoading(true);
    setOpen(false);
  };

  const getEditProductsPrice = (index) => {
    return watch(`editProducts[${index}].price`);
  };

  const getNewProductsPrice = (index) => {
    return watch(`newProducts[${index}].price`);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        accept=".xlsx, .xls"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <Button type="button" color="blue" onClick={handleClick}>
        <Icon name="upload" /> Importar
      </Button>
      <Transition animation="fade" duration={500} visible={open} >
        <Modal
          closeIcon
          open={open}
          onClose={handleModalClose}
          onOpen={handleModalOpen}
        >
          <ContainerModal>
            <Form onSubmit={handleSubmit(handleAcceptCreate)}>
              <ModalHeaderContainer>
                <ModalModLabel >Archivo seleccionado:</ModalModLabel>
                <Segment>{selectedFile}</Segment>
              </ModalHeaderContainer>
              {!!newProducts.length &&
                <>
                  <ModalModLabel >Nuevos productos</ModalModLabel>
                  <ModTableContainer>
                    <ModTable celled compact>
                      <Table.Header fullWidth>
                        <ModTableRow>
                          <ModTableHeaderCell />
                          {PRODUCT_COLUMNS
                            .map((column) => (
                              <ModTableHeaderCell key={column.id}>{column.title}</ModTableHeaderCell>
                            ))}
                        </ModTableRow>
                      </Table.Header>
                      {newProducts.map((newProduct, index) => (
                        <Table.Body key={`${newProduct.code}-${index}`}>
                          <ModTableRow >
                            <ModTableCell>{index + 1}</ModTableCell>
                            <ModTableCell>
                            <ImportLabel>{newProduct.code}</ImportLabel>
                            </ModTableCell>
                            <Controller
                              key={`newProducts[${index}].providerCode`}
                              name={`newProducts[${index}].providerCode`}
                              control={control}
                              defaultValue={newProducts[index].providerCode ? `newProducts[${index}].providerCode` : ""}
                              render={({ field, fieldState }) => (
                                <ModTableCell key={`newProducts[${index}].providerCode`} >
                                  <Input {...field} />
                                  {fieldState?.invalid && <WarningMessage >
                                  </WarningMessage>}
                                </ModTableCell>
                              )}
                            />
                            <Controller
                              key={`newProducts[${index}].name`}
                              name={`newProducts[${index}].name`}
                              control={control}
                              defaultValue={(`newProducts[${index}].name`)}
                              render={({ field, fieldState }) => (
                                <ModTableCell key={`newProducts[${index}].name`} >
                                  <Input {...field} />
                                  {fieldState?.invalid && <WarningMessage >
                                  </WarningMessage>}
                                </ModTableCell>
                              )}
                            />
                            <Controller
                              key={`newProducts[${index}].price`}
                              name={`newProducts[${index}].price`}
                              control={control}
                              defaultValue={getNewProductsPrice(index)}
                              render={({ field }) => (
                                <ModTableCell  >
                                  <CurrencyInput
                                    value={getNewProductsPrice(index)}
                                    locale={locale}
                                    currency={currency}
                                    onChangeValue={(_, value) => {
                                      field.onChange(value);
                                    }}
                                    InputElement={<Input />}
                                  />
                                </ModTableCell>
                              )}
                            />
                          </ModTableRow>
                        </Table.Body>
                      ))}
                    </ModTable>
                  </ModTableContainer>
                </>}
              {!!editProducts.length &&
                <>
                  <ModalModLabel>Productos a modificar</ModalModLabel>
                  <ModTableContainer>
                    <ModTable celled compact>
                      <Table.Header fullWidth>
                        <ModTableRow>
                          <ModTableHeaderCell />
                          {PRODUCT_COLUMNS
                            .map((column) => (
                              <ModTableHeaderCell key={column.id}>{column.title}</ModTableHeaderCell>
                            ))}
                        </ModTableRow>
                      </Table.Header>
                      {editProducts.map((editProduct, index) => (
                        <Table.Body key={`${editProduct.code}-${index}`}>
                          <ModTableRow >
                            <ModTableCell>{index + 1}</ModTableCell>
                            <Controller
                              key={`editProducts[${index}].code`}
                              name={`editProducts[${index}].code`}
                              control={control}
                              defaultValue={(`editProducts[${index}].code`).toUpperCase()}
                              rules={validationRules.code}
                              render={({ field, fieldState }) => (
                                <ModTableCell key={`editProducts[${index}].code`} >
                                  <Input readOnly {...field} />
                                  {fieldState?.invalid && <WarningMessage >{validationRules.code.message}</WarningMessage>}
                                </ModTableCell>
                              )}
                            />
                            <Controller
                              key={`editProducts[${index}].name`}
                              name={`editProducts[${index}].name`}
                              control={control}
                              defaultValue={(`editProducts[${index}].name`)}
                              render={({ field, fieldState }) => (
                                <ModTableCell key={`editProducts[${index}].name`} >
                                  <Input {...field} />
                                  {fieldState?.invalid && <WarningMessage >
                                  </WarningMessage>}
                                </ModTableCell>
                              )}
                            />
                            <Controller
                              key={`editProducts[${index}].price`}
                              name={`editProducts[${index}].price`}
                              control={control}
                              defaultValue={getEditProductsPrice(index)}
                              render={({ field }) => (
                                <ModTableCell  >
                                  <CurrencyInput
                                    value={getEditProductsPrice(index)}
                                    locale={locale}
                                    currency={currency}
                                    onChangeValue={(_, value) => {
                                      field.onChange(value);
                                    }}
                                    InputElement={<Input />}
                                  />
                                </ModTableCell>
                              )}
                            />
                          </ModTableRow>
                        </Table.Body>
                      ))}
                    </ModTable>
                  </ModTableContainer>
                </>}
              {!editProducts.length && !newProducts.length &&
                <DataNotFoundContainer >
                  <p>No se encontraron datos.</p>
                </DataNotFoundContainer>}
              <SubContainer>
                <Button disabled={isLoading} loading={isLoading} type="submit" color="green" content="Aceptar" />
                <Button disabled={isLoading} onClick={() => setOpen(false)} color="red" content="Cancelar" />
              </SubContainer>
            </Form>
          </ContainerModal>
        </Modal>
      </Transition>
    </>
  );
};

export default ImportExcel;
