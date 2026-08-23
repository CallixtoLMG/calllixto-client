import { Tab } from "semantic-ui-react";
import BrandsModule from "./Entities/Brands";
import BudgetsModule from "./Entities/Budgets";
import CustomersModule from "./Entities/Customers";
import ExpensesModule from "./Entities/Expenses";
import GeneralModule from "./Entities/General";
import ProductsModule from "./Entities/Products";
import SuppliersModule from "./Entities/Suppliers";
import { SettingsTabsContainer } from "./styles";

const SettingsTabs = ({
  onEntityChange,
  settings = [],
  onBeforeView,
  activeIndex,
  onActiveIndexChange,
}) => {
  const panes = settings.map((entity) => ({
    menuItem: entity.label,
    render: () => (
      <Tab.Pane>
        {entity.entity === 'GENERAL' && <GeneralModule />}
        {entity.entity === 'CUSTOMER' && <CustomersModule />}
        {entity.entity === 'SUPPLIER' && <SuppliersModule />}
        {entity.entity === 'BRAND' && <BrandsModule />}
        {entity.entity === 'PRODUCT' && <ProductsModule />}
        {entity.entity === 'BUDGET' && <BudgetsModule />}
        {entity.entity === 'EXPENSE' && <ExpensesModule />}
      </Tab.Pane>
    ),
  }));

  const handleTabChange = async (_, { activeIndex: nextIndex }) => {
    const changeTab = () => {
      onActiveIndexChange?.(nextIndex);
      onEntityChange(settings[nextIndex]);
    };

    const canChange = await onBeforeView?.(changeTab);

    if (canChange) {
      changeTab();
    }
  };

  return (
    <SettingsTabsContainer>
      <Tab
        panes={panes}
        activeIndex={activeIndex}
        onTabChange={handleTabChange}
      />
    </SettingsTabsContainer>
  );
};

export default SettingsTabs;
