import { modPrice } from "@/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Button, Form, Icon, Input, Modal, Table, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { HEADERS } from "../products.common";
import { ContainerModal, MainContainer, ModInput, ModLabel, ModTable, ModTableHeaderCell, ModTableRow, ModalModLabel, SubContainer, WarningMessage } from "./styles";

const ImportExcel = ({ products }) => {
  const [open, setOpen] = useState(false);
  const router = useRouter()
  const create = (product) => {
    var requestOptions = {
      method: 'POST',
      body: JSON.stringify(product),
      redirect: "follow",
      Headers: {
        'Content-type': 'application-json'
      },
      cache: "no-store"
    };
    console.log(requestOptions.body)

    fetch("https://sj2o606gg6.execute-api.sa-east-1.amazonaws.com/7a7affa5-d1bc-4d98-b1c3-2359519798a7/products", requestOptions)
      .then(async response => {
        let res = await response.text()
        res = JSON.parse(res)
        if (res.statusOk) {
          toast.success("Producto importado exitosamente");
        } else {
          toast.error(res.message);
        }
      })
      .catch(error => console.log('error', error));
    router.refresh()
  };

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
      const codigosExistente = {}; // los datos de todos los Code?
      products.forEach((producto) => {
        codigosExistente[producto.code] = true;
      });
      parsedData.forEach((nuevoProducto) => {
        if (codigosExistente[nuevoProducto.code]) {
          productosRepetidos.push(nuevoProducto);
        } else {
          productosNuevo.push(nuevoProducto)
        }
      });
      console.log(productosNuevo)
      setEditProducts(productosRepetidos)
      setNewProducts(productosNuevo)
      setOpen(true)
      // promiseall
    };
  }
  const { handleSubmit, control } = useForm();

  const validationRules = {
    code: {
      validate: (value) => /^[A-Za-z0-9]{4}$/.test(value),
      message: 'El código debe tener 4 caracteres alfanuméricos.',
    },
    price: {
      validate: (value) => /^\$\s?\d{1,3}(\.\d{3})*(,\d+)?$/.test(value),
      message: 'Error de formato. Ejemplo: $ 1.200,54',
    },
  };

  const handleAcceptCreate = () => {
    newProducts.length && newProducts.forEach((product) => {
      product.code = product.code.toString();
      product.name = product.name.toString();
      product.price = parseFloat(product.price)
      create(product)
      setOpen(false)
    })
  };

  return (
    <>
      <ModLabel as="label" htmlFor="file" >
        <Button as="span" color="blue">
          <Icon name="file" />
          Cargar Archivo
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
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
          >
            <ContainerModal>
              {/* si pongo esta funcion, crea los que cargo, si pongo la otra, me toma lo escrito, pero crea un objeto y necesitaria el batch? */}
              <Form onSubmit={handleSubmit(handleAcceptCreate)}>
                <ModalModLabel >{`Archivo seleccionado: ${selectedFile}`}</ModalModLabel>
                <ModalModLabel >Nuevos productos</ModalModLabel>
                <ModTable celled={true} compact>
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
                  {newProducts.map && newProducts.map((newProduct, index) => (
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
                              defaultValue={header.value === "price" ? modPrice(newProduct[header.value]) : newProduct[header.value]}
                              // defaultValue={get(newProduct, header.value === "price" && modPrice(header.value), header.value)}
                              rules={validationRules[header.value]}
                              render={({ field, fieldState }) => (
                                <Table.Cell
                                  key={header.id}
                                  textAlign='center'>
                                  {header.value === "code" ? <ModInput readonly {...field} /> : <ModInput {...field} />}
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
                <ModalModLabel >Productos a modificar</ModalModLabel>
                <ModTable celled={true} compact>
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
                  {editProducts.map && editProducts.map((newProduct, index) => (
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
                              defaultValue={header.value === "price" ? modPrice(editProducts[header.value]) : editProducts[header.value]}
                              // defaultValue={get(newProduct, header.value === "price" && modPrice(header.value), header.value)}
                              rules={validationRules[header.value]}
                              render={({ field, fieldState }) => (
                                <Table.Cell
                                  key={header.id}
                                  textAlign='center'>
                                  {header.value === "code" ? <ModInput readonly {...field} /> : <ModInput {...field} />}
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