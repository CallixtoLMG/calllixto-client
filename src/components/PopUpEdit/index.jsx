import { Button } from 'semantic-ui-react';

import Link from "next/link";

const PopUpEdit = ({ product }) => {

  return (
    <Link href={`/editarProducto/${product?.id}`}>
      < Button color='blue' size="tiny" > Editar</Button >
    </Link>
  )
};

export default PopUpEdit