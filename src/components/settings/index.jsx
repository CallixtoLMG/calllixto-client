import { IconedButton } from "@/common/components/buttons";
import { FlexColumn } from "@/common/components/custom";
import { COLORS, ICONS } from "@/common/constants";
import { useEffect, useState } from "react";
import { Tab } from "semantic-ui-react";
import BrandsModule from "./Entities/Brands";
import BudgetsModule from "./Entities/Budgets";
import CustomersModule from "./Entities/Customers";
import ExpensesModule from "./Entities/Expenses";
import GeneralModule from "./Entities/General";
import ProductsModule from "./Entities/Products";
import SuppliersModule from "./Entities/Suppliers";

const SettingsTabs = ({ onEntityChange, settings = [], onRefresh, isLoading, onBeforeView }) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pendingTabIndex, setPendingTabIndex] = useState(null);

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
    const canChange = await onBeforeView?.();

    if (canChange) {
      setActiveIndex(nextIndex);
      onEntityChange(settings[nextIndex]);
    } else {
      setPendingTabIndex(nextIndex);
    }
  };

  useEffect(() => {
    if (pendingTabIndex !== null) {
    }
  }, [pendingTabIndex]);

  return (
    <FlexColumn>
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
        activeIndex={activeIndex}
        onTabChange={handleTabChange}
      />
    </FlexColumn>
  );
};

export default SettingsTabs;
