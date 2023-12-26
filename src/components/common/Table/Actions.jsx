import { Button, Popup } from "semantic-ui-react";

const Actions = ({ actions, element }) => {
  const handleClick = (event, action) => {
    event.stopPropagation();
    action.onClick(element);
  }
  return (
    <>
      {actions.map((action) => (
        <Popup
          size="mini"
          content={action.tooltip}
          key={`action_${action.id}`}
          position="top center"
          trigger={<Button
            icon={action.icon}
            onClick={(event) => handleClick(event, action)}
            color={action.color}
            className="circular"
            size="tiny"
          />}
        />
      ))}
    </>
  )
}

export default Actions;