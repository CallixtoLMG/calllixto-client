"use client"
import { PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import React, { useEffect } from 'react';

const NotFound: React.FC = () => {
  const { push } = useRouter()
  useEffect(() => {
    push(PAGES.NOT_FOUND.BASE);
  }, [push])
  return (
    <></>
  )
};

export default NotFound;