import { Flex } from '@/components/common/custom';
import { COLORS, ICONS } from "@/constants";
import { Button, Icon, Popup, Segment as SSegment } from 'semantic-ui-react';
import styled from 'styled-components';
import { IconnedButton } from '../buttons';
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

const Filters = ({ children, onRestoreFilters, onRefetch }) => {
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
                <Icon name={ICONS.UNDO} />
              </Button>
            )}
          />
          {children}
        </FiltersContainer>
        <Flex columnGap="10px" alignSelf="center">
          <IconnedButton
            text="Buscar"
            icon={ICONS.SEARCH}
            submit
            color={COLORS.SOFT_GREY}
            width='130px'
          />
          <Popup
            content="Actualizar tabla"
            position="right center"
            size="tiny"
            trigger={(
              <Button circular icon type="button" onClick={onRefetch}>
                <Icon color={COLORS.WHITE} name={ICONS.REFRESH} />
              </Button>
            )}
          />
        </Flex>

      </HeaderSegment>
    </MainContainer>
  )
}

export default Filters;