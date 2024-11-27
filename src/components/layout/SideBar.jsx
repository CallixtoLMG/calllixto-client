import { COLORS, PAGES } from "@/constants";
import { useRouter } from "next/navigation";
import { Icon, Menu, Sidebar } from "semantic-ui-react";

const SideBar = ({ isVisible, onClose }) => {
  const { push } = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("userData");
    push(PAGES.LOGIN.BASE);
    onClose();
  };

  return (
    <Sidebar
      as={Menu}
      animation="overlay"
      direction="right"
      visible={isVisible}
      vertical
      inverted
      onHide={onClose}
      style={{ width: "250px" }}
    >
      <Menu.Item
        onClick={handleLogout}
      >
        <Icon color={COLORS.RED} name="sign-out" /> Cerrar sesión
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          push("/change-password");
          onClose();
        }}
      >
        <Icon color={COLORS.YELLOW} name="lock" /> Cambiar contraseña
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          push(PAGES.CONFIG.BASE);
          onClose();
        }}
      >
        <Icon color={COLORS.ORANGE} name="settings" /> Configuración
      </Menu.Item>
      <Menu.Item
        onClick={onClose}
      >
        <Icon color={COLORS.GREY} name="close" /> Cerrar Menu
      </Menu.Item>
    </Sidebar>
  );
};

export default SideBar;
