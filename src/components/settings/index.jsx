import { IconedButton } from "@/common/components/buttons";
import { FlexColumn } from "@/common/components/custom";
import { BUTTON_TEXTS, COLORS, ICONS } from "@/common/constants";
import { Tab } from "semantic-ui-react";
import BrandsModule from "./Entities/Brands";
import BudgetsModule from "./Entities/Budgets";
import CustomersModule from "./Entities/Customers";
import ExpensesModule from "./Entities/Expenses";
import GeneralModule from "./Entities/General";
import ProductsModule from "./Entities/Products";
import SuppliersModule from "./Entities/Suppliers";

const SettingsTabs = ({
  onEntityChange,
  settings = [],
  onRefresh,
  isLoading,
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
    <FlexColumn>
      <IconedButton
        icon={ICONS.REFRESH}
        text={BUTTON_TEXTS.UPDATE}
        color={COLORS.BLUE}
        onClick={onRefresh}
        position="absolute"
        alignSelf="flex-end"
        disabled={isLoading}
        loading={isLoading}
        width="fit-content"
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
