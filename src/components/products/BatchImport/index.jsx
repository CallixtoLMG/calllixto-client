import { Button } from "@/common/components/custom";
import { ModalBatchImport } from "@/components/products/ModalBatchImport";
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
}) => {
  const handleOpenFile = async () => {
    await onBeforeOpenFile?.();
    inputRef.current.value = null;
    inputRef.current.click();
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
        height="fit-content"
        width="fit-content"
        $paddingLeft="0"
        as={BatchImportIcon}
        onClick={handleOpenFile}
        type="button"
        $iconOnly
      >
        <Icon name={importSettings.icon} color={importSettings.color} />
        {importSettings.button || importSettings.title}
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
