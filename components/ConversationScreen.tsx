import AttachFileIcon from "@mui/icons-material/AttachFile";
import InsertEmoticonIcon from "@mui/icons-material/InsertEmoticon";
import MicIcon from "@mui/icons-material/Mic";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SendIcon from "@mui/icons-material/Send";
import { IconButton } from "@mui/material";
import {
  addDoc,
  collection,
  doc,
  serverTimestamp,
  setDoc
} from "firebase/firestore";
import { useRouter } from "next/router";
import {
  KeyboardEventHandler,
  MouseEventHandler,
  useRef,
  useState
} from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useCollection } from "react-firebase-hooks/firestore";
import styled, { keyframes } from "styled-components";
import { auth, db } from "../config/firebase";
import { useRecipient } from "../hooks/useRecipient";
import { Conversation, IMessage } from "../types";
import {
  convertFirestoreTimestampToString,
  generateQueryGetMessages,
  transformMessage
} from "../utils/getMessagesInConversation";
import Message from "./Message";
import RecipientAvatar from "./RecipientAvatar";

const StyledRecipientHeader = styled.div`
  position: sticky;
  background-color: white;
  z-index: 100;
  top: 0;
  display: flex;
  align-items: center;
  padding: 11px;
  height: 80px;
  border-bottom: 1px solid whitesmoke;
`;

const StyledH3 = styled.h3`
  word-break: break-all;
`;

const StyledHeaderInfo = styled.div`
  flex-grow: 1;

  > h3 {
    margin-top: 0;
    margin-bottom: 3px;
  }

  > span {
    font-size: 14px;
    color: gray;
  }
`;

const StyledHeaderIcons = styled.div`
  display: flex;
`;

const StyledMessageContainer = styled.div`
  padding: 30px;
  background-color: #e5ded8;
  min-height: 90vh;
`;

const StyledInputContainer = styled.form`
  display: flex;
  align-items: center;
  padding: 10px;
  position: sticky;
  bottom: 0px;
  background-color: white;
  z-index: 100;
`;

const StyledInput = styled.input`
  flex-grow: 1;
  outline: none;
  border: none;
  border-radius: 10px;
  background-color: whitesmoke;
  padding: 15px;
  margin-left: 15px;
  margin-right: 15px;
`;

const EndOfMessagesForAutoScroll = styled.div`
  margin-bottom: 30px;
`

const ConversationScreen = ({
  conversation,
  messages,
}: {
  conversation: Conversation;
  messages: IMessage[];
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [loggedInUser, _loading, _error] = useAuthState(auth);

  const conversationUsers = conversation.users;
  const { recipientEmail, recipient } = useRecipient(conversationUsers);
  console.log(recipient?.lastSeen);

  //START: Fetch messages in real time with the help of useCollection hooks(just as we use to add new convversation)
  const router = useRouter();
  const conversationId = router.query.id; // localhost:3000/conversations/:id

  const queryGetMessages = generateQueryGetMessages(conversationId as string);

  const [messagesSnapshot, messagesLoading, __error] =
    useCollection(queryGetMessages);
  //END: Fetch messages in real time with the help of useCollection hooks(just as we use to add new convversation)

  const showMessages = () => {
    //If front end is loading messages bts, display messages retrieved from Next SSR(passed down from [id].tsx)
    if (messagesLoading) {
      return messages.map((message, index) => (
        <Message key={message.id} message={message} />
      ));
    }

    //If front end is done loading messages, so now we have messagesSnapshot
    if (messagesSnapshot) {
      return messagesSnapshot.docs.map((message, index) => (
        <Message key={message.id} message={transformMessage(message)} />
      ));
    }

    return null;
  };

  const addMessageToDbAndUpdateLastSeen = async () => {
    // update last seen in 'users' collection
    await setDoc(
      doc(db, "users", loggedInUser?.email as string),
      {
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );

    // add new message to 'messages' collection
    await addDoc(collection(db, "messages"), {
      conversation_id: conversationId,
      sent_at: serverTimestamp(),
      text: newMessage,
      user: loggedInUser?.email,
    });

    // reset input field
    setNewMessage("");

    // scroll to bottom
    scrollToBottom()
  };

  const sendMessageOnEnter: KeyboardEventHandler<HTMLInputElement> = (
    event
  ) => {
    if (event.key == "Enter") {
      event.preventDefault();
      if (!newMessage) return;
      addMessageToDbAndUpdateLastSeen();
    }
  };

  const sendMessageOnClick: MouseEventHandler<HTMLButtonElement> = (event) => {
    event.preventDefault();
    if (!newMessage) return;
    addMessageToDbAndUpdateLastSeen();
  };

  const endOfMessagesRef  = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <>
      <StyledRecipientHeader>
        <RecipientAvatar
          recipient={recipient}
          recipientEmail={recipientEmail}
        />

        <StyledHeaderInfo>
          <StyledH3>{recipientEmail}</StyledH3>
          {recipient && (
            <span>
              Last active:{" "}
              {convertFirestoreTimestampToString(recipient.lastSeen)}
            </span>
          )}
        </StyledHeaderInfo>
        <StyledHeaderIcons>
          <IconButton>
            <AttachFileIcon />
          </IconButton>
          <IconButton>
            <MoreVertIcon />
          </IconButton>
        </StyledHeaderIcons>
      </StyledRecipientHeader>

      <StyledMessageContainer>
        {showMessages()}
        {/* for auto scroll to the end when a new message is sent */}
        <EndOfMessagesForAutoScroll ref={endOfMessagesRef} />
      </StyledMessageContainer>

      {/* Enter new message */}
      <StyledInputContainer>
        <InsertEmoticonIcon />
        <StyledInput
          value={newMessage}
          onChange={(event) => setNewMessage(event.target.value)}
          onKeyDown={sendMessageOnEnter}
        />
        <IconButton onClick={sendMessageOnClick} disabled={!newMessage}>
          <SendIcon />
        </IconButton>
        <IconButton>
          <MicIcon />
        </IconButton>
      </StyledInputContainer>
    </>
  );
};

export default ConversationScreen;
