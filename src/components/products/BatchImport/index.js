import { LIST_PRODUCTS_QUERY_KEY, createBatch, editBatch, useListBanProducts } from "@/api/products";
import { Button, FieldsContainer, Form, FormField, Input, Label, Segment } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { CURRENCY, LOCALE, RULES } from "@/constants";
import { downloadExcel } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useMemo, useRef, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ButtonContent, Icon, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { ContainerModal, Header, Modal, ModalActions, ModalHeader, WarningMessage } from "./styles";

const BatchImport = ({ products, isCreating }) => {
  const { data: blacklist, isLoading: loadingBlacklist } = useListBanProducts();
  const { handleSubmit, control, reset, setValue, formState: { errors, isDirty }, watch } = useForm();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProducts, setDownloadProducts] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showTremendoModal, setShowTremendoModal] = useState(false); // Estado para controlar la visibilidad del modal 'tremendo';
  const [isUnprocessedDownloadConfirmed, setIsUnprocessedDownloadConfirmed] = useState(false);
  const [unprocessedResponse, setUnprocessedResponse] = useState(null);
  const watchProducts = watch("importProducts", []);
  const queryClient = useQueryClient();
  const inputRef = useRef();

  const importSettings = useMemo(() => {
    return {
      button: isCreating ? "Crear" : "Actualizar",
      toast: isCreating ? "Los productos se han creado con exito!" : "Los productos se han actualizado con exito! ",
      confirmation: isCreating ? "" : "no",
      onSubmit: isCreating ? createBatch : editBatch,
      processData: (formattedProduct, existingCodes, downloadProducts, importProducts) => {
        if (existingCodes[formattedProduct.code]) {
          isCreating ? downloadProducts.push(formattedProduct) : importProducts.push(formattedProduct);
        } else {
          isCreating ? importProducts.push(formattedProduct) : downloadProducts.push(formattedProduct);
        }
      },
      isButtonDisabled: (isPending) => {
        return !watchProducts.length || isLoading || isPending || (!isCreating && !isDirty)
      }
    };
  }, [isCreating, watchProducts, isLoading, isDirty]);

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

  const handleFileUpload = useCallback((e) => {
    reset();

    const fileName = e?.target.files[0]?.name;
    if (!fileName || loadingBlacklist) {
      return;
    };

    setSelectedFile(fileName);
    const reader = new FileReader();
    const file = e.target.files[0];

    if (!(file instanceof Blob)) {
      return;
    };

    setIsLoading(true);

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
      const importProducts = [];
      const downloadProducts = [];
      const existingCodes = {};

      products?.forEach((product) => {
        existingCodes[product.code.toUpperCase()] = true;
      });

      parsedData.forEach((product) => {
        const code = String(product.code).toUpperCase();
        const price = parseFloat(product.price);
        const hasAtLeastOneValue = product.code || product.name || product.price;

        if (hasAtLeastOneValue && !blacklist?.some(item => item === code)) {
          const formattedProduct = { ...product, code, price };

          importSettings.processData(
            formattedProduct,
            existingCodes,
            downloadProducts,
            importProducts
          );
        };
      });

      setValue('importProducts', importProducts);
      setIsLoading(false);
      if (downloadProducts.length) {
        setShowConfirmationModal(true);
        setDownloadProducts(downloadProducts);
      };
      setOpen(true);
    };
  }, [blacklist, loadingBlacklist, products, reset, setValue, importSettings]);

  const handleDownloadConfirmation = () => {
    const data = [
      ['Codigo', 'Nombre', 'Precio', 'Comentarios'],
      ...downloadProducts.map((product) => [
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

  const handleUnprocessedDownload = () => {
    if (isUnprocessedDownloadConfirmed && unprocessedResponse) {
      const { response } = unprocessedResponse; // Extrae response del estado
      const data = response.unprocessed.map(product => ({
        ...product,
        msg: product.msg || "Mensaje adicional aquí"
      }));

      const formattedData = [
        ["Codigo", "Nombre", "Precio", "Comentarios", "Msg"],
        ...data.map(product => [
          product.code,
          product.name,
          product.price,
          product.comments,
          product.msg
        ])
      ];

      downloadExcel(formattedData);
      setIsUnprocessedDownloadConfirmed(false); // Restablece el estado después de la descarga
      setUnprocessedResponse(null); // Restablece el estado después de la descarga
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (products) => {
      const { data } = await importSettings.onSubmit(products.importProducts);
      console.log(data);
      return data;
    },
    onSuccess: (response) => {
      console.log(response);
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success(importSettings.toast);
        handleModalClose();
      } else {
        toast.error(response.message);
      }

      // Verificar la propiedad 'unprocessed' en la respuesta
      if (response.unprocessed) {
        setShowTremendoModal(true);
        setUnprocessedResponse({ response }); // Almacena response en el estado
      }
    },
  });

  const deleteProduct = useCallback((index) => {
    const products = [...watchProducts];
    products.splice(index, 1);
    setValue("importProducts", products);
  }, [watchProducts, setValue]);

  const actions = [
    {
      id: 1,
      icon: 'trash',
      color: 'red',
      onClick: (element, index) => {
        deleteProduct(index);
      },
      tooltip: 'Eliminar'
    }
  ];

  const PRODUCTS_COLUMNS = [
    {
      title: "Código",
      value: (product) => product.code,
      id: 1,
      width: 2
    },
    {
      title: "Nombre", value: (product, index) => (
        <Controller
          name={`importProducts[${index}].name`}
          control={control}
          render={({ field }) => (
            <Input {...field} height="30px" width="100%" />
          )}
        />
      ), id: 2, align: 'left'
    },
    {
      title: "Precio", value: (product, index) => (
        <Controller
          name={`importProducts[${index}].price`}
          control={control}
          rules={RULES.REQUIRED_PRICE}
          render={({ field }) => (
            <>
              <CurrencyInput
                {...field}
                locale={LOCALE}
                currency={CURRENCY}
                onChangeValue={(_, value) => {
                  field.onChange(value);
                }}
                InputElement={<Input height="30px" />}
              />
              {errors?.importProducts?.[index]?.price && <WarningMessage>Precio requerido</WarningMessage>}
            </>
          )}
        />
      ), id: 3, width: 3
    },
    {
      title: "Comentarios", value: (product, index) => (
        <Controller
          name={`importProducts[${index}].comments`}
          control={control}
          render={({ field }) => (
            <Input {...field} height="30px" width="100%" />
          )}
        />
      ), id: 4, align: 'left'
    },
  ];

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
        animated="vertical"
        color="blue"
        onClick={handleClick}
        type="button"
        width="100%"
      >
        <ButtonContent hidden>
          {importSettings.button}
        </ButtonContent>
        <ButtonContent visible>
          <Icon name="upload" />
        </ButtonContent>
      </Button>

      <Transition animation="fade" duration={500} visible={open}>
        <Modal
          closeIcon
          open={open}
          onClose={handleModalClose}
          onOpen={handleModalOpen}
        >
          <ContainerModal>
            {showConfirmationModal ? (
              <>
                <ModalHeader> <Header>Confirmar descarga</Header></ModalHeader>
                <Modal.Content>
                  <p>
                    {`Se han encontrado productos ${importSettings.confirmation} existentes en la lista...`}<br /><br />
                    ¿Deseas descargar un archivo de Excel con estos productos antes de continuar?
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
                    onClick={() => setShowConfirmationModal(false)}
                    content="Cancelar"
                  />
                </ModalActions>
              </>
            ) : (
              <Form onSubmit={handleSubmit(mutate)}>
                <FieldsContainer>
                  <FormField width={6}>
                    <Label>Archivo seleccionado:</Label>
                    <Segment>{selectedFile}</Segment>
                  </FormField>
                </FieldsContainer>
                <FieldsContainer>
                  <Label>Nuevos productos</Label>
                  <Table
                    deleteButtonInside
                    tableHeight="50vh"
                    mainKey="code"
                    headers={PRODUCTS_COLUMNS}
                    elements={watchProducts}
                    actions={actions}
                  />
                </FieldsContainer>
                <ModalActions>
                  <Button
                    disabled={importSettings.isButtonDisabled(isPending)}
                    loading={isLoading || isPending}
                    type="submit"
                    color="green"
                    content="Aceptar"
                  />
                  <Button
                    disabled={isLoading || isPending}
                    onClick={() => setOpen(false)}
                    color="red"
                    content="Cancelar"
                  />
                </ModalActions>
              </Form>
            )}
          </ContainerModal>
        </Modal>
      </Transition>
      <Modal open={showTremendoModal} onClose={() => setShowTremendoModal(false)}>
        <Modal.Header>Tremendo</Modal.Header>
        <Modal.Content>
          <p>Se han encontrado productos sin procesar.</p>
          <p>¿Deseas descargar estos productos sin procesar?</p>
        </Modal.Content>
        <Modal.Actions>
          <Button color="green" onClick={() => {
            setIsUnprocessedDownloadConfirmed(true); // Confirma la descarga
            handleUnprocessedDownload(); // Llama a handleUnprocessedDownload
          }}>
            Descargar
          </Button>
          <Button color="red" onClick={() => {
            setIsUnprocessedDownloadConfirmed(false); // Cancela la descarga
            setShowTremendoModal(false);
          }}>
            Cancelar
          </Button>
        </Modal.Actions>
      </Modal>
    </>
  );
};

export default BatchImport;
