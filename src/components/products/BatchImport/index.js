import { LIST_PRODUCTS_QUERY_KEY, createBatch, editBatch, useListAllProducts, useListBanProducts } from "@/api/products";
import { CurrencyFormatInput, FieldsContainer, Flex, Form, FormField, Input, Label, Segment } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { Loader } from "@/components/layout";
import { downloadExcel, now } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Icon, Transition, Button } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { ContainerModal, Modal, ModalActions, ModalHeader, WaitMsg } from "./styles";

const BatchImport = ({ isCreating }) => {
  const { data, isLoading: loadingProducts, refetch } = useListAllProducts({});
  const products = useMemo(() => data?.products, [data?.products]);
  const { data: blacklist, isLoading: loadingBlacklist } = useListBanProducts();
  const { handleSubmit, control, reset, setValue, watch } = useForm();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProducts, setDownloadProducts] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showUnprocessedModal, setShowUnprocessedModal] = useState(false);
  const [unprocessedResponse, setUnprocessedResponse] = useState(null);
  const [unprocessedProductsCount, setUnprocessedProductsCount] = useState(0);
  const [importedProductsCount, setImportedProductsCount] = useState(0);
  const watchProducts = watch("importProducts", []);
  const queryClient = useQueryClient();
  const inputRef = useRef();
  const [existingCodes, setExistingCodes] = useState({});
  const totalProducts = importedProductsCount + downloadProducts.length;

  useEffect(() => {
    const codes = products?.reduce((acc, product) => {
      acc[product.code?.toUpperCase()] = product;
      return acc;
    }, {});

    setExistingCodes(codes);
  }, [products]);

  const importSettings = useMemo(() => {
    return {
      button: isCreating ? "Crear" : "Actualizar",
      fileName: isCreating ? "Productos ya existentes" : "Productos no existentes",
      label: isCreating ? "Nuevos productos" : "Productos para actualizar",
      confirmation: isCreating ? "con códigos duplicados o ya" : "no",
      onSubmit: isCreating ? createBatch : editBatch,
      processData: (formattedProduct, existingCodes, downloadProducts, importProducts, productCounts) => {
        const productCode = formattedProduct.code.toUpperCase();
        if (productCounts[productCode] > 1) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra duplicado" });
        } else if (existingCodes[productCode] && !isCreating) {
          importProducts.push(formattedProduct);
        } else if (!existingCodes[productCode] && isCreating) {
          importProducts.push(formattedProduct);
        } else {
          const msg = isCreating ? "Este producto ya existe" : "Este producto no existe";
          downloadProducts.push({ ...formattedProduct, msg });
        }
      },
      isButtonDisabled: (isPending) => {
        return !watchProducts.length || isLoading || isPending;
      }
    };
  }, [isCreating, watchProducts, isLoading]);

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

  const handleFileUpload = async (e) => {
    reset();
    const file = e?.target.files[0];
    if (!file || loadingBlacklist || loadingProducts) return;
    setOpen(true);
    setIsLoading(true);
    try {
      const response = await refetch();
      const updatedProducts = response.data.products;
      setSelectedFile(file.name);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target.result;
          await processFile(data, updatedProducts);
        } catch (error) {
          console.error("Error processing file:", error);
        }
      };
      reader.readAsBinaryString(file);
    } catch (error) {
      console.error("Error al cargar los datos necesarios:", error);
    }
    finally {
      setIsLoading(false);
    }
  };

  const processFile = async (data, updatedProducts) => {
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
    const transformedHeaders = headersRow.map(header => columnMapping[header] || header);
    for (let i = 0; i < transformedHeaders.length; i++) {
      sheet[XLSX.utils.encode_cell({ r: 0, c: i })] = {
        v: transformedHeaders[i],
        t: 's',
      };
    };
    let parsedData = XLSX.utils.sheet_to_json(sheet, { header: transformedHeaders, range: 1 });
    const importProducts = [];
    const downloadProducts = [];
    const productCounts = {};

    const updatedExistingCodes = updatedProducts?.reduce((acc, product) => {
      acc[product.code.toUpperCase()] = product;
      return acc;
    }, {});

    parsedData.forEach(product => {
      const code = String(product.code).toUpperCase();
      productCounts[code] = (productCounts[code] || 0) + 1;
    });

    parsedData.forEach(product => {
      const code = String(product.code).toUpperCase();
      const hasAtLeastOneValue = product.code || product.name || product.price;
      if (hasAtLeastOneValue && !blacklist?.some(item => item === code)) {
        const formattedProduct = {
          code,
          name: product.name,
          price: parseFloat(product.price),
          comments: product.comments
        };

        if (productCounts[code] > 1) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra duplicado" });
        } else if (updatedExistingCodes && updatedExistingCodes[code] && !isCreating) {
          importProducts.push(formattedProduct);
        } else if (updatedExistingCodes && !updatedExistingCodes[code] && isCreating) {
          importProducts.push(formattedProduct);
        } else {
          const msg = isCreating ? "Este producto ya existe" : "Este producto no existe";
          downloadProducts.push({ ...formattedProduct, msg });
        }
      }
    });

    setValue('importProducts', importProducts);
    setImportedProductsCount(importProducts.length);
    if (downloadProducts.length) {
      setShowConfirmationModal(true);
      setDownloadProducts(downloadProducts);
    }
  };

  const handleDownloadConfirmation = () => {
    const data = [
      ['Codigo', 'Nombre', 'Precio', 'Comentarios', 'Error'],
      ...downloadProducts.map((product) => [
        product.code,
        product.name,
        product.price,
        product.comments,
        product.msg || "",
      ]),
    ];
    downloadExcel(data, importSettings.fileName);
    setShowConfirmationModal(false);
    setOpen(true);
  };

  const handleUnprocessedDownload = () => {
    if (unprocessedResponse && unprocessedResponse.response) {
      const { response } = unprocessedResponse;
      const data = response.unprocessed.map(product => ({
        ...product,
        msg: product?.msg || "Este producto tiene errores"
      }));
      const formattedData = [
        ["Codigo", "Nombre", "Precio", "Comentarios", "Mensaje de error"],
        ...data.map(product => [
          product.code,
          product.name,
          product.price,
          product.comments,
          product.msg
        ])
      ];
      downloadExcel(formattedData, "Archivo sin procesar");
      setShowUnprocessedModal(false);
    }
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (e) => {
      if (isCreating) {
        const { data } = await importSettings.onSubmit(e.importProducts);
        return data;
      } else {
        const processedProducts = e.importProducts
          .map(product => {
            const existingProduct = existingCodes[product.code.toUpperCase()];
            let productWithChanges = { code: product.code };
            let previousVersion = {};
            Object.keys(product).forEach(key => {
              if (key !== 'code' && product[key] !== undefined && product[key] !== '' && product[key] !== existingProduct[key]) {
                productWithChanges[key] = product[key];
                previousVersion[key] = existingProduct[key];
              }
            });
            if (existingProduct.updatedAt) {
              previousVersion['updatedAt'] = existingProduct.updatedAt;
            }
            if (Object.keys(previousVersion).length > 0) {
              productWithChanges['previousVersion'] = previousVersion;
              productWithChanges.updatedAt = now();
            } else {
              return null;
            }
            return productWithChanges;
          })
          .filter(product => product !== null);

        if (processedProducts.length > 0) {
          const { data } = await importSettings.onSubmit(processedProducts);
          return data;
        };
      };
    },
    onSuccess: (response) => {
      const unprocessedCount = response.unprocessed?.length;
      const createdCount = importedProductsCount - unprocessedCount;
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success(isCreating ?
          `Productos importados: ${importedProductsCount}.\nProductos creados exitosamente: ${createdCount}.\nProductos sin procesar: ${unprocessedCount}.`
          : "Los productos se han actualizado con exito!");
        handleModalClose();
      } else {
        toast.error(response.message);
      }
      if (response.unprocessed?.length) {
        setShowUnprocessedModal(true);
        setUnprocessedResponse({ response });
        setUnprocessedProductsCount(response.unprocessed?.length);
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
          render={({ field: { onChange, value } }) => (
            <CurrencyFormatInput
              height="30px"
              displayType="input"
              thousandSeparator={true}
              decimalScale={2}
              allowNegative={false}
              prefix="$ "
              customInput={Input}
              onValueChange={value => {
                onChange(value.floatValue);
              }}
              value={value || 0}
              placeholder="Precio"
            />
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
        size="small"
        icon
        labelPosition="left"
        color="blue"
        onClick={handleClick}
        type="button"
      >
        <Icon name="upload" />{importSettings.button}
      </Button>
      <Transition animation="fade" duration={500} visible={open}>
        <Modal
          closeIcon
          open={open}
          onClose={handleModalClose}
          onOpen={handleModalOpen}
        >
          {showConfirmationModal ? (
            <>
              <Loader active={loadingProducts || isLoading}>
                <ModalHeader> Confirmar descarga</ModalHeader>
                <Modal.Content>
                  <p>
                    {`Se han encontrado ${downloadProducts.length} productos (de ${totalProducts}) ${importSettings.confirmation} existentes en la lista...`}<br /><br />
                    ¿Deseas descargar un archivo de Excel con estos productos antes de continuar?
                  </p>
                </Modal.Content>
                <ModalActions>
                  <Flex columnGap="5px" >
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
                  </Flex>
                </ModalActions>
              </Loader>
            </>
          ) : (
            <Loader active={loadingProducts || isLoading}>
              <ContainerModal>
                <Form onSubmit={handleSubmit(mutate)}>
                  {watchProducts.length <= 50 ? (
                    <>
                      <FieldsContainer>
                        <FormField width={6}>
                          <Label >Archivo seleccionado:</Label>
                          <Segment>{selectedFile}</Segment>
                        </FormField>
                      </FieldsContainer>
                      <FieldsContainer rowGap="5px">
                        <Label>{`${importSettings.label}: ${importedProductsCount}`}</Label>
                        <Table
                          deleteButtonInside
                          tableHeight="50vh"
                          mainKey="code"
                          headers={PRODUCTS_COLUMNS}
                          elements={watchProducts}
                          actions={actions}
                        />
                      </FieldsContainer>
                    </>
                  ) : (
                    <>
                      <FieldsContainer>
                        <FormField width={8}>
                          <Label >Archivo seleccionado:</Label>
                          <Segment>{selectedFile}</Segment>
                        </FormField>
                        <FormField width={7}>
                          <Label >Cantidad a importar:</Label>
                          <Segment>{`${importSettings.label} hola: ${importedProductsCount}`}</Segment>
                        </FormField>
                      </FieldsContainer>
                    </>
                  )}
                  <ModalActions>
                    {isLoading || isPending && <WaitMsg>Esto puede demorar unos minutos...</WaitMsg>}
                    <Flex columnGap="5px">
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
                    </Flex>
                  </ModalActions>
                </Form>
              </ContainerModal>
            </Loader>
          )}
        </Modal>
      </Transition >
      <Transition animation="fade" duration={500} visible={showUnprocessedModal}>
        <Modal open={showUnprocessedModal} onClose={() => setShowUnprocessedModal(false)}>
          <ModalHeader>Confirmar descarga</ModalHeader>
          <Modal.Content>
            <p> {`Se han encontrado ${unprocessedProductsCount} productos con errores que no pueden ser importados`}.</p>
            <p>¿Deseas descargar un archivo de Excel con estos productos?</p>
          </Modal.Content>
          <ModalActions>
            <Button color="green" onClick={() => {
              handleUnprocessedDownload();
            }}>
              Confirmar
            </Button>
            <Button color="red" onClick={() => {
              setShowUnprocessedModal(false);
            }}>
              Cancelar
            </Button>
          </ModalActions>
        </Modal>
      </Transition>
    </>
  );
};
export default BatchImport;