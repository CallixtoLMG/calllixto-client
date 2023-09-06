import Link from 'next/link';
import { Button } from 'semantic-ui-react';

const CreateBudget = () => (
  <div>
    <Link href={"/presupuestos"}>
      <Button color='green' content='Crear presupuesto' icon='add' labelPosition='right' />
    </Link>
  </div>
)

export default CreateBudget;



