import { SHORTKEYS } from "@/constants";
import { useKeyboardShortcuts } from "@/hooks/keyboardShortcuts";
import { useRouter } from 'next/navigation';
import { IconnedButton } from ".";

const GoBack = () => {
  const { back } = useRouter();
  const handleClick = () => {
    back();
  };

  useKeyboardShortcuts(handleClick, SHORTKEYS.BACKSPACE)

  return (
    <IconnedButton
      text="Atrás"
      icon="arrow left"
      color="grey"
      onClick={handleClick}
    />
  );
};

export default GoBack;
