import { FormField } from '../../custom';
import { Table } from '../../table';

export const ContactSectionView = ({ elements = [], headers, mainKey, wrap = false }) => (
  <FormField flex="1">
    <Table
      $wrap={wrap}
      headers={headers}
      elements={elements}
      mainKey={mainKey}
    />
  </FormField>
);
