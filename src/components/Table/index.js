import { Cell, HeaderCell } from "./styles";
import { Table } from "semantic-ui-react";

const CustomeTable = ({ headers = [], elements = [] }) => {
  return (
    <Table celled compact striped>
      <Table.Header fullWidth>
        <HeaderCell />
        {headers.map((header) => (
          <HeaderCell key={header.id} >{header.name}</HeaderCell>
        ))}
      </Table.Header>
      <Table.Body>
        {elements.map((element) => (
          <Table.Row key={element.key}>
            <Cell>{element.key}</Cell>
            {headers.map((header) => header.value(element))}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default CustomeTable;