import Footer from "@/components/Footer";
import Header from "@/components/Header";

const ProductsLayout = ({ children }) => {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  )
};

export default ProductsLayout;