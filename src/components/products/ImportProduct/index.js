import { useRouter } from "next/navigation";
import { useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon, Input, Modal, Segment, Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { HEADERS } from "../products.common";
import { ContainerModal, DataNotFoundContainer, ModInput, ModLabel, ModTable, ModTableCell, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage } from "./styles";

const ImportExcel = ({ products, createBatch, editBatch }) => {
  const { handleSubmit, control, reset } = useForm();
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [newProducts, setNewProducts] = useState([]);
  const [editProducts, setEditProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const locale = "es-AR";
  const currency = "ARS";

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
        const code = typeof product.code === 'number' ? String(product.code).toUpperCase() : product.code;
        const price = typeof product.price === 'string'
          ? parseFloat(product.price.replace(/[^\d,]/g, '').replace(',', '.'))
          : product.price;
        const formattedProduct = { ...product, code, price };
        console.log(formattedProduct)
        if (existingCodes[code]) {
          existingProducts.push(formattedProduct);
        } else {
          nonExistingProducts.push(formattedProduct);
        }
      });
      setEditProducts(existingProducts);
      setNewProducts(nonExistingProducts);
      setOpen(true);
    };
  };

  const validationRules = {
    code: {
      validate: (value) => /^[A-Z0-9]{4}$/.test(value),
      message: 'Código: 4 caracteres alfanuméricos y en mayúscula.',
    }
  };

  const handleAcceptCreate = (data) => {
    data.newProducts && createBatch({ products: data.newProducts })
    data.editProducts && editBatch({ update: data.editProducts })
    setTimeout(() => {
      router.refresh();
    }, 1000);
    setIsLoading(true);
    setOpen(false);
  };

  return (
    <>
      <ModLabel as="label" htmlFor="file" >
        <Button as="span" color="blue">
          <Icon name="upload" />
          Importar
        </Button>
        <Input
          type="file"
          id="file"
          accept=".xlsx, .xls"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </ModLabel>
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
                          <ModTableHeaderCell></ModTableHeaderCell>
                          {HEADERS
                            .filter(header => !header.hide)
                            .map((header) => (
                              <ModTableHeaderCell key={header.id}>{header.name}</ModTableHeaderCell>
                            ))}
                        </ModTableRow>
                      </Table.Header>
                      {newProducts.map((newProduct, index) => (
                        <Table.Body key={`${newProduct.code}-${index}`}>
                          <ModTableRow >
                            <ModTableCell>{index + 1}</ModTableCell>
                            {HEADERS
                              .filter(header => !header.hide)
                              .map((header) =>
                                <Controller
                                  key={header.id}
                                  name={`newProducts[${index}].${header.value}`}
                                  control={control}
                                  defaultValue={newProduct[header.value]}
                                  rules={validationRules[header.value]}
                                  render={({ field, fieldState }) => (
                                    <ModTableCell key={header.id} >
                                      {header.value === "price" ? <CurrencyInput
                                        value={Number(newProduct[header.value])}
                                        locale={locale}
                                        currency={currency}
                                        onChangeValue={(_, value) => {
                                          field.onChange(value);
                                        }}
                                        InputElement={<ModInput />}
                                      /> : <ModInput {...field} />}
                                      {fieldState?.invalid && <WarningMessage >{validationRules[header.value].message}</WarningMessage>}
                                    </ModTableCell>
                                  )}
                                />
                              )
                            }
                          </ModTableRow>
                        </Table.Body>
                      ))}
                    </ModTable>
                  </ModTableContainer>
                </>}
              {!!editProducts.length &&
                <>
                  <ModalModLabel >Productos a modificar</ModalModLabel>
                  <ModTableContainer>
                    <ModTable celled compact>
                      <Table.Header fullWidth>
                        <ModTableRow>
                          <ModTableHeaderCell ></ModTableHeaderCell>
                          {HEADERS
                            .filter(header => !header.hide)
                            .map((header) => (
                              <ModTableHeaderCell key={header.id}>{header.name}</ModTableHeaderCell>
                            ))}
                        </ModTableRow>
                      </Table.Header>
                      {editProducts.map((editProduct, index) => (
                        <Table.Body key={`${editProduct.code}-${index}`}>
                          <ModTableRow >
                            <ModTableCell>{index + 1}</ModTableCell>
                            {HEADERS
                              .filter(header => !header.hide)
                              .map((header) =>
                                <Controller
                                  key={header.id}
                                  name={`editProducts[${index}].${header.value}`}
                                  control={control}
                                  defaultValue={header.value === "code" ? (editProduct[header.value]).toUpperCase() : editProduct[header.value]}
                                  rules={validationRules[header.value]}
                                  render={({ field, fieldState }) => (
                                    <ModTableCell key={header.id} >
                                      {header.value === "price" ? <CurrencyInput
                                        value={Number(editProduct[header.value])}
                                        locale={locale}
                                        currency={currency}
                                        onChangeValue={(_, value) => {
                                          field.onChange(value);
                                        }}
                                        InputElement={<ModInput />}
                                      /> : <ModInput {...field} />}
                                      {fieldState?.invalid && <WarningMessage >{validationRules[header.value].message}</WarningMessage>}
                                    </ModTableCell>
                                  )}
                                />
                              )
                            }
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
}

export default ImportExcel;