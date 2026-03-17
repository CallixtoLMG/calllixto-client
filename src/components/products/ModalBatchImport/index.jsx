import { IconedButton } from "@/common/components/buttons";
import { ButtonsContainer, FieldsContainer, Flex, Form, FormField, Label, Segment, } from "@/common/components/custom";
import { TextField } from "@/common/components/form";
import { Table } from "@/common/components/table";
import { COLORS, ICONS } from "@/common/constants";
import { Loader } from "@/components/layout";
import { FormProvider } from "react-hook-form";
import { Icon, Modal, Transition } from "semantic-ui-react";
import { Header, WaitMsg } from "./styles";

export const ModalBatchImport = ({
  open,
  onClose,
  methods,
  formRef,
  products,
  columns,
  actions,
  selectedFile,
  importSettings,
  importedProductsCount,
  isLoading,
  isPending,
  onSubmit,
  loadingProducts,
}) => {
  return (
    <Transition animation="scale" duration={500} visible={open}>
      <Modal closeIcon open={open} onClose={onClose} size="fullscreen">
        <Loader $greyColor active={loadingProducts || isLoading} >
          {products.length <= 50 ? (
            <Modal.Content>
              <FormProvider {...methods}>
                <Form ref={formRef} onSubmit={onSubmit}>
                  <Flex>
                    <Icon name={importSettings.icon} color={importSettings.color} />
                    <Header> {importSettings.title}</Header>
                  </Flex>
                  <TextField
                    width={6}
                    label="Archivo seleccionado"
                    value={selectedFile}
                    disabled
                  />
                  <Label>
                    <Icon name={importSettings.icon} color={importSettings.color} />{`${importSettings.label}: ${importedProductsCount}`}
                  </Label>
                  <Table
                    $deleteButtonInside
                    $tableHeight="50vh"
                    mainKey="id"
                    headers={columns}
                    elements={products}
                    actions={actions}
                  />
                </Form>
              </FormProvider>
            </Modal.Content>
          ) : (
            <Modal.Content>
              <Form ref={formRef} onSubmit={onSubmit}>
                <FieldsContainer  >
                  <FormField $rowGap="8px" width={8}>
                    <Label>Archivo seleccionado:</Label>
                    <Segment>{selectedFile}</Segment>
                  </FormField >
                  <FormField $rowGap="8px" width={7}>
                    <Label>Cantidad a importar:</Label>
                    <Segment>
                      {`${importSettings.label} ${importedProductsCount}`}
                    </Segment>
                  </FormField>
                </FieldsContainer>
              </Form>
            </Modal.Content>
          )}

          <Modal.Actions>
            <ButtonsContainer>
              {(isLoading || isPending) && (
                <WaitMsg>Esto puede demorar unos minutos...</WaitMsg>
              )}
              <IconedButton
                text="Cancelar"
                icon={ICONS.X}
                color={COLORS.RED}
                disabled={isLoading || isPending}
                onClick={onClose}
              />
              <IconedButton
                text="Aceptar"
                icon={ICONS.CHECK}
                color={COLORS.GREEN}
                submit
                loading={isLoading || isPending}
                disabled={importSettings?.isButtonDisabled(isPending)}
                onClick={onSubmit}
              />
            </ButtonsContainer>
          </Modal.Actions>
        </Loader >
      </Modal>
    </Transition>
  );
};

