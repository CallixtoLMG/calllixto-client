import { Flex } from "@/components/common/custom";
import Link from "next/link";
import { Container as SContainer } from "semantic-ui-react";
import styled from "styled-components";

const ModLink = styled(Link)`
  display:flex;
  position: relative;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-size: 15px;
  background-color: ${({ $active }) => ($active ? '#f5f5f5' : 'transparent')};
  &:hover {
    background-color: #f5f5f5;
  };
`;

const LogDiv = styled(Flex)`
  position: relative;
  padding: ${({ padding = "0" }) => padding}!important;
  align-items: center;
  transition: all 0.2s ease-in-out;
  font-size: 15px;
  &:hover {
    background-color: #f5f5f5!important;
  };
  a {
    &:hover {
      background-color: #f5f5f5!important;
    };
  };
`;

const Container = styled(SContainer)`
  display: flex;
  height: 60px!important;
  width: 95%!important;

  div:last-child {
    margin-left: auto!important;
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
    transform: ${({ $active }) => ($active ? "scaleX(1)" : "scaleX(0)")};
    height: 2px;
    bottom: -2px;
    left: 0;
    background-color: #0087ca;
    transform-origin: bottom right;
    transition: transform 0.25s ease-out;
  };
`;

export { Container, LogDiv, ModLink, Text };

