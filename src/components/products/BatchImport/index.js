import { LIST_PRODUCTS_QUERY_KEY, useListBanProducts } from "@/api/products";
import { Button, FieldsContainer, Form, FormField, Input, Label, Segment } from "@/components/common/custom";
import { Table } from "@/components/common/table";
import { CURRENCY, LOCALE, REGEX, RULES } from "@/constants";
import { downloadExcel } from "@/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback, useRef, useState } from "react";
import { CurrencyInput } from "react-currency-mask";
import { Controller, useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { ButtonContent, Icon, Transition } from "semantic-ui-react";
import * as XLSX from "xlsx";
import { ContainerModal, Modal, ModalActions, WarningMessage } from "./styles";

const BatchImport = ({ products, isCreating, task }) => {
  const { data: blacklist, isLoading: loadingBlacklist } = useListBanProducts();
  const { handleSubmit, control, reset, setValue, formState: { errors, isDirty }, watch } = useForm();
  const [open, setOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProducts, setDownloadProducts] = useState([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const watchProducts = watch("importProducts", []);
  const queryClient = useQueryClient();
  const { buttonText, onSubmit, processData } = task;
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
        const isValidCode = product.code && REGEX.FIVE_DIGIT_CODE.test(code);
        const price = parseFloat(product.price);

        if (isValidCode && !blacklist?.some(item => item === code) && price > 0) {
          const formattedProduct = { ...product, code, price };

          processData(
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
  }, [blacklist, loadingBlacklist, products, reset, setValue, task]);

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

  const handleCancelDownloadConfirmation = () => {
    setShowConfirmationModal(false);
    setOpen(true);
  };

  const { mutate, isPending } = useMutation({
    mutationFn: async (products) => {
      const { data } = await onSubmit(products.importProducts);
      return data;
    },
    onSuccess: (response) => {
      if (response.statusOk) {
        queryClient.invalidateQueries({ queryKey: [LIST_PRODUCTS_QUERY_KEY] });
        toast.success('Por favor funciona');
        handleModalClose();
      } else {
        toast.error(response.message);
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
          {buttonText}
        </ButtonContent>
        <ButtonContent visible>
          <Icon name="upload" />
        </ButtonContent>
      </Button>

      <Transition animation="fade" duration={500} visible={open} >

        <Modal
          closeIcon
          open={open}
          onClose={handleModalClose}
          onOpen={handleModalOpen}
        >
          <ContainerModal>
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
                  disabled={task.isButtonDisabled(isCreating, isLoading, isPending, isDirty)}
                  loading={isLoading || isPending}
                  type="submit"
                  color="green"
                  content="Aceptar" />
                <Button disabled={isLoading || isPending} onClick={() => setOpen(false)} color="red" content="Cancelar" />
              </ModalActions>
            </Form>
          </ContainerModal >
        </Modal >
      </Transition >
      <Transition animation="fade" duration={500} visible={showConfirmationModal} >
        <Modal
          open={showConfirmationModal}
          onClose={handleCancelDownloadConfirmation}
          size="small"
        >
          <Modal.Header>Confirmar Descarga</Modal.Header>
          <Modal.Content>
            <p>
              {`Se han encontrado productos ${task === "Crear" ? "" : "no"} existentes en la lista...`}<br /><br />
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
              onClick={handleCancelDownloadConfirmation}
              content="Cancelar"
            />
          </ModalActions>
        </Modal>
      </Transition >
    </>
  );
};

export default BatchImport;
