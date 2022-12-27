import CircularProgress from "@mui/material/CircularProgress";
import Image from "next/image";
import styled from "styled-components";
import WhatsAppLogo from "../assets/whatsapplogo.png";

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

const Loading = () => {
  return (
    <StyledContainer>
      <StyledImageWrapper>
        <div style={{ width: "200px", height: "200px", position: "relative" }}>
          <Image alt="WhatsAppLogo" src={WhatsAppLogo} fill />
        </div>
      </StyledImageWrapper>

      <CircularProgress />
    </StyledContainer>
  );
};

export default Loading;
