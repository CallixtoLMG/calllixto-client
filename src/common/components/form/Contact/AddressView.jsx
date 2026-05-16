import { ADDRESS_TABLE_HEADERS } from "../form.constants";
import { ContactSectionView } from "./ContactSectionView";

export const AddressView = ({ addresses = [] }) => (
  <ContactSectionView
    wrap
    headers={ADDRESS_TABLE_HEADERS}
    elements={addresses}
    mainKey={(address, index) => `${address.ref}-${address.address}-${index}`}
  />
);
