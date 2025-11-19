import { Flex, OverflowWrapper } from '@/common/components/custom';
import { ICONS, SIZES } from '@/common/constants';
import { createContext, useContext, useState } from 'react';
import { BreadcrumbDivider, BreadcrumbSection, Popup, Breadcrumb as SBreadcrumb, Label as SLabel } from 'semantic-ui-react';
import styled from "styled-components";

const Label = styled(SLabel)`
  position: relative;
  top: 5px;
  max-height: fit-content;
  margin-left: 10px!important;
`;

const Span = styled.span`
  height: 35px!important;
  align-items: center;
  display: inline-flex;
`;

const SSBreadcrumb = styled(SBreadcrumb)`
  height: 35px!important;
  align-content: center;
  position: relative;
  top: 2px;
  flex-flow: nowrap;
  display: flex!important;

  div {
    height:100%!important;
    align-content: center;
  }

  div.section {
    text-wrap-mode: nowrap!important;
  }

  i {
    position: relative;
    top: -10px;
  }
`;

const BreadcrumContext = createContext();

const BreadcrumProvider = ({ children }) => {
  const [labels, setLabels] = useState([]);
  return (
    <BreadcrumContext.Provider value={{ labels, setLabels }}>
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
      {labels.map((label, index) => {
        const isStringLabel = typeof label === 'string' && label.trim() !== '';
        const isObjectLabel = typeof label === 'object' && label?.title;

        if (!isStringLabel && !isObjectLabel) return null;

        const currentHasPopup = typeof label === 'object' && !!label.popup;

        return (
          <BreadcrumbSection key={`label_${index}`}>
            {index !== 0 && !currentHasPopup && (
              <BreadcrumbDivider icon={ICONS.CHEVRON_RIGHT} />
            )}

            {isStringLabel ? (
              <OverflowWrapper $verticalAlign="baseline" popupContent={label} maxWidth="25vw">
                {label}
              </OverflowWrapper>
            ) : (
              <OverflowWrapper $verticalAlign="bottom" maxWidth="25vw" popupContent={label.title}>
                <Flex>
                  <Span>{label.id && <span>{label.id}</span>}</Span>
                  {label.id ? (
                    <Label pointing="left" color={label.color}>
                      {label.title}
                    </Label>
                  ) : (
                    <Popup
                      content={label.popup || ''}
                      position="bottom center"
                      size="mini"
                      trigger={
                        <Label pointing="left" color={label.color}>
                          {label.title}
                        </Label>
                      }
                    />
                  )}
                </Flex>
              </OverflowWrapper>
            )}
          </BreadcrumbSection>
        );
      })}
    </SSBreadcrumb>
  );
};

export { BreadcrumProvider, Breadcrumb, useBreadcrumContext };

