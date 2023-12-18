import React from "react";
import { Loader as LoaderComp } from "semantic-ui-react";

const Loader = ({ children, active, message }) => {
  return (
    <>
      {active ? <LoaderComp active size="large">{message && message}</LoaderComp> : children}
    </>
  );
};

export default Loader;
