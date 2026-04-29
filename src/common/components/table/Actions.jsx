import { Button, Popup } from "semantic-ui-react";

const resolveActionProp = (prop, element, index) => {
  return typeof prop === "function" ? prop(element, index) : prop;
};

const Actions = ({ actions, element, index }) => {
  const handleClick = (event, action) => {
    event.stopPropagation();
    action.onClick(element, index);
  };

  return (
    <>
      {actions.map((action) => {
        const resolvedIcon = resolveActionProp(action.icon, element, index);
        const resolvedColor = resolveActionProp(action.color, element, index);
        const resolvedTooltip = resolveActionProp(action.tooltip, element, index);
        const resolvedDisabled = resolveActionProp(action.disabled, element, index);
        const resolvedLoading = resolveActionProp(action.loading, element, index);
        const resolvedBasic = resolveActionProp(action.basic, element, index);

        return (
          <Popup
            size="mini"
            content={resolvedTooltip}
            key={`action_${action.id}`}
            position="top right"
            trigger={
              <Button
                type="button"
                icon={resolvedIcon}
                onClick={(event) => handleClick(event, action)}
                color={resolvedColor}
                disabled={resolvedDisabled}
                loading={resolvedLoading}
                basic={resolvedBasic}
                className="circular"
                size="mini"
              />
            }
          />
        );
      })}
    </>
  );
};

export default Actions;