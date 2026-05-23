import { useCreateBatch, useEditBatch, useListProducts } from "@/api/products";
import { useGetSetting } from "@/api/settings";
import { PriceControlled, TextControlled } from "@/common/components/form";
import { COLORS, ENTITIES, FIELD_LABELS, ICONS, TOOLTIPS } from "@/common/constants";
import { downloadExcel, normalizeText } from "@/common/utils";
import { now } from "@/common/utils/dates";
import { formatCount, pluralize } from "@/common/utils/pluralization";
import { useMutation } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Checkbox } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { BatchImport } from "../BatchImport";
import { ConfirmDownloadModal } from "../ConfirmDownloadModal";

export const BatchImportProducts = ({ isCreating }) => {
  const { data, isLoading: loadingProducts, refetch: refetchProducts } = useListProducts();
  const products = useMemo(() => data?.products, [data?.products]);
  const methods = useForm();
  const { handleSubmit, reset, watch, setValue } = methods;
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
  const { refetch: refetchBlacklist } = useGetSetting(ENTITIES.PRODUCT);
  const inputRef = useRef();
  const formRef = useRef(null);
  const [existingIds, setExistingIds] = useState({});
  const totalProducts = importedProductsCount + downloadProducts.length;
  const createBatch = useCreateBatch();
  const editBatch = useEditBatch();
  const handleBatchAction = isCreating ? createBatch : editBatch;

  useEffect(() => {
    const ids = products?.reduce((acc, product) => {
      acc[product.id?.toUpperCase()] = product;
      return acc;
    }, {});

    setExistingIds(ids);
  }, [products]);

  const parseStockControl = (value) => {
    return normalizeText(value) === "si";
  };

  const importSettings = useMemo(() => {
    return {
      icon: isCreating ? ICONS.ADD : ICONS.PENCIL,
      button: isCreating ? "Crear" : "Actualizar",
      fileName: isCreating ? "Productos ya existentes" : "Productos no existentes",
      label: isCreating ? "Nuevos productos" : "Productos para actualizar",
      title: isCreating ? "Crear productos" : "Actualizar productos",
      confirmation: isCreating ? "con errores o ya" : "no",
      color: isCreating ? "green" : "blue",
      onSubmit: handleBatchAction,
      processData: (formattedProduct, existingIds, downloadProducts, importProducts, productCounts) => {
        const productId = formattedProduct.id.toUpperCase();
        if (productCounts[productId] > 1) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra duplicado" });
        } else if (existingIds[productId] && !isCreating) {
          importProducts.push(formattedProduct);
        } else if (!existingIds[productId] && isCreating) {
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

  const handleBeforeOpenFile = useCallback(async () => {
    await refetchProducts();
  }, [refetchProducts]);

  const handleModalClose = () => {
    setOpen(false);
  };

  const handleBeforeRead = async () => {
    reset();
    return refetchBlacklist().then(result => result.data.blacklist || []);
  };

  const handleFileRead = async (data, { beforeReadData }) => {
    try {
      await processFile(data, products, beforeReadData);
    } catch (error) {
      console.error("Error processing file:", error);
    }
  };

  const processFile = async (data, updatedProducts, blacklist) => {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];

    const headersRow = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0];

    const columnMapping = {
      id: "id",
      codigo: "id",
      nombre: "name",
      marca: "brand",
      proveedor: "supplier",
      costo: "cost",
      precio: "price",
      stock: "stockControl",
      stockcontrol: "stockControl",
      "control de stock": "stockControl",
      "controlar stock": "stockControl",
      estado: "state",
      comentarios: "comments",
    };

    const transformedHeaders = [];
    const seenMappedColumns = new Set();

    headersRow.forEach(header => {
      const normalizedHeader = normalizeText(header);
      const mappedColumn = columnMapping[normalizedHeader];

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

    const updatedExistingIds = updatedProducts?.reduce((acc, product) => {
      acc[product.id?.toUpperCase()] = product;
      return acc;
    }, {});

    parsedData.forEach(product => {
      const id = product.id ? String(product.id).toUpperCase() : "Sin id";
      productCounts[id] = (productCounts[id] || 0) + 1;
    });

    parsedData.forEach(product => {
      const id = product.id ? String(product.id).toUpperCase() : "Sin id";
      const hasAtLeastOneValue = product.id || product.name || product.cost || product.price;

      if (hasAtLeastOneValue) {
        const formattedProduct = {
          id,
          name: product.name,
          cost: isNaN(parseFloat(product.cost)) ? 0 : parseFloat(product.cost),
          price: isNaN(parseFloat(product.price)) ? 0 : parseFloat(product.price),
          stockControl: normalizeText(product.stockControl) ?? "",
          comments: product.comments
        };

        if (id === "Sin id") {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto no tiene id" });
        } else if (blacklist.some(item => item === id)) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra en la lista de productos bloqueados" });
        } else if (productCounts[id] > 1) {
          downloadProducts.push({ ...formattedProduct, msg: "Este producto se encuentra duplicado" });
        } else if (updatedExistingIds && updatedExistingIds[id] && !isCreating) {
          importProducts.push(formattedProduct);
        } else if (updatedExistingIds && !updatedExistingIds[id] && isCreating) {
          importProducts.push(formattedProduct);
        } else {
          const msg = isCreating ? "Este producto ya existe" : "Este producto no existe";
          downloadProducts.push({ ...formattedProduct, msg });
        }
      }
    });

    setValue("importProducts", importProducts);
    setImportedProductsCount(importProducts.length);

    if (downloadProducts.length) {
      setShowConfirmationModal(true);
      setDownloadProducts(downloadProducts);
    }
  };

  const handleDownloadConfirmation = () => {
    const data = [
      ["Id", "Nombre", "Costo", "Precio", "Controlar stock", "Comentarios", "Error"],
      ...downloadProducts.map((product) => [
        product.id,
        product.name,
        product.cost,
        product.price,
        product.stockControl,
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
        ["Id", "Nombre", "Costo", "Precio", "Controlar stock", "Comentarios", "Mensaje de error"],
        ...data.map(product => [
          product.id,
          product.name,
          product.cost,
          product.price,
          product.stockControl,
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

        const processedProducts = e.importProducts.map(product => ({
          ...product,
          stockControl: parseStockControl(product.stockControl),
        }));

        const { data } = await importSettings.onSubmit(processedProducts);
        return data;

      } else {

        const processedProducts = e.importProducts
          .map(product => {
            const existingProduct = existingIds[product.id.toUpperCase()];

            const parsedProduct = {
              ...product,
              stockControl: parseStockControl(product.stockControl),
            };

            let productWithChanges = { id: product.id };
            let previousVersion = {};

            Object.keys(parsedProduct).forEach(key => {
              if (
                key !== 'id' &&
                parsedProduct[key] !== undefined &&
                parsedProduct[key] !== '' &&
                parsedProduct[key] !== existingProduct[key]
              ) {
                productWithChanges[key] = parsedProduct[key];
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
        }
      }
    },

    onSuccess: (response) => {
      if (response.statusOk) {
        toast.success(
          `Los productos se han ${isCreating ? "creado" : "actualizado"} con éxito!`
        );
        handleModalClose();
        refetchProducts();
      } else {
        toast.error(`${response?.message} (${response?.error?.message})`);
      }

      if (response.unprocessed?.length) {
        setShowUnprocessedModal(true);
        setUnprocessedResponse({ response });
        setUnprocessedProductsCount(response.unprocessed?.length);
      }
    },
  });

  const onSubmitForm = handleSubmit(mutate);

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
      tooltip: TOOLTIPS.DELETE,
      onClick: (element, index) => {
        deleteProduct(index);
      },
    }
  ];

  const PRODUCTS_COLUMNS = [
    {
      title: FIELD_LABELS.ID,
      value: (product) => product.id,
      id: 1,
      width: 2
    },
    {
      title: FIELD_LABELS.NAME, value: (product, index) => (
        <TextControlled
          name={`importProducts[${index}].name`}
          placeholder={FIELD_LABELS.NAME}
        />
      ), id: 2, align: 'left'
    },
    {
      title: FIELD_LABELS.COST, value: (product, index) => (
        <PriceControlled
          name={`importProducts[${index}].cost`}
          placeholder={FIELD_LABELS.COST}
        />
      ), id: 3, width: 2
    },
    {
      title: FIELD_LABELS.PRICE, value: (product, index) => (
        <PriceControlled
          name={`importProducts[${index}].price`}
          placeholder={FIELD_LABELS.PRICE}
        />
      ), id: 4, width: 2
    },
    {
      title: "Controlar stock",
      value: (product, index) => {
        const currentValue = product.stockControl;

        const isChecked = normalizeText(currentValue) === "si";

        return (
          <Checkbox
            toggle
            checked={isChecked}
            onChange={(_, data) => {
              setValue(
                `importProducts[${index}].stockControl`,
                data.checked ? "si" : "no",
                { shouldDirty: true, shouldValidate: true }
              );
            }}
          />
        );
      },
      id: 6,
      width: 2
    },
    {
      title: FIELD_LABELS.COMMENTS, value: (product, index) => (
        <TextControlled
          name={`importProducts[${index}].comments`}
          placeholder={FIELD_LABELS.COMMENTS}
        />
      ), id: 5, align: 'left'
    },
  ];

  return (
    <>
      <BatchImport
        open={open}
        onClose={handleModalClose}
        onOpen={() => setOpen(true)}
        onBeforeOpenFile={handleBeforeOpenFile}
        onBeforeRead={handleBeforeRead}
        onFileRead={handleFileRead}
        onFileError={(error) => console.error("Error al cargar los datos necesarios:", error)}
        methods={methods}
        formRef={formRef}
        inputRef={inputRef}
        rows={watchProducts}
        columns={PRODUCTS_COLUMNS}
        actions={actions}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        importSettings={importSettings}
        importedRowsCount={importedProductsCount}
        isLoading={isLoading}
        setIsLoading={setIsLoading}
        loadingRows={loadingProducts}
        isPending={isPending}
        onSubmit={onSubmitForm}
        openBeforeRead
        accept=".xlsx, .xls, .xlsm"
      />
      <ConfirmDownloadModal
        open={showConfirmationModal}
        title="Confirmar descarga"
        description={
          <>
            {`${pluralize(downloadProducts.length, "Se ha encontrado", "Se han encontrado")} ${formatCount(downloadProducts.length, "product")} (de ${totalProducts}) ${importSettings.confirmation
              } ${pluralize(downloadProducts.length, "existente", "existentes")} en la lista.`}
            <br />
            (incluídos los temporalmente eliminados)
            <br />
            ¿Desea descargar un archivo de Excel con estos productos antes de continuar?
          </>
        }
        onConfirm={handleDownloadConfirmation}
        onCancel={() => setShowConfirmationModal(false)}
      />
      <ConfirmDownloadModal
        open={showUnprocessedModal}
        title="Confirmar descarga"
        description={
          <>
            {`${pluralize(unprocessedProductsCount, "Se ha encontrado", "Se han encontrado")} ${formatCount(unprocessedProductsCount, "product")} de ${selectedFile} con ${pluralize(unprocessedProductsCount, "error", "errores")} que ${pluralize(unprocessedProductsCount, "no puede ser importado", "no pueden ser importados")}.`}
            <br />
            ¿Deseas descargar un archivo de Excel con estos productos?
          </>
        }
        onConfirm={handleUnprocessedDownload}
        onCancel={() => setShowUnprocessedModal(false)}
      />
    </>
  );
};
