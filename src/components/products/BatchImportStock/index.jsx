"use client";

import { useAddSupplierStock } from "@/api/stock";
import { Button } from "@/common/components/custom";
import { TextControlled } from "@/common/components/form";
import { COLORS, ICONS } from "@/common/constants";
import { downloadExcel, normalizeText } from "@/common/utils";
import { getDateUTC } from "@/common/utils/dates";
import { ConfirmDownloadModal } from "@/components/products/ConfirmDownloadModal";
import { ModalBatchImport } from "@/components/products/ModalBatchImport";
import { useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Icon } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { NumberControlled } from "../../../common/components/form";
import { DISCOUNT_STOCK, UPLOAD_STOCK } from "../products.constants";
import { BatchImportIcon } from "./styles";

export const BatchImportStock = ({
  mode,
  supplierId,
  products = [],
}) => {
  const isDiscount = mode === DISCOUNT_STOCK;
  const methods = useForm();
  const { handleSubmit, watch, setValue, reset } = methods;
  const [openModal, setOpenModal] = useState(false);
  const formRef = useRef(null);
  const inputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadRows, setDownloadRows] = useState([]);
  const [showConfirmDownload, setShowConfirmDownload] = useState(false);
  const flows = watch("flows", []);
  const addSupplierStock = useAddSupplierStock();

  const productIndex = useMemo(() => {
    return products.reduce((acc, p) => {
      acc[p.id?.toUpperCase()] = p;
      return acc;
    }, {});
  }, [products]);

  const importSettings = {
    title: isDiscount ? "Descontar stock" : "Cargar stock",
    label: isDiscount ? "Movimientos a descontar" : "Movimientos a cargar",
    color: isDiscount ? COLORS.RED : COLORS.GREEN,
    icon: isDiscount ? ICONS.MINUS_SQUARE : ICONS.PLUS_SQUARE,
    isButtonDisabled: (isPending) => {
      return !flows.length || isLoading || isPending;
    },
  };

  const handleOpenFile = () => {
    reset();
    inputRef.current.value = null;
    inputRef.current.click();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file.name);
    setIsLoading(true);

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        parseExcel(event.target.result);
        setOpenModal(true);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      toast.error("Error al leer el archivo");
    } finally {
      setIsLoading(false);
    }
  };

  const parseExcelDate = (value) => {
    if (!value) return null;
  
    if (typeof value === "number") {
      return dayjs("1899-12-30")
        .add(value, "day")
        .toDate();
    }
  
    const strict = dayjs(value, "DD/MM/YYYY", true);
    if (strict.isValid()) return strict.toDate();
  
    const parsed = dayjs(value);
    return parsed.isValid() ? parsed.toDate() : null;
  };

  const parseExcel = (data) => {
    const workbook = XLSX.read(data, { type: "binary" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];

    const raw = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    const headers = raw[0];

    const mapping = {
      id: "productId",
      fecha: "date",
      cantidad: "quantity",
      factura: "invoiceNumber",
      comentarios: "comments",
    };

    const normalizedHeaders = headers.map((h) => {
      const key = normalizeText(h);
      return mapping[key] || h;
    });

    raw[0] = normalizedHeaders;

    const parsed = XLSX.utils.sheet_to_json(sheet, {
      header: normalizedHeaders,
      range: 1,
    });

    const valid = [];
    const invalid = [];

    parsed.forEach((row) => {

      const productId = String(row.productId ?? "").toUpperCase();

      if (!productId || !productIndex[productId]) {
        invalid.push({ ...row, msg: "Producto inexistente" });
        return;
      }

      const quantity = Number(row.quantity);
      if (!quantity || quantity <= 0) {
        invalid.push({ ...row, msg: "Cantidad inválida" });
        return;
      }

      const parsedDate = parseExcelDate(row.date);

      if (!parsedDate) {
        invalid.push({ ...row, msg: "Fecha inválida" });
        return;
      }

      valid.push({
        productId,
        date: parsedDate,
        quantity: isDiscount ? -Math.abs(quantity) : Math.abs(quantity),
        invoiceNumber: row.invoiceNumber,
        comments: row.comments,
      });
    });

    setValue("flows", valid);

    if (invalid.length) {
      setDownloadRows(invalid);
      setShowConfirmDownload(true);
    }
  };

  const handleDownloadInvalid = () => {
    const data = [
      ["Id", "Fecha", "Cantidad", "Factura", "Comentarios", "Error"],
      ...downloadRows.map((row) => [
        row.productId,
        dayjs(row.date).format("DD/MM/YYYY"),
        row.quantity,
        row.invoiceNumber,
        row.comments,
        row.msg,
      ]),
    ];
    downloadExcel(data, "Movimientos con errores");
    setShowConfirmDownload(false);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedFile(null);
    reset();
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async ({ flows }) => {

      return addSupplierStock({
        supplierId,
        inflow: mode === UPLOAD_STOCK,
        flows,
      });
    },

    onSuccess: (response) => {
      if (!response?.statusOk) {
        toast.error(response?.error?.message || "Error al procesar el stock");
        return;
      }

      toast.success(
        mode === UPLOAD_STOCK
          ? "Stock cargado correctamente"
          : "Stock descontado correctamente"
      );

      handleCloseModal();
    },

    onError: () => {
      toast.error("Error inesperado al procesar el stock");
    },
  });

  const onSubmitForm = handleSubmit((data) => {
    const flows = data.flows.map(flow => ({
      ...flow,
      date: getDateUTC(flow.date),
    }));
  
    mutate({ flows });
  });

  const actions = [
    {
      id: 1,
      icon: ICONS.TRASH,
      color: COLORS.RED,
      tooltip: "Eliminar",
      onClick: (_, index) => {
        const updated = [...flows];
        updated.splice(index, 1);
        setValue("flows", updated);
      },
    },
  ];

  const STOCK_COLUMNS = [
    {
      title: "Id",
      value: (row) => row.productId,
      id: 1,
      width: 2,
    },
    {
      title: "Fecha",
      value: (_, index) => {
        const date = flows[index]?.date;

        return date
          ? dayjs(date).format("DD/MM/YYYY")
          : "";
      },
      id: 2,
    },
    {
      title: "Cantidad",
      value: (_, index) => (
        <NumberControlled
          name={`flows[${index}].quantity`}
          placeholder="Cantidad"
        />
      ),
      id: 3,
      width: 2,
    },
    {
      title: "Factura",
      value: (_, index) => (
        <TextControlled
          name={`flows[${index}].invoiceNumber`}
          placeholder="000A12"
        />
      ),
      id: 4,
    },
    {
      title: "Comentarios",
      value: (_, index) => (
        <TextControlled
          name={`flows[${index}].comments`}
          placeholder="Comentarios"
        />
      ),
      id: 5,
    },
  ];

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,.xls,.xlsm"
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <Button
        height="fit-content"
        width="fit-content"
        $paddingLeft="0"
        as={BatchImportIcon}
        onClick={handleOpenFile}
        type="button"
      >
        <Icon
          name={importSettings.icon}
          color={importSettings.color}
        />
        {importSettings.title}
      </Button>
      <ModalBatchImport
        open={openModal}
        onClose={handleCloseModal}
        methods={methods}
        formRef={formRef}
        products={flows}
        columns={STOCK_COLUMNS}
        actions={actions}
        selectedFile={selectedFile}
        importSettings={importSettings}
        importedProductsCount={flows.length}
        isLoading={isLoading}
        isPending={isPending}
        onSubmit={onSubmitForm}
      />
      <ConfirmDownloadModal
        open={showConfirmDownload}
        title="Movimientos con errores"
        description="Se encontraron filas con errores. ¿Desea descargar el Excel?"
        onConfirm={handleDownloadInvalid}
        onCancel={() => setShowConfirmDownload(false)}
      />
    </>
  );
};

