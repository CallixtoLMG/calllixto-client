import { createContext, useContext, useState } from 'react';
import { BreadcrumbDivider, BreadcrumbSection, Breadcrumb as SBreadcrumb, Label as SLabel } from 'semantic-ui-react';
import styled from "styled-components";

const Label = styled(SLabel)`
  position: relative;
  top: -2px;
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
    <SBreadcrumb size='huge'>
      {labels.map((label, index) => (
        <BreadcrumbSection key={`label_${index}`}>
          {index !== 0 && label && <BreadcrumbDivider icon="chevron right" />}
          {typeof label === 'string' ? (
            label
          ) : (
            label?.id && label?.title && (
              <span>
                {label.id}{' '}
                <Label pointing="left" color={label.color}>
                  {label.title}
                </Label>
              </span>
            )
          )}
        </BreadcrumbSection>
      ))}
    </SBreadcrumb>
  );
};

export { BreadcrumProvider, Breadcrumb, useBreadcrumContext };

