const ACCOUNT_BUDGET_BRANDING = {
  callixto: {
    src: "/accounts/callixto.png",
    alt: "Callixto",
    width: 160,
    height: 50,
  },
  "facundo-attili": {
    src: "/accounts/facundo-attili.png",
    alt: "Facundo Attili",
    width: 160,
    height: 50,
    showCustomPDFDisclaimer: true,
  },
  "maderera-las-tapias": {
    src: "/accounts/maderera-las-tapias.png",
    alt: "Maderera Las Tapias",
    width: 160,
    height: 50,
    showCustomPDFDisclaimer: true,
  },
};

const isValidLogoUrl = (logoUrl) =>
  typeof logoUrl === "string" &&
  logoUrl.trim().length > 0 &&
  (/^https?:\/\//.test(logoUrl) || logoUrl.startsWith("/"));

const resolveAccountBudgetLogo = ({
  accountId,
  logoUrl,
  alt = "Logo empresa",
  width = 150,
  height = 50,
} = {}) => {
  if (isValidLogoUrl(logoUrl)) {
    return {
      src: logoUrl,
      alt,
      width,
      height,
    };
  }

  return ACCOUNT_BUDGET_BRANDING[accountId] ?? null;
};

export {
  ACCOUNT_BUDGET_BRANDING,
  resolveAccountBudgetLogo
};

