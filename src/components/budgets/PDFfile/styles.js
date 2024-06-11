import { Flex } from "rebass";
import { Header as SHeader, Image as SImage, Label as SLabel, Segment as SSegment, Table } from "semantic-ui-react";
import styled from "styled-components";

const CustomerDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
  flex-direction: column;
  row-gap: 10px;
`;

const TableRowHeader = styled(Table.Row)`
  height: 35px!important;
`;

const ClientDataContainer = styled(Flex)`
  div:last-child { margin: 0!important; };
  justify-content: space-between;
`;

const HeaderContainer = styled(Flex)`
  flex-direction: row!important;
  justify-content: space-between;
  width: 100%;
  padding: 45px 15px 10px 15px!important;
`;

const DataContainer = styled(Flex)`
  flex-direction: column;
  margin: 0 10px 0px 0!important;
  width: ${({ width }) => width} !important;
`;

const PayMethodContainer = styled(Flex)`
  margin-top: 18px!important;
  align-items: center;
`;

const Title = styled(SHeader)`
  margin: auto 100px 0 0!important;
  color: rgba(235,124,21,255)!important;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  border-bottom: ${({ borderless }) => borderless ? "0px solid grey" : " 1px solid grey"} !important;
  margin: 10px 0;
`;

const Sign = styled.div`
  width: 40%;
  height: 3px;
  color: green;
  border-radius: 15px;
  border-bottom: 3px solid grey;
  margin-top: ${(props) => props.marginTop || "0!important"};
`;

const SubtleLabel = styled(SLabel)`
  background-color: white !important;
  border: 0.5px solid grey !important;
`;

const Comment = styled(SSegment)`
  width: 100%!important;
  margin: 0!important;
  min-height: 60px !important;
  box-shadow: 0 0 0 0 !important;
  background-color: white !important;
  border: 0.5px solid grey !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  padding: 8px !important;
`;

const Image = styled(SImage)`
  &&& {
    height: 50px!important;
  };
`;

const Header = styled(SHeader)`
  margin: 0 !important;
`;

const PayMethodsContainer = styled(Flex)`
  flex-wrap: wrap;
  row-gap: 5px;
  column-gap: 5px;
  margin-left: 15px !important;
`;

const Segment = styled(SSegment)`
  min-height: ${(props) => props.minHeight || ""};
  margin-top: ${(props) => props.marginTop || "5px"} !important;
  box-shadow: 0 0 0 0 !important;
  background-color: white !important;
  border: 0.5px solid grey !important;
  border-top-left-radius: 0 !important;
  border-top-right-radius: 0 !important;
  height: 30px!important;
  padding: 0 5px!important;
  line-height: 28px!important;
`;

const Label = styled(SLabel)`
  border: 0.5px solid grey!important;
  border-bottom-left-radius: 0!important;
  border-bottom-right-radius: 0!important;
  margin: 0!important;
  margin-bottom: -1px!important;
  height: 30px!important;
  padding: 0 5px!important;
  line-height: 30px!important;
`;

export { ClientDataContainer, Comment, CustomerDataContainer, DataContainer, Divider, Header, HeaderContainer, Image, Label, PayMethodContainer, PayMethodsContainer, Segment, Sign, SubtleLabel, TableRowHeader, Title };

