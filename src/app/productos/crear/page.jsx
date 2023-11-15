import { create } from "@/apiCalls/products";
import ProductForm from "@/components/products/ProductForm";

const CreateProduct = () => {
  
  return (
    <ProductForm onSubmit={create} />
  )
};

export default CreateProduct;