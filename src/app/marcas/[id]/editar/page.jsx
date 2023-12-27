"use client"
import { edit, getBrand } from "@/api/brands";
import { getUserData } from "@/api/userData";
import { PageHeader, Loader } from "@/components/layout";
import BrandForm from "@/components/brands/BrandForm";
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditBrand = ({ params }) => {
  const { push } = useRouter();
  const [role, setRole] = useState();
  const [brand, setBrand] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      push(PAGES.LOGIN.BASE);
    };

    async function fetchBrand() {
      var requestOptions = {
        method: 'GET',
        redirect: 'follow',
        headers: {
          authorization: `Bearer ${token}`
        },
        cache: "no-store",
      };
      const data = await getBrand(params.id, requestOptions);
      if (!data) {
        push(PAGES.NOT_FOUND.BASE);
        return;
      };
      setBrand(data);
      setIsLoading(false);
    };

    const validateToken = async () => {
      try {
        const userData = await getUserData();
        if (!userData.isAuthorized) {
          push(PAGES.LOGIN.BASE);
        };
      } catch (error) {
        console.error('Error, ingreso no valido(token):', error);
      };
    };

    const fetchRoles = async () => {
      try {
        const userData = await getUserData();
        setRole(userData.roles[0]);
      } catch (error) {
        console.error('Error al cargar marca:', error);
      };
    };

    validateToken();
    fetchBrand();
    fetchRoles();
  }, [params.id, push]);
  if (role === "user") {
    push(PAGES.NOT_FOUND.BASE);
  };
  return (
    <>
      <PageHeader title="Actualizar Marca" />
      <Loader active={isLoading}>
        {brand && <BrandForm brand={brand} onSubmit={edit} />}
      </Loader>
    </>
  )
};

export default EditBrand;

