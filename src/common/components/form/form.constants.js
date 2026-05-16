import { FIELD_LABELS } from "@/common/constants";
import { OverflowWrapper } from "../custom";

export const PHONE_TABLE_HEADERS = [
  {
    id: 1,
    title: FIELD_LABELS.REFERENCE,
    align: "left",
    value: (phone) =>
    (
      <OverflowWrapper maxWidth="15vw" popupContent={phone.ref}>
        {phone.ref}
      </OverflowWrapper>
    )
  },
  {
    id: 2,
    title: FIELD_LABELS.AREA,
    align: "left",
    value: (phone) => phone.areaCode
  },
  {
    id: 3,
    title: FIELD_LABELS.NUMBER,
    align: "left",
    value: (phone) => phone.number
  }
];

export const ADDRESS_TABLE_HEADERS = [
  {
    id: 1,
    title: FIELD_LABELS.REFERENCE,
    align: "left",
    value: (address) =>
    (
      <OverflowWrapper maxWidth="8vw" popupContent={address.ref}>
        {address.ref}
      </OverflowWrapper>
    )
  },
  {
    id: 2,
    title: FIELD_LABELS.ADDRESS,
    align: "left",
    value: (address) =>
    (
      <OverflowWrapper maxWidth="12vw" popupContent={address.address}>
        {address.address}
      </OverflowWrapper>
    )
  }
];

export const EMAIL_TABLE_HEADERS = [
  {
    id: 1,
    title: FIELD_LABELS.REFERENCE,
    align: "left",
    value: (email) =>
    (
      <OverflowWrapper maxWidth="12vw" popupContent={email.ref}>
        {email.ref}
      </OverflowWrapper>
    )
  },
  {
    id: 2,
    title: FIELD_LABELS.EMAIL,
    align: "left",
    value: (email) => (
      <OverflowWrapper maxWidth="12vw" popupContent={email.email}>
        {email.email}
      </OverflowWrapper>
    )
  }
];

