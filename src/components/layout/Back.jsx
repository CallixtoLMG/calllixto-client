"use client";
import { useRouter } from 'next/navigation';
import { Button } from 'semantic-ui-react';

export const Back = () => {
  const { back } = useRouter()
  return (
    <Button onClick={() => { back() }}>Volver</Button>
  )
};
