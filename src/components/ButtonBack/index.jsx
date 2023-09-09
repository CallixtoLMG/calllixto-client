"use client"
import { useRouter } from 'next/navigation';
import { Button } from 'semantic-ui-react';

const ButtonBack = () => {
  const router = useRouter()
  return (
    <Button onClick={() => {router.back()}}>Volver</Button>
  )
};

export default ButtonBack