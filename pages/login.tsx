import Button from "@mui/material/Button";
import Head from "next/head";
import Image from "next/image";
import React from "react";
import { useSignInWithGoogle } from 'react-firebase-hooks/auth';
import styled from "styled-components";
import WhatsAppLogo from "../assets/whatsapplogo.png";
import { auth } from '../config/firebase';

const StyledContainer = styled.div`
  height: 100vh;
  display: grid;
  place-items: center;
  background-color: whitesmoke;
`;

const StyledLoginContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
`;
const StyledImageWrapper = styled.div`
  margin-bottom: 50px;
`;

const StyledImg = styled.img`
  width: 200px;
  height: 200px;
`;

const Login = () => {
    const [signInWithGoogle, _user, _loading, _error] = useSignInWithGoogle(auth)

	const signIn = () => {
		signInWithGoogle()
	}
  return (
    <StyledContainer>
      <Head>
        <title>Log In</title>
      </Head>
      <StyledLoginContainer>
        <StyledImageWrapper>
          <div style={{ width: "200px", height: "200px", position: "relative" }}>
            <Image
              alt="WhatsAppLogo"
              src={WhatsAppLogo}
              fill
            />
          </div>
        </StyledImageWrapper>

        <Button variant="outlined" onClick={signIn}>
          Sign In with Google
        </Button>
      </StyledLoginContainer>
    </StyledContainer>
  );
};

export default Login;
