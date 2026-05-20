const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing ${name}. Add it to .env.e2e or export it before running Playwright.`);
  }

  return value;
};

export const getE2ECredentials = () => ({
  email: getRequiredEnv("E2E_USER_EMAIL"),
  password: getRequiredEnv("E2E_USER_PASSWORD"),
});
