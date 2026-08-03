const getRequiredEnv = (name: string) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required E2E configuration: ${name}`);
  }

  return value;
};

export const getE2ECredentials = () => ({
  email: getRequiredEnv("E2E_USER_EMAIL"),
  password: getRequiredEnv("E2E_USER_PASSWORD"),
});

export const E2E_ACCOUNTS = {
  modulesEnabled: getRequiredEnv("E2E_ACCOUNT_MODULES_ENABLED"),
  modulesDisabled: getRequiredEnv("E2E_ACCOUNT_MODULES_DISABLED"),
};

export const getE2EApiBaseUrl = () => getRequiredEnv("NEXT_PUBLIC_URL");
