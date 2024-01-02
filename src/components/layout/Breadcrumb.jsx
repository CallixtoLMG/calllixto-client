import { createContext, useContext, useState } from 'react';
import { Breadcrumb as SBreadcrumb, BreadcrumbDivider, BreadcrumbSection } from 'semantic-ui-react';

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
          {label}
        </BreadcrumbSection>
      ))}
    </SBreadcrumb>
  );
};

export { BreadcrumProvider, useBreadcrumContext, Breadcrumb };
