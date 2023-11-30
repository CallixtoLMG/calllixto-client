// import { CLIENTID, CREATEBATCH, EDITBATCH, PATHS, URL } from "@/fetchUrls";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
import { Button, Form, Icon, Input, Modal, Segment, Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { HEADERS } from "../products.common";
import { ContainerModal, MainContainer, ModInput, ModLabel, ModTable, ModTableContainer, ModTableHeaderCell, ModTableRow, ModalHeaderContainer, ModalModLabel, SubContainer, WarningMessage } from "./styles";

const ImportExcel = ({ products, createBatch, editBatch }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter()

  // const createBatch = (product) => {
  //   var requestOptions = {
  //     method: 'POST',
  //     body: JSON.stringify(product),
  //     redirect: "follow",
  //     headers: {
  //       authorization: `Bearer ${localStorage.getItem("token")}`
  //     },
  //     cache: "no-store"
  //   };

  //   fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}${CREATEBATCH}`, requestOptions)
  //     .then(async response => {
  //       let res = await response.text()
  //       res = JSON.parse(res);
  //       if (res.statusOk) {
  //         toast.success("Productos importados creados exitosamente");
  //       } else {
  //         toast.error(res.message);
  //       }
  //     })
  //     .catch(error => console.log('error', error));
  // };

  // const editBatch = (product) => {
  //   var requestOptions = {
  //     method: 'POST',
  //     body: JSON.stringify(product),
  //     redirect: "follow",
  //     headers: {
  //       authorization: `Bearer ${localStorage.getItem("token")}`
  //     },
  //     cache: "no-store"
  //   };
  //   fetch(`${URL}${CLIENTID}${PATHS.PRODUCTS}${EDITBATCH}`, requestOptions)
  //     .then(async response => {
  //       let res = await response.text()
  //       res = JSON.parse(res);
  //       if (res.statusOk) {
  //         toast.success("Productos importados modificadosexitosamente");
  //       } else {
  //         toast.error(res.message);
  //       }
  //     })
  //     .catch(error => console.log('error', error));
  // };

  const [newProducts, setNewProducts] = useState([]);
  const [editProducts, setEditProducts] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileUpload = (e) => {
    const fileName = e.target.files[0].name;
    if (fileName) {
      setSelectedFile(fileName);
    }
    const reader = new FileReader();
    reader.readAsBinaryString(e.target.files[0]);
    reader.onload = (e) => {
      const data = e.target.result;
      const workbook = XLSX.read(data, { type: "binary" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const parsedData = XLSX.utils.sheet_to_json(sheet);
      const productosRepetidos = [];
      const productosNuevo = [];
      const codigosExistente = {};
      products.forEach((producto) => {
        codigosExistente[producto.code] = true;
      });
      parsedData.forEach((nuevoProducto) => {
        if (codigosExistente[nuevoProducto.code]) {
          productosRepetidos.push(nuevoProducto);
        } else {
          productosNuevo.push(nuevoProducto);
        }
      });
      setEditProducts(productosRepetidos);
      setNewProducts(productosNuevo);
      setOpen(true);
    };
  }
  const { handleSubmit, control } = useForm();

  const validationRules = {
    code: {
      validate: (value) => /^[A-Za-z0-9]{4}$/.test(value),
      message: 'El código debe tener 4 caracteres alfanuméricos.',
    }
  };

  const handleAcceptCreate = (data) => {
    const update = {
      create: [],
      update: data.editProducts || [],
    };
    data.newProducts && createBatch({ products: data.newProducts })
    data.editProducts && editBatch(update)
    console.log(update)

    setTimeout(() => {
      router.refresh();
    }, 500);
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
      <MainContainer  >
        <Transition animation="fade" duration={500} visible={open} >
          <Modal
            closeIcon
            open={open}
            onClose={() => (setOpen(false))}
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
                          <Table.Body key={newProduct.code}>
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
                          <Table.Body key={editProducts.code}>
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
                <SubContainer>
                  <Button type="submit" color="green" content="Aceptar" />
                  <Button onClick={() => setOpen(false)} color="red" content="Cancelar" />
                </SubContainer>
              </Form>
            </ContainerModal>
          </Modal>
        </Transition>
      </MainContainer>
    </>
  );
}

export default ImportExcel;