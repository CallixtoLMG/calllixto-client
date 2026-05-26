import RecoverPasswordForm from "@/components/recoverPassword";

const RecoverPassword = ({ searchParams }) => {
  return (<RecoverPasswordForm isFirstLogin={searchParams?.primerIngreso === "true"} />)
};

export default RecoverPassword;
