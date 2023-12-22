import { PAGES } from "@/constants";
import Link from "next/link";
import { Button, Popup } from "semantic-ui-react";
import { ModIcon } from "./styles";

const ButtonEdit = ({ page, element }) => {
  return (
    <Link href={PAGES[page].UPDATE(element)}>
      <Popup size="mini" content="Editar" trigger={<Button color='blue' content={<ModIcon name="edit" />} size="tiny" />} />
    </Link>
  )
};

export default ButtonEdit;