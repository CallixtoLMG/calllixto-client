"use client";
// import { deleteCustomer } from "@/api/customers";
import ButtonDelete from "@/components/buttons/Delete";
import ButtonEdit from "@/components/buttons/Edit";
import ButtonGoTo from "@/components/buttons/GoTo";
import Loader from "@/components/layout/Loader";
import PageHeader from "@/components/layout/PageHeader";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Table } from "semantic-ui-react";
import { HEADERS } from "../clients.common";
import { ButtonContainer, HeaderContainer, ModTable, ModTableCell, ModTableHeaderCell, ModTableRow } from "./styles";

const CustomersPage = ({ customers = [], isLoading, onDelete }) => {
  const router = useRouter();
  const deleteQuestion = (name) => `¿Está seguro que desea eliminar el cliente "${name}"?`;

  return (
    <>
      <Loader active={isLoading}>
        <HeaderContainer>
          <PageHeader title={"Clientes"} />
        </HeaderContainer>
        <ButtonContainer>
          <ButtonGoTo
            color="green"
            text="Crear cliente"
            iconName="add"
            goTo={PAGES.CUSTOMERS.CREATE} />
        </ButtonContainer>
        {!!customers.length &&
          <ModTable celled compact>
            <Table.Header fullWidth>
              <ModTableRow>
                <ModTableHeaderCell ></ModTableHeaderCell>
                {HEADERS.map((header) => (
                  <ModTableHeaderCell key={header.id} >{header.name}</ModTableHeaderCell>
                ))}
              </ModTableRow>
            </Table.Header>
            {customers.map((customer, index) => (
              <Table.Body key={customer.name}>
                <ModTableRow >
                  <ModTableCell >{index + 1}</ModTableCell>
                  {HEADERS
                    .filter(header => !header.hide)
                    .map((header) => <ModTableCell
                      onClick={() => { router.push(PAGES.CUSTOMERS.SHOW(customer.id)) }}
                      key={header.id}
                    >
                      {customer[header.value]}
                    </ModTableCell>)
                  }
                  <ModTableCell >
                    <ButtonEdit page={"CUSTOMERS"} element={customer.id} />
                    <ButtonDelete
                      onDelete={onDelete}
                      params={customer.id}
                      deleteQuestion={deleteQuestion(customer.name)} />
                  </ModTableCell>
                </ModTableRow>
              </Table.Body>
            ))}
          </ModTable>
        }
      </Loader>
    </>
  );
};

export default CustomersPage;
