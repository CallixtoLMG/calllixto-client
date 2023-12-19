"use client"
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';

const NotFound: React.FC = () => {
  const router = useRouter()
  useEffect(() => {
    router.push("/ups")
  }, [])
  return (
    <>
    </>
  )
};

export default NotFound;