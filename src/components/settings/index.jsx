import { SUPPORTED_SETTINGS } from "@/app/configuracion/page";
import { Tab } from "semantic-ui-react";
import TagsModule from "./TagsModule";

const SettingsTabs = ({ onEntityChange, settings = [] }) => {
  const panes = settings.map((entity) => ({
    menuItem: entity.label,
    render: () => {
      const entitySettings = SUPPORTED_SETTINGS[entity.entity];
      return (
        <Tab.Pane>
          {/* {entity.entity === 'PRODUCT' && <ProductsModule />} */}
          {entitySettings.map((setting) => {
            if (setting === 'tags') {
              return <TagsModule key={setting} />;
            }
          })}
        </Tab.Pane>
      )
    },
  }));

  return (
    <Tab panes={panes} onTabChange={(_, { activeIndex }) => onEntityChange(settings[activeIndex])} />
  );
};

export default SettingsTabs;
