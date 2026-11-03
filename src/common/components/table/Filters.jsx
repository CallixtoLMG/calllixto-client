import { Button as CustomButton, Label } from '@/common/components/custom';
import { POPUP_POSITIONS, CONTENT_SIZES, COLORS, ICONS, SIZES } from "@/common/constants";
import { formatInteger } from "@/common/utils/numbers";
import { useFormContext } from 'react-hook-form';
import { Icon, Popup } from 'semantic-ui-react';
import { IconedButton } from '../buttons';
import { DesktopRestoreAction, FiltersActions, FiltersContainer, FiltersSearchActions, HeaderSegment, MainContainer, MobileRestoreAction, NarrowRestoreAction, WideRestoreAction } from './styles';

const Filters = ({ children, onRestoreFilters, appliedCount, hydrated }) => {
  const { formState: { isDirty } } = useFormContext();

  return (
    <MainContainer>
      <HeaderSegment flex="1">
        <FiltersContainer>
          <DesktopRestoreAction>
            <Popup
              content="Restaurar filtros"
              position={POPUP_POSITIONS.TOP_CENTER}
              size={SIZES.TINY}
              trigger={(
                <CustomButton $marginBottom="2px" $alignSelf="flex-end" width={CONTENT_SIZES.FIT} $fontSize="14px" $paddingLeft="11px" padding="11px" circular icon type="button" onClick={onRestoreFilters}>
                  <Icon name={ICONS.UNDO} />
                </CustomButton>
              )}
            />
          </DesktopRestoreAction>
          {children}
        </FiltersContainer>
        <FiltersActions $columnGap="10px" $marginBottom="2px" $alignSelf="flex-end">
          {hydrated && appliedCount > 0 && (
            <Popup
              content="Filtros activos"
              position={POPUP_POSITIONS.TOP_CENTER}
              size={SIZES.TINY}
              trigger={
                <Label $alignSelf="center" width={CONTENT_SIZES.FIT} circular color={COLORS.BLUE}>{formatInteger(appliedCount)}</Label>
              }
            />
          )}
          <FiltersSearchActions>
            <MobileRestoreAction>
              <WideRestoreAction>
                <IconedButton
                  text="Restaurar filtros"
                  icon={ICONS.UNDO}
                  onClick={onRestoreFilters}
                  width="160px"
                  minWidth="160px"
                />
              </WideRestoreAction>
              <NarrowRestoreAction>
                <IconedButton
                  text="Restaurar filtros"
                  icon={ICONS.UNDO}
                  onClick={onRestoreFilters}
                  iconOnly
                  popupContent="Restaurar filtros"
                />
              </NarrowRestoreAction>
            </MobileRestoreAction>
            <IconedButton
              text="Buscar"
              icon={ICONS.SEARCH}
              submit
              color={isDirty ? COLORS.BLUE : undefined}
            />
          </FiltersSearchActions>
        </FiltersActions>
      </HeaderSegment>
    </MainContainer>
  );
}

export default Filters;
