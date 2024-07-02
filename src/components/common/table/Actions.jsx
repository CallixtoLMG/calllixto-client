import { Button, Popup } from "semantic-ui-react";

const Actions = ({ actions, element, index }) => {
  const handleClick = (event, action) => {
    event.stopPropagation();
    action.onClick(element, index);
  };

  return (
    <>
      {actions.map((action, index) => (
        <Popup
          size="mini"
          content={action.tooltip}
          key={`action_${action.id}`}
          position="top right"
          trigger={<Button
            type="button"
            icon={action.icon}
            onClick={(event) => handleClick(event, action, index)}
            color={action.color}
            className="circular"
            size="mini"
          />}
        />
      ))}
    </>
  )
};

export default Actions;
