import { PHONE_TABLE_HEADERS } from "../form.constants";
import { ContactSectionView } from "./ContactSectionView";

export const PhoneView = ({ phoneNumbers = [] }) => (
  <ContactSectionView
    headers={PHONE_TABLE_HEADERS}
    elements={phoneNumbers}
    mainKey={(phone, index) => `${phone.ref}-${phone.areaCode}-${phone.number}-${index}`}
  />
);
