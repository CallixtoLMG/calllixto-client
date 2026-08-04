const MADERERA_LAS_TAPIAS_BUDGET_LOGO = {
  src: "/accounts/maderera-las-tapias.png",
  alt: "Maderera Las Tapias",
  width: 160,
  height: 50,
  showCustomPDFDisclaimer: true,
};

const CALLIXTO_BUDGET_LOGO = {
  src: "/callixto.png",
  alt: "Callixto",
  width: 100,
  height: 40,
};

const ACCOUNT_BUDGET_BRANDING = {
  "maderera-las-tapias": MADERERA_LAS_TAPIAS_BUDGET_LOGO,
  callixto: CALLIXTO_BUDGET_LOGO,
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
  CALLIXTO_BUDGET_LOGO,
  MADERERA_LAS_TAPIAS_BUDGET_LOGO,
  resolveAccountBudgetLogo,
};
