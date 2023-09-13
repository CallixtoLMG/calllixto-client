import Link from "next/link";
import { Button } from 'semantic-ui-react';
import { MainContainer } from "./styles";

const AddProducts = () => {
  return (
    <MainContainer>
      <Link href={"/nuevoProducto"}>
        <Button color='green' content='Agregar nuevo producto' icon='add' labelPosition='right' />
      </Link>
    </MainContainer>
  )
};

export default AddProducts;

