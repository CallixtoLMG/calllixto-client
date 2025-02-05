import { useCreateBatch, useEditBatch, useGetBlackList, useListProducts } from "@/api/products";
import { IconedButton } from "@/common/components/buttons";
import { Button, ButtonsContainer, FieldsContainer, Form, FormField, Label, Segment } from "@/common/components/custom";
import { PriceControlled, TextControlled, TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { downloadExcel } from "@/common/utils";
import { now } from "@/common/utils/dates";
import { Loader } from "@/components/layout";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Icon, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { Modal, ModalHeader, WaitMsg } from "./styles";

const BatchImport = ({ isCreating }) => {
  const { data, isLoading: loadingProducts, refetch: refetchProducts } = useListProducts();
  const products = useMemo(() => data?.products, [data?.products]);
  const { refetch: refetchBlacklist } = useGetBlackList();
  const methods = useForm();
  const { handleSubmit, formState: { isDirty }, reset, watch, setValue } = methods;
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
  const inputRef = useRef();
  const formRef = useRef(null);
  const [existingCodes, setExistingCodes] = useState({});
  const totalProducts = importedProductsCount + downloadProducts.length;
  const createBatch = useCreateBatch();
  const editBatch = useEditBatch();
  const handleBatchAction = isCreating ? createBatch : editBatch;

  const handleConfirmClick = () => {
    if (formRef.current) {
      formRef.current.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }
  };

  useEffect(() => {
    const codes = products?.reduce((acc, product) => {
      acc[product.code?.toUpperCase()] = product;
      return acc;
    }, {});

    setExistingCodes(codes);
  }, [products]);

  const importSettings = useMemo(() => {
    return {
      icon: isCreating ? ICONS.ADD : ICONS.PENCIL,
      button: isCreating ? "Crear" : "Actualizar",
      fileName: isCreating ? "Productos ya existentes" : "Productos no existentes",
      label: isCreating ? "Nuevos productos" : "Productos para actualizar",
      confirmation: isCreating ? "con errores o ya" : "no",
      onSubmit: handleBatchAction,
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
  }, [isCreating, watchProducts, isLoading, handleBatchAction]);

  const handleClick = useCallback(async () => {
    await refetchProducts();
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
    if (!file || loadingProducts) return;
    setOpen(true);
    setIsLoading(true);
    try {
      setSelectedFile(file.name);
      const updatedBlacklist = await refetchBlacklist().then(result => result.data || []);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const data = event.target.result;
          await processFile(data, products, updatedBlacklist);
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

  const processFile = async (data, updatedProducts, blacklist) => {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const headersRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

    const columnMapping = {
      Codigo: "code",
      Código: "code",
      Nombre: "name",
      Marca: "brand",
      Proveedor: "supplier",
      Costo: "cost",
      Precio: "price",
      Estado: "state",
      Comentarios: "comments",
    };

    const transformedHeaders = [];
    const seenMappedColumns = new Set();

    headersRow.forEach(header => {
      const mappedColumn = columnMapping[header];

      if (mappedColumn && seenMappedColumns.has(mappedColumn)) {
        return;
      }

      if (mappedColumn) {
        transformedHeaders.push(mappedColumn);
        seenMappedColumns.add(mappedColumn);
      } else {
        transformedHeaders.push(header);
      }
    });

    for (let i = 0; i < transformedHeaders.length; i++) {
      sheet[XLSX.utils.encode_cell({ r: 0, c: i })] = {
        v: transformedHeaders[i],
        t: 's',
      };
    }

    let parsedData = XLSX.utils.sheet_to_json(sheet, { header: transformedHeaders, range: 1 });

    const importProducts = [];
    const downloadProducts = [];
    const productCounts = {};

    const updatedExistingCodes = updatedProducts?.reduce((acc, product) => {
      acc[product.code?.toUpperCase()] = product;
      return acc;
    }, {});

    parsedData.forEach(product => {
      const code = product.code ? String(product.code).toUpperCase() : "Sin código";
      productCounts[code] = (productCounts[code] || 0) + 1;
    });

    parsedData.forEach(product => {
      const code = product.code ? String(product.code).toUpperCase() : "Sin código";
      const hasAtLeastOneValue = product.code || product.name || product.price;

      if (hasAtLeastOneValue) {
        const formattedProduct = {
          code,
          name: product.name,
          price: parseInt(product.price),
          comments: product.comments
        };

        if (code === "Sin código") {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto no tiene código" });
        } else if (blacklist.some(item => item === code)) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra en la lista de productos bloqueados" });
        } else if (productCounts[code] > 1) {
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
      ['Código', 'Nombre', 'Precio', 'Comentarios', 'Error'],
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
        ["Código", "Nombre", "Precio", "Comentarios", "Mensaje de error"],
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
      if (response.statusOk) {
        toast.success(
          `Los productos se han ${isCreating ? "creado" : "actualizado"} con éxito!`
        )
        handleModalClose();
      } else {
        toast.error(response.error.message);
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
      icon: ICONS.TRASH,
      color: COLORS.RED,
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
        <TextControlled
          name={`importProducts[${index}].name`}
          placeholder="Nombre"
        />
      ), id: 2, align: 'left'
    },
    {
      title: "Precio", value: (product, index) => (
        <PriceControlled
          name={`importProducts[${index}].price`}
          placeholder="Precio"
        />
      ), id: 3, width: 3
    },
    {
      title: "Comentarios", value: (product, index) => (
        <TextControlled
          name={`importProducts[${index}].comments`}
          placeholder="Comentarios"
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
        height="fit-content"
        width="fit-content"
        paddingLeft="0"
        as="Icon"
        onClick={handleClick}
        type="button"
      >
        <Icon marginRight name={importSettings.icon} />{importSettings.button}
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
                    {`Se ha${downloadProducts.length === 1 ? '' : 'n'} encontrado ${downloadProducts.length} producto${downloadProducts.length === 1 ? '' : 's'} (de ${totalProducts}) ${importSettings.confirmation} existente${downloadProducts.length === 1 ? '' : 's'} en la lista...`}
                    <br />
                    (incluídos los temporalmente eliminados)
                    <br />
                    ¿Desea descargar un archivo de Excel con estos productos antes de continuar?
                  </p>
                </Modal.Content>
                <Modal.Actions>
                  <ButtonsContainer>
                    <IconedButton
                      text="Confirmar"
                      icon={ICONS.CHECK}
                      color={COLORS.GREEN}
                      onClick={handleDownloadConfirmation}
                    />
                    <IconedButton
                      text="Cancelar"
                      icon={ICONS.X}
                      color={COLORS.RED}
                      onClick={() => setShowConfirmationModal(false)}
                    />
                  </ButtonsContainer>
                </Modal.Actions>
              </Loader>
            </>
          ) : (
            <Loader active={loadingProducts || isLoading}>

              {watchProducts.length <= 50 ? (
                <>
                  <Modal.Content>
                    <FormProvider {...methods}>
                      <Form ref={formRef} onSubmit={handleSubmit(mutate)}>
                        <TextField width={6} label="Archivo seleccionado" value={selectedFile} disabled />
                        <Label > {`${importSettings.label}: ${importedProductsCount}`}</Label>
                        <Table
                          deleteButtonInside
                          tableHeight="50vh"
                          mainKey="code"
                          headers={PRODUCTS_COLUMNS}
                          elements={watchProducts}
                          actions={actions}
                        />
                      </Form>
                    </FormProvider>
                  </Modal.Content>
                </>
              ) : (
                <>
                  <Modal.Content>
                    <Form ref={formRef} onSubmit={handleSubmit(mutate)}>
                      <FieldsContainer>
                        <FormField width={8}>
                          <Label >Archivo seleccionado:</Label>
                          <Segment>{selectedFile}</Segment>
                        </FormField>
                        <FormField width={7}>
                          <Label >Cantidad a importar:</Label>
                          <Segment>{`${importSettings.label} ${importedProductsCount}`}</Segment>
                        </FormField>
                      </FieldsContainer>
                    </Form>
                  </Modal.Content>
                </>
              )}
              <Modal.Actions>
                <ButtonsContainer>
                  {isLoading || isPending && <WaitMsg>Esto puede demorar unos minutos...</WaitMsg>}
                  <IconedButton
                    text="Aceptar"
                    icon={ICONS.CHECK}
                    disabled={importSettings.isButtonDisabled(isPending)}
                    loading={isLoading || isPending}
                    submit
                    color={COLORS.GREEN}
                    onClick={handleConfirmClick}
                  />
                  <IconedButton
                    text="Cancelar"
                    icon={ICONS.X}
                    disabled={isLoading || isPending}
                    onClick={() => setOpen(false)}
                    color={COLORS.RED}
                  />
                </ButtonsContainer>
              </Modal.Actions>
            </Loader>
          )}
        </Modal >
      </Transition >
      <Transition animation="fade" duration={500} visible={showUnprocessedModal}>
        <Modal open={showUnprocessedModal} onClose={() => setShowUnprocessedModal(false)}>
          <ModalHeader>Confirmar descarga</ModalHeader>
          <Modal.Content>
            <p> {`Se han encontrado ${unprocessedProductsCount} de ${selectedFile} productos con errores que no pueden ser importados`}.</p>
            <p>¿Deseas descargar un archivo de Excel con estos productos?</p>
          </Modal.Content>
          <Modal.Actions>
            <IconedButton
              text="Confirmar"
              icon={ICONS.CHECK}
              color={COLORS.GREEN}
              onClick={() => {
                handleUnprocessedDownload();
              }}
            />
            <IconedButton
              text="Cancelar"
              icon={ICONS.X}
              color={COLORS.RED}
              onClick={() => {
                setShowUnprocessedModal(false);
              }}
            />
          </Modal.Actions>
        </Modal>
      </Transition>
    </>
  );
};
export default BatchImport;