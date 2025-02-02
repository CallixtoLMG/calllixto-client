import { Flex } from '@/common/components/custom';
import { COLORS, ICONS } from "@/common/constants";
import { useFormContext } from 'react-hook-form';
import { Button, Icon, Popup, Segment as SSegment } from 'semantic-ui-react';
import styled from 'styled-components';
import { IconedButton } from '../buttons';
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
  const { formState: { isDirty } } = useFormContext();
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
          <IconedButton
            text="Buscar"
            icon={ICONS.SEARCH}
            submit
            color={isDirty ? COLORS.PRIMARY : COLORS.SOFT_GREY}
            width="130px"
          />
          <IconedButton
            text="Actualizar"
            icon={ICONS.REFRESH}
            color={COLORS.SOFT_GREY}
            width="fit-content"
            onClick={onRefetch}
          />
        </Flex>
      </HeaderSegment>
    </MainContainer>
  )
}

export default Filters;