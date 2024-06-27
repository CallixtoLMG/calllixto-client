import { Flex } from 'rebass';
import { FiltersContainer } from './styles';
import { Button, Icon, Popup, Segment as SSegment } from 'semantic-ui-react';
import { Paginator } from './Pagination';
import styled from 'styled-components';

const MainContainer = styled(Flex)`
  flex-direction: row;
  width: 100% !important;
  column-gap: 10px;
`;

const HeaderSegment = styled(SSegment)`
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  padding: 10px !important;
  margin: 0 !important;
  justify-content: flex-end!important;
`;

const Filters = ({ children, onRestoreFilters }) => {
  return (
    <MainContainer>
      <HeaderSegment flex="1">
        <Flex justifyContent="space-between">
          <FiltersContainer>
            <Popup
              content="Restaurar filtros"
              position="top center"
              size="tiny"
              trigger={(
                <Button circular icon type="button" onClick={onRestoreFilters}>
                  <Icon name="undo" />
                </Button>
              )}
            />
            {children}
          </FiltersContainer>
          <Button marginLeft="10px" type="submit" width="110px">
            <Flex justifyContent="space-around">
              <Icon name="search" />
            </Flex>
          </Button>
        </Flex>
      </HeaderSegment>
      <HeaderSegment>
        <Paginator />
      </HeaderSegment>
    </MainContainer>
  )
}

export default Filters;