import OverflowWrapper from '@/common/components/custom/OverflowWrapper';
import { ICONS } from '@/common/constants';
import { createContext, useContext, useState } from 'react';
import { BreadcrumbDivider, BreadcrumbSection, Breadcrumb as SBreadcrumb, Label as SLabel } from 'semantic-ui-react';
import styled from "styled-components";

const Label = styled(SLabel)`
  position: relative;
  top: -3px;
  max-height: fit-content;
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
    <SSBreadcrumb size='huge'>
      {labels.map((label, index) => (
        <BreadcrumbSection key={`label_${index}`}>
          {index !== 0 && label && <BreadcrumbDivider icon={ICONS.CHEVRON_RIGHT} />}
          {typeof label === 'string' ? (
            <OverflowWrapper popupContent={label} maxWidth="25vw">
              {label}
            </OverflowWrapper>
          ) : (
            label?.id && label?.title && (
              <OverflowWrapper maxWidth="25vw" popupContent={label.title}>
                <Span>
                  {label.id}
                </Span>
                <Label pointing="left" color={label.color}>
                  {label.title}
                </Label>
              </OverflowWrapper>

            )
          )}
        </BreadcrumbSection>
      ))}
    </SSBreadcrumb>
  );
};

export { BreadcrumProvider, Breadcrumb, useBreadcrumContext };

