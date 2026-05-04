export const MAINTENANCE_MODE = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

export const MAINTENANCE_PAGE = {
  BASE: "/mantenimiento",
  NAME: "Mantenimiento",
};

export const MAINTENANCE_PUBLIC_PATHS = [
  MAINTENANCE_PAGE.BASE,
  "/login",
  "/recuperar-contrasena",
  "/cambiar-contrasena",
  "/validate",
  "/ups",
];
