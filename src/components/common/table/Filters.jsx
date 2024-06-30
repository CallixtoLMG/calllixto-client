import { Flex } from 'rebass';
import { Button, Icon, Popup, Segment as SSegment } from 'semantic-ui-react';
import styled from 'styled-components';
import { Paginator } from './Pagination';
import { FiltersContainer } from './styles';

const MainContainer = styled(Flex)`
  column-gap: 10px;
`;

const HeaderSegment = styled(SSegment)`
  flex: ${({ flex = 'none' }) => `${flex}!important`};
  padding: 5px 10px !important;
  margin: 0 !important;
  justify-content: flex-end!important;
  column-gap: 10px;
  align-content: center;
`;

const Filters = ({ children, onRestoreFilters }) => {
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
          <Button circular icon type="submit">
            <Icon name="search" />
          </Button>
        </FiltersContainer>
      </HeaderSegment>
      <HeaderSegment >
        <Paginator />
      </HeaderSegment>
    </MainContainer>
  )
}

export default Filters;