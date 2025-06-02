import styled from "styled-components";

export const List = styled.ul`
  list-style: none;
  padding-left: 0;
  margin-left: 5px;
`;

export const ListItem = styled.li`
  margin-bottom: 10px;
`;

export const Span = styled.span`
  color: ${({ color }) => color && color}
`;