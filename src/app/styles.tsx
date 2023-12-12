
import styled from 'styled-components';
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const Title = styled.h1`
  font-size: 48px;
  font-weight: bold;
  color: #333;
`;

const Subtitle = styled.h2`
  font-size: 24px;
  font-weight: normal;
  color: #666;
`;

export {
  Container, Subtitle, Title
};

