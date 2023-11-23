import { ModTitleLabel, TitleContainer } from "./styles";

const PageHeader = ({title}) => (
  <TitleContainer>
    <ModTitleLabel>{title}</ModTitleLabel>
  </TitleContainer>
)

export default PageHeader;