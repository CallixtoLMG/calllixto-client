import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button, Form, Icon, Input, Modal, Segment, Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { HEADERS } from "../products.common";
import { ContainerModal, DataNotFoundContainer, ModInput, ModLabel, ModTable, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage } from "./styles";

const ImportExcel = ({ products, createBatch, editBatch }) => {
  const router = useRouter()
  const [open, setOpen] = useState(false);
  const [newProducts, setNewProducts] = useState([]);
  const [editProducts, setEditProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const cleanStates = () => {
    setSelectedFile(null);
    setNewProducts([]);
    setEditProducts([]);
  };

  const handleModalClose = () => {
    cleanStates();
    setOpen(false);
  };

  const handleFileUpload = (e) => {
    console.log("before set FileName: ", selectedFile)
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
      const parsedData = XLSX.utils.sheet_to_json(sheet, { header: transformedHeaders, range: 1 });
      const nonExistingProducts = [];
      const existingProducts = [];
      const existingCodes = {};
      console.log("before set nonExistingProducts:", nonExistingProducts);
      console.log("before set existingProducts:", existingProducts);
      console.log("before set existingCodes:", existingCodes);
      console.log("after set FileName: ", selectedFile)
      products.forEach((product) => {
        existingCodes[product.code] = true;
      });
      console.log("after set existingCodes:", existingCodes);
      parsedData.forEach((product) => {
        console.log("Processing product: ", product);
        if (existingCodes[product.code]) {
          existingProducts.push(product);
        } else {
          nonExistingProducts.push(product);
        };
      });

      console.log("after set existingProducts:", existingProducts);
      console.log("after set nonExistingProducts:", nonExistingProducts);
      console.log("after set existingCodes:", existingCodes);
      setEditProducts(existingProducts);
      setNewProducts(nonExistingProducts);
      console.log("after set editProducts:", editProducts);
      console.log("after set newProducts:", newProducts);
      setOpen(true);
    };
  };

  const { handleSubmit, control } = useForm();

  const validationRules = {
    code: {
      validate: (value) => /^[A-Za-z0-9]{4}$/.test(value),
      message: 'El código debe tener 4 caracteres alfanuméricos.',
    }
  };

  const handleAcceptCreate = (data) => {
    data.newProducts && createBatch({ products: data.newProducts })
    data.editProducts && editBatch({ update: data.editProducts })
    setTimeout(() => {
      router.refresh();
    }, 1000);
    setOpen(false);
  };

  return (
    <>
      <ModLabel as="label" htmlFor="file" >
        <Button as="span" color="blue">
          <Icon name="file" />
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
          onOpen={() => setOpen(true)}
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
                          <ModTableHeaderCell textAlign='center'></ModTableHeaderCell>
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
                            <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                            {HEADERS
                              .filter(header => !header.hide)
                              .map((header) =>
                                <Controller
                                  key={header.id}
                                  name={`newProducts[${index}].${header.value}`}
                                  control={control}
                                  defaultValue={header.value === "price" ? (newProduct[header.value]) : newProduct[header.value]}
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
                </>}
              {!!editProducts.length &&
                <>
                  <ModalModLabel >Productos a modificar</ModalModLabel>
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
                      {editProducts.map((editProduct, index) => (
                        <Table.Body key={`${editProduct.code}-${index}`}>
                          <ModTableRow >
                            <Table.Cell textAlign='center'>{index + 1}</Table.Cell>
                            {HEADERS
                              .filter(header => !header.hide)
                              .map((header) =>
                                <Controller
                                  key={header.id}
                                  name={`editProducts[${index}].${header.value}`}
                                  control={control}
                                  defaultValue={header.value === "price" ? (editProduct[header.value]) : editProduct[header.value]}
                                  rules={validationRules[header.value]}
                                  render={({ field, fieldState }) => (
                                    <Table.Cell
                                      key={header.id}
                                      textAlign='center'>
                                      {header.value === "code" ? <ModInput readOnly {...field} /> : <ModInput {...field} />}
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
                </>}
              {!editProducts.length && !newProducts.length &&
                <DataNotFoundContainer >
                  <p>No se encontraron datos.</p>
                </DataNotFoundContainer>}
              <SubContainer>
                <Button type="submit" color="green" content="Aceptar" />
                <Button onClick={() => setOpen(false)} color="red" content="Cancelar" />
              </SubContainer>
            </Form>
          </ContainerModal>
        </Modal>
      </Transition>
    </>
  );
}

export default ImportExcel;