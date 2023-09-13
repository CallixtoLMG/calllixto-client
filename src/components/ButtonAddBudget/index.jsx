import Link from 'next/link';
import { Button } from 'semantic-ui-react';

const ButtonCreateBudget = () => (
  <div>
    <Link href="/nuevoPresupuesto">
      <Button color='green' content='Crear presupuesto' icon='add' labelPosition='right' />
    </Link>
  </div>
);

export default ButtonCreateBudget;



