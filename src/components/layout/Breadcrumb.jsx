import { OverflowWrapper } from '@/common/components/custom';
import { ENTITIES, ENTITY_VIEW, ICONS, INFO, PAGES, SIZES } from '@/common/constants';
import { createContext, useContext, useEffect, useState } from 'react';
import { Popup, Breadcrumb as SBreadcrumb, BreadcrumbDivider as SBreadcrumbDivider, BreadcrumbSection as SBreadcrumbSection, Label as SLabel } from 'semantic-ui-react';
import styled from "styled-components";
import { useNavActionsContext } from '.';

const Label = styled(SLabel)`
  position: sticky!important;
  top: 5px;
  max-height: fit-content;
  margin-left: 10px!important;
`;

const Span = styled.div`
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  height: 35px !important;
`;

const BreadcrumbItemContent = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const BreadcrumbName = styled.div`
  min-width: 0;
  max-width: 500px;
  flex: 0 1 auto;
`;

const BreadcrumbDivider = styled(SBreadcrumbDivider)`
  align-self: center;
  position: inherit!important;
`;

const BreadcrumbSection = styled(SBreadcrumbSection)`
  display: flex!important;
`;

const SSBreadcrumb = styled(SBreadcrumb)`
  flex-flow: nowrap;
  display: flex!important;
`;

export const PATHNAME_ENTITY_MAP = {
  [PAGES.CUSTOMERS.BASE]: ENTITIES.CUSTOMER,
  [PAGES.SUPPLIERS.BASE]: ENTITIES.SUPPLIER,
  [PAGES.BRANDS.BASE]: ENTITIES.BRAND,
  [PAGES.PRODUCTS.BASE]: ENTITIES.PRODUCT,
  [PAGES.BUDGETS.BASE]: ENTITIES.BUDGET,
  [PAGES.EXPENSES.BASE]: ENTITIES.EXPENSE,
  [PAGES.CASH_BALANCES.BASE]: ENTITIES.CASH_BALANCE,
  [PAGES.USERS.BASE]: ENTITIES.USER,
  [PAGES.SETTINGS.BASE]: ENTITIES.SETTINGS,
};

const getEntityFromPathname = (pathname) => {
  return Object.entries(PATHNAME_ENTITY_MAP).find(([path]) =>
    pathname.startsWith(path)
  )?.[1];
};

const BreadcrumContext = createContext();

const resolveEntityContext = (pathname) => {
  if (pathname.endsWith('/crear')) {
    return { view: ENTITY_VIEW.CREATE };
  }

  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 2) {
    return { view: ENTITY_VIEW.DETAIL, id: segments[1] };
  }

  return { view: ENTITY_VIEW.LIST };
};

const BreadcrumProvider = ({ children, pathname }) => {
  const [labels, setLabels] = useState([]);
  const { setInfo } = useNavActionsContext();

  useEffect(() => {
    if (!pathname) return;

    const entity = getEntityFromPathname(pathname);
    if (!entity) {
      setInfo(null);
      return;
    }

    const { view } = resolveEntityContext(pathname);

    const help = INFO.HELP.SECTIONS?.[entity]?.[view] ?? null;
    setInfo(help);

  }, [pathname, setInfo]);;

  return (
    <BreadcrumContext.Provider value={{ labels, setLabels, pathname }}>
      {children}
    </BreadcrumContext.Provider>
  );
};

const useBreadcrumContext = () => {
  const context = useContext(BreadcrumContext);
  if (context === undefined) {
    throw new Error('useBreadcrumContext must be used within a BreadcrumProvider');
  }
  return context;
};

const Breadcrumb = () => {
  const { labels } = useBreadcrumContext();
  return (
    <SSBreadcrumb size={SIZES.HUGE}>
      {labels.filter(label => label.name).map(({ name, label }, index) => {
        return (
          <BreadcrumbSection key={`label_${index}`}>
            {index !== 0 && (
              <BreadcrumbDivider icon={ICONS.CHEVRON_RIGHT} />
            )}
            <BreadcrumbItemContent>
              <BreadcrumbName>
                <OverflowWrapper popupContent={name} maxWidth="100%">
                  {name}
                </OverflowWrapper>
              </BreadcrumbName>

              {label && (
                <Popup
                  content={label.popup}
                  disabled={!label.popup}
                  position="bottom center"
                  size="mini"
                  trigger={
                    <Label pointing="left" color={label.color}>
                      {label.title}
                    </Label>
                  }
                />
              )}
            </BreadcrumbItemContent>
          </BreadcrumbSection>
        );
      })}
    </SSBreadcrumb>
  );
};

export { BreadcrumProvider, Breadcrumb, useBreadcrumContext };

