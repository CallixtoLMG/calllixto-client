import styled from "styled-components";

const Common = styled.div`
  height: ${({ height = 'auto' }) => height};
  width: ${({ width = 'auto' }) => width};
  margin: ${({ margin = '0' }) => margin};
  margin-bottom: ${({ marginBottom = '0' }) => marginBottom};
  margin-top: ${({ marginTop = '0' }) => marginTop};
  margin-left: ${({ marginLeft = '0' }) => marginLeft};
  margin-right: ${({ marginRight = '0' }) => marginRight};
  padding: ${({ padding = '0' }) => padding};
  padding-bottom: ${({ paddingBottom = '0' }) => paddingBottom};
  padding-top: ${({ paddingTop = '0' }) => paddingTop};
  padding-left: ${({ paddingLeft = '0' }) => paddingLeft};
  padding-right: ${({ paddingRight = '0' }) => paddingRight};
`;

export const Flex = styled(Common)`
  display: flex;
  grid-column-gap: ${({ columnGap }) => columnGap};
  grid-row-gap: ${({ rowGap }) => rowGap};
  flex: ${({ flex }) => flex};
  align-items: ${({ alignItems }) => alignItems};
  justify-content: ${({ justifyContent }) => justifyContent};
  align-self: ${({ alignSelf }) => alignSelf};
  flex-wrap: ${({ wrap }) => wrap};
  flex-direction: ${({ flexDirection = "row" }) => flexDirection};
`;

export const FlexColumn = styled(Flex)`
  flex-direction: column;
`;

export const Box = styled(Common)`
  display: block;
`;