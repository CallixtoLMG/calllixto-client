import { Flex } from '@/components/common/custom';
import { Button, Icon, Popup, Segment as SSegment } from 'semantic-ui-react';
import styled from 'styled-components';
import { Paginator } from './Pagination';
import { FiltersContainer } from './styles';

const MainContainer = styled(Flex)`
  column-gap: 10px;
`;

const HeaderSegment = styled(SSegment)`
  display: flex;
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  padding: 5px 10px !important;
  margin: 0 !important;
  column-gap: 10px;
  align-content: center;
  justify-content: space-between;
`;

const Filters = ({ children, onRestoreFilters, clearSelection }) => {
  return (
    <MainContainer>
      <HeaderSegment flex="1">
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
        <Flex alignSelf="center">
          <Button circular icon type="submit">
            <Icon name="search" />
          </Button>
        </Flex>
      </HeaderSegment>
      <HeaderSegment >
        <Paginator onGoPreviousPage={clearSelection} onGoNextPage={clearSelection} />
      </HeaderSegment>
    </MainContainer>
  )
}

export default Filters;