import { Tab } from "semantic-ui-react";
import BrandsModule from "./Entities/Brands";
import BudgetsModule from "./Entities/Budgets";
import CustomersModule from "./Entities/Customers";
import ExpensesModule from "./Entities/Expenses";
import ProductsModule from "./Entities/Products";
import SuppliersModule from "./Entities/Suppliers";

const SettingsTabs = ({ onEntityChange, settings = [] }) => {
  const panes = settings.map((entity) => ({
    menuItem: entity.label,
    render: () => {

      return (
        <Tab.Pane>
          {entity.entity === 'CUSTOMER' && <CustomersModule />}
          {entity.entity === 'SUPPLIER' && <SuppliersModule />}
          {entity.entity === 'BRAND' && <BrandsModule />}
          {entity.entity === 'PRODUCT' && <ProductsModule />}
          {entity.entity === 'BUDGET' && <BudgetsModule />}
          {entity.entity === 'EXPENSE' && <ExpensesModule />}
        </Tab.Pane>
      )
    },
  }));

  return (
    <Tab panes={panes} onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex])} />
  );
};

export default SettingsTabs;
