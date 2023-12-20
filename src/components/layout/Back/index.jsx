"use client";
import { useRouter } from 'next/navigation';
import { Button } from 'semantic-ui-react';

const Back = () => {
  const { back } = useRouter()
  return (
    <Button onClick={() => { back() }}>Volver</Button>
  )
};

export default Back;