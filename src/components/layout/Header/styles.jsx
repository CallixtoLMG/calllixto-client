import Link from "next/link";
import { Flex } from "rebass";
import { Container } from "semantic-ui-react";
import styled from "styled-components";

const ModLink = styled(Link)`
  display:flex;
  position: relative;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-size: 15px;
  background-color: ${props => props.$destacar && "#f5f5f5"};

  &:hover {
    background-color: #f5f5f5;
  };
`;

const LogDiv = styled(Flex)`
  position: relative;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-size: 15px;
  background-color: ${props => props.$destacar && "#f5f5f5"};
  &:hover {
    background-color: #f5f5f5!important;
  };
  a {
    &:hover {
      background-color: #f5f5f5!important;
    };
  };
`;

const ModContainer = styled(Container)`
  height: 60px!important;
  div:last-child {  
    margin-left: auto!important;
    border-left: 1px solid rgba(34,36,38,.1)!important;
    border-right: 1px solid rgba(34,36,38,.1)!important;
    &:before {
      width: 0px!important;
    };
  };
`;

const Text = styled.p`
  display: inline-block;
  position: relative;

  &:hover {
    &:after{
      transform: scaleX(1);
      transform-origin: bottom left;
    };
  };
  &:after {
    content: '';
    position: absolute;
    width: 100%;
    transform: ${props => props.$destacar ? "scaleX(1)" : "scaleX(0)"};
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #0087ca;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  };
`;

export { LogDiv, ModContainer, ModLink, Text };

