import { CONTENT_SIZES } from "@/common/constants";
import { Button } from "@/common/components/custom";
import { ModalBatchImport } from "@/components/products/ModalBatchImport";
import { useRef, useState } from "react";
import { toast } from "react-hot-toast";
import { Icon } from "semantic-ui-react";
import { BatchImportIcon } from "./styles";

export const BatchImport = ({
  open,
  onClose,
  onOpen,
  onBeforeOpenFile,
  onBeforeRead,
  onFileRead,
  onFileError,
  methods,
  formRef,
  inputRef,
  rows,
  columns,
  actions,
  selectedFile,
  setSelectedFile,
  isLoading,
  setIsLoading,
  loadingRows,
  isPending,
  onSubmit,
  importSettings,
  importedRowsCount,
  openBeforeRead = false,
  accept = ".xlsx,.xls,.xlsm",
  triggerClassName,
  disabled = false,
}) => {
  const opening = useRef(false);
  const [isOpening, setIsOpening] = useState(false);
  const handleOpenFile = async () => {
    if (disabled || opening.current) return;
    opening.current = true;
    setIsOpening(true);
    try {
      if (await onBeforeOpenFile?.() === false) return;
      inputRef.current.value = null;
      inputRef.current.click();
    } catch (error) {
      toast.error(error.message || "No se pudieron cargar los datos necesarios.");
    } finally {
      opening.current = false;
      setIsOpening(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file || loadingRows) return;

    setSelectedFile(file.name);
    setIsLoading(true);

    if (openBeforeRead) {
      onOpen();
    }

    try {
      const beforeReadData = await onBeforeRead?.(file);
      const reader = new FileReader();

      reader.onload = async (event) => {
        await onFileRead(event.target.result, {
          file,
          beforeReadData,
          open: onOpen,
        });
      };
      reader.onerror = onFileError;

      reader.readAsBinaryString(file);
    } catch (error) {
      onFileError?.(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        id="file"
        accept={accept}
        style={{ display: "none" }}
        onChange={handleFileUpload}
      />
      <Button
        className={triggerClassName}
        height={CONTENT_SIZES.FIT}
        width={CONTENT_SIZES.FIT}
        $paddingLeft="0"
        as={triggerClassName ? undefined : BatchImportIcon}
        onClick={disabled ? undefined : handleOpenFile}
        disabled={disabled || isOpening}
        loading={isOpening}
        type="button"
        $iconOnly
      >
        <Icon name={importSettings.icon} color={importSettings.color} />
        {triggerClassName
          ? <span>{importSettings.button || importSettings.title}</span>
          : importSettings.button || importSettings.title}
      </Button>
      <ModalBatchImport
        open={open}
        onClose={onClose}
        methods={methods}
        formRef={formRef}
        products={rows}
        columns={columns}
        actions={actions}
        selectedFile={selectedFile}
        importSettings={importSettings}
        importedProductsCount={importedRowsCount}
        isLoading={isLoading}
        loadingProducts={loadingRows}
        isPending={isPending}
        onSubmit={onSubmit}
      />
    </>
  );
};
