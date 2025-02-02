export const PHONE_TABLE_HEADERS = [
  { id: 1, title: 'Referencia', align: "left", value: (phone) => phone.ref },
  { id: 2, title: 'Área', align: "left", value: (phone) => phone.areaCode },
  { id: 3, title: 'Número', align: "left", value: (phone) => phone.number }
];

export const ADDRESS_TABLE_HEADERS = [
  { id: 1, title: 'Referencia', align: "left", value: (address) => address.ref },
  { id: 2, title: 'Dirección', align: "left", value: (address) => address.address }
];

export const EMAIL_TABLE_HEADERS = [
  { id: 1, title: 'Referencia', align: "left", value: (email) => email.ref },
  { id: 2, title: 'Email', align: "left", value: (email) => email.email }
];

