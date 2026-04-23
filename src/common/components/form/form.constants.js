import { OverflowWrapper } from "../custom";

export const PHONE_TABLE_HEADERS = [
  {
    id: 1,
    title: 'Referencia',
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
    title: 'Área',
    align: "left",
    value: (phone) => phone.areaCode
  },
  {
    id: 3,
    title: 'Número',
    align: "left",
    value: (phone) => phone.number
  }
];

export const ADDRESS_TABLE_HEADERS = [
  {
    id: 1,
    title: 'Referencia',
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
    title: 'Dirección',
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
    title: 'Referencia',
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
    title: 'Email',
    align: "left",
    value: (email) => (
      <OverflowWrapper maxWidth="12vw" popupContent={email.email}>
        {email.email}
      </OverflowWrapper>
    )
  }
];

