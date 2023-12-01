import React from "react";
import { Dimmer, Image, Loader, Segment } from "semantic-ui-react";

const Loader1 = ({children, active}) => {
    return (
        <Segment>
            <Dimmer active={active} inverted>
                <Loader size="large"/>
            </Dimmer>
            {children}
        </Segment>
    );
};

export default Loader1;
