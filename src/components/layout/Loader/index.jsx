import React from "react";
import { Dimmer, Loader as LoaderComp, Segment } from "semantic-ui-react";

const Loader = ({children, active}) => {
    return (
    <>

  {active ? <LoaderComp active size="large"/> : children }
        </>
    );
};

export default Loader;
