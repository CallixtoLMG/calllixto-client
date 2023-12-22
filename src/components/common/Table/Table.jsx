import Link from "next/link";
import { HeaderCell } from "./styles";
import { Table } from "semantic-ui-react";
import { useRouter } from "next/navigation";

const CustomeTable = ({ headers = [], elements = [], page }) => {
  const { push } = useRouter();
  return (
    <Table celled compact striped>
      <Table.Header fullWidth>
        {headers.map((header) => (
          <HeaderCell key={header.id} >{header.title}</HeaderCell>
        ))}
      </Table.Header>
      <Table.Body>
        {elements.map((element) => {
          if (page) {
            return (
              <Table.Row key={element.key} onClick={() => push(page.SHOW(element.id)) }>
                {headers.map((header) => header.value(element))}
              </Table.Row>
            )
          }
          return (
            <Table.Row key={element.key}>
              {headers.map((header) => header.value(element))}
            </Table.Row>
          )
        })}
      </Table.Body>
    </Table>
  );
};

export default CustomeTable;