import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Input, Label, Segment } from "@/components/common/custom";
import { Cell, HeaderCell } from "@/components/common/table";
import { downloadExcel } from "@/utils";
import { useCallback, useRef, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { IMPORT_PRODUCTS_COLUMNS } from "../products.common";
import { ContainerModal, DataNotFoundContainer, Modal, ModalActions, TableContainer } from "./styles";

const BatchUpdate = ({ products, editBatch }) => {
  const { handleSubmit, control, reset, setValue } = useForm();
  const [open, setOpen] = useState(false);
  const [editProducts, setEditProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [nonExistingProducts, setNonExistingProducts] = useState([]);

  const locale = "es-AR";
  const currency = "ARS";
  const inputRef = useRef();

  const handleClick = useCallback(() => {
    inputRef.current.value = null;
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
        Comentarios: "comments",
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
      setValue('editProducts', existingProducts);

      if (nonExistingProducts.length) {
        setShowConfirmationModal(true);
        setNonExistingProducts(nonExistingProducts)
      } else {
        setOpen(true);
      };
    };
  };

  const handleDownloadConfirmation = () => {
    const data = [
      ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
      ...nonExistingProducts.map((product) => [
        product.code,
        product.name,
        product.price,
        product.comments,
      ]),
    ];
    downloadExcel(data);
    setShowConfirmationModal(false);
    setOpen(true);
  };

  const handleCancelDownloadConfirmation = () => {
    setShowConfirmationModal(false);
    setOpen(true);
  };

  const handleAccept = async (data) => {
    setIsLoading(true);
    !!data?.editProducts?.length && await editBatch(data.editProducts);
    setIsLoading(false);
    handleModalClose()
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        accept=".xlsx, .xls, .xlsm"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />
      <Button
        color="blue"
        onClick={handleClick}
        type="button"
      >
        Actualizar
      </Button>
      <Transition animation="fade" duration={500} visible={open} >
        <Modal
          closeIcon
          open={open}
          onClose={handleModalClose}
          onOpen={handleModalOpen}
        >
          <ContainerModal>
            <Form onSubmit={handleSubmit(handleAccept)}>
              <FieldsContainer>
                <FormField width={6}>
                  <Label>Archivo seleccionado:</Label>
                  <Segment>{selectedFile}</Segment>
                </FormField>
              </FieldsContainer>
              {!!editProducts.length && (
                <FieldsContainer>
                  <Label>Productos a modificar</Label>
                  <TableContainer>
                    <Table celled compact striped>
                      <Table.Header fullWidth>
                        <Table.Row>
                          {IMPORT_PRODUCTS_COLUMNS
                            .map((column) => (
                              <HeaderCell key={column.id}>{column.title}</HeaderCell>
                            ))}
                        </Table.Row>
                      </Table.Header>
                      <Table.Body>
                        {editProducts.map((editProduct, index) => (
                          <Table.Row key={`${editProduct.code}`}>
                            <Cell width={1}>{editProduct.code}</Cell>
                            <Controller
                              name={`editProducts[${index}].name`}
                              control={control}
                              render={({ field }) => (
                                <Cell align="left">
                                  <Input {...field} height="30px" width="100%" />
                                </Cell>
                              )}
                            />
                            <Controller
                              name={`editProducts[${index}].price`}
                              control={control}
                              render={({ field }) => (
                                <Cell width={2}>
                                  <CurrencyInput
                                    {...field}
                                    locale={locale}
                                    currency={currency}
                                    onChangeValue={(_, value) => {
                                      field.onChange(value);
                                    }}
                                    InputElement={<Input height="30px" />}
                                  />
                                </Cell>
                              )}
                            />
                            <Controller
                              name={`editProducts[${index}].comments`}
                              control={control}
                              render={({ field }) => (
                                <Cell align="left">
                                  <Input {...field} height="30px" width="100%" />
                                </Cell>
                              )}
                            />
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </TableContainer>
                </FieldsContainer>
              )}
              {!editProducts.length && (
                <DataNotFoundContainer>
                  <p>No se encontraron datos.</p>
                </DataNotFoundContainer>
              )}
              <ButtonsContainer>
                <Button disabled={isLoading} loading={isLoading} type="submit" color="green" content="Aceptar" />
                <Button disabled={isLoading} onClick={() => setOpen(false)} color="red" content="Cancelar" />
              </ButtonsContainer>
            </Form>
          </ContainerModal>
        </Modal>
      </Transition>
      <Transition animation="fade" duration={500} visible={showConfirmationModal} >
        <Modal
          open={showConfirmationModal}
          onClose={handleCancelDownloadConfirmation}
          size="small"
        >
          <Modal.Header>Confirmar Descarga</Modal.Header>
          <Modal.Content>
            <p>
              Se han encontrado productos no existentes en la lista...<br /><br />
              ¿Deseas descargar un archivo de Excel con estos productos antes de editar los existentes?
            </p>
          </Modal.Content>
          <ModalActions>
            <Button
              positive
              onClick={handleDownloadConfirmation}
              content="Confirmar"
            />
            <Button
              negative
              onClick={handleCancelDownloadConfirmation}
              content="Cancelar"
            />
          </ModalActions>
        </Modal>
      </Transition>

    </>
  );
};

export default BatchUpdate;
