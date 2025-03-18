import styled from "styled-components";

export const FormFieldLabel = styled.label`
  font-size: 13px;
  margin-bottom: 5px;
  font-weight: bold;
`;

export const ErrorMessage = styled.span`
position: relative;
  display: block;
  color: #9f3a38;
  background: #fff !important;
  border: 1px solid #e0b4b4;
  line-height: 12px;
  padding: .5833em .833em;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 12px;
  font-weight: 700;

  &::before {
    content: "";
    position: absolute;
    top: -5px; 
    left: 50%;
    transform: translateX(-50%) rotate(45deg);
    width: .6666em;
    height: .6666em;
    background-color: #fff6f6; 
    border-left: 1px solid #e0b4b4;
    border-top: 1px solid #e0b4b4;
  }
`;