import { IconedButton } from "@/common/components/buttons";
import { FlexColumn } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { Tab } from "semantic-ui-react";
import BrandsModule from "./Entities/Brands";
import BudgetsModule from "./Entities/Budgets";
import CustomersModule from "./Entities/Customers";
import ExpensesModule from "./Entities/Expenses";
import ProductsModule from "./Entities/Products";
import SuppliersModule from "./Entities/Suppliers";

const SettingsTabs = ({ onEntityChange, settings = [], onRefresh, isLoading }) => {
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
    <>
      <FlexColumn >
        <IconedButton
          icon={ICONS.REFRESH}
          text="Actualizar"
          color={COLORS.BLUE}
          onClick={onRefresh}
          position="absolute"
          alignSelf="end"
          disabled={isLoading}
          loading={isLoading}
        />
        <Tab
          panes={panes}
          onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex])}
        />
      </FlexColumn>
    </>
  );
};

export default SettingsTabs;
