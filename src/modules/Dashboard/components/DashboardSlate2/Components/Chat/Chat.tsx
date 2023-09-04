import moment from "moment";
import React, { useContext, useEffect, useRef, useState } from "react";
import "./Chat.scss";
import { MicOff as MicOffIcon, Mic as MicIcon } from "@mui/icons-material";
import { createSpeechlySpeechRecognition } from "@speechly/speech-recognition-polyfill";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import hark from "hark";
import Recorder from "recorder-js";
import { v4 as uuidv4 } from "uuid";
import { IconButton } from "@mui/material";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getProjectExchangeToken,
} from "src/services/authservice";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import {
  setChatText,
  setZIndexPriority,
} from "src/modules/root/context/authentication/action";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { FeedDetailCard } from "../../../Feeds/FeedDetailCard";

let sessionId: any;
const recordSampleRate = 44100;
let stop: any = false;
const appId = "d405b2a8-7be6-43e8-9c45-4efc06413582";
const SpeechlySpeechRecognition = createSpeechlySpeechRecognition(appId);
SpeechRecognition.applyPolyfill(SpeechlySpeechRecognition);

interface ChatProps {
  selectedState: string;
  open: boolean;
  handleClose: any;
}

const CHAT_URL = process.env["REACT_APP_CHAT_URL"];

const Chat = ({
  selectedState,
  open,
  handleClose,
}: ChatProps): React.ReactElement => {
  const { state, dispatch }: any = useContext(stateContext);
  const messagesEndRef: any = useRef(null);
  const textAreaRef: any = useRef(null);
  const { transcript, listening, resetTranscript } = useSpeechRecognition();
  const [chatData, setChatData]: any = useState([]);
  const [imageData, setImageData]: any = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isSessionEnded, setSessionEnded] = useState("True");
  const [stream, setStream]: any = useState(null);
  const [recording, setRecording] = useState(false);
  const [recorderAudio, setRecorder]: any = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    dispatch(setChatText(transcript));
  }, [transcript]);

  useEffect(() => {
    initialize();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatData, imageData]);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, [focus]);

  useEffect(() => {
    if (recorderAudio !== null) {
      const options = {};
      const speechEvents = hark(stream, options);

      speechEvents.on("speaking", () => {
        console.log("speaking");
      });

      speechEvents.on("stopped_speaking", async () => {
        console.log("stopped_speaking");
        stopRecord();
        speechEvents.stop();
        SpeechRecognition.stopListening();
      });
    } else {
      //   hark.stop();
    }
  }, [recorderAudio]);

  const initialize = async () => {
    let stream: any;
    try {
      // We will implement this later.
      stream = await getAudioStream();
      setStream(stream);
    } catch (error) {
      // Users browser doesn't support audio.
      // Add your handler here.
      console.log(error);
    }
  };

  const getAudioStream = () => {
    const params = { audio: true, video: false };
    return navigator.mediaDevices.getUserMedia({ audio: true });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleTextChange = (e: any) => {
    SpeechRecognition.stopListening();
    dispatch(setChatText(e.target.value));
  };

  const checkIfMicrophoneIsEnabled = () => {
    navigator.permissions
      .query({ name: "microphone" })
      .then((permissionStatus) => {
        if (permissionStatus.state === "granted") startRecord();
        else
          Notification.sendNotification(
            "Please enable microphone on your browser",
            AlertTypes.warn
          );
      });
  };

  const startRecord = () => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const recorder = new Recorder(audioContext, {});

    recorder.init(stream);
    setRecorder(recorder);
    setRecording(true);
    recorder.start().then(() => setRecording(true));
  };

  const mergeBuffers = (bufferArray: any, recLength: any) => {
    const result = new Float32Array(recLength);
    let offset = 0;
    for (let i = 0; i < bufferArray.length; i++) {
      result.set(bufferArray[i], offset);
      offset += bufferArray[i].length;
    }
    return result;
  };

  const downsampleBuffer = (buffer: any, exportSampleRate: any) => {
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const sampleRateRatio = recordSampleRate / exportSampleRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Float32Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
      const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
      let accum = 0;
      let count = 0;
      for (
        let i = offsetBuffer;
        i < nextOffsetBuffer && i < buffer.length;
        i++
      ) {
        accum += buffer[i];
        count++;
      }
      result[offsetResult] = accum / count;
      offsetResult++;
      offsetBuffer = nextOffsetBuffer;
    }
    return result;
  };

  const stopRecording = () => {
    setSessionEnded("True");
    stop = true;
    setRecording(false);
  };

  const stopRecord = async () => {
    const { buffer } = await recorderAudio.stop();
    setRecording(false);
    const recBuffer = [];
    let recLength = 0;
    recBuffer.push(buffer[0]);
    recLength += buffer[0].length;
    const mergedBuffers = mergeBuffers(recBuffer, recLength);

    const downsampledBuffer = downsampleBuffer(mergedBuffers, 16000);
    const encodedWav = encodeWAV(downsampledBuffer);
    handleSend(encodedWav);
  };

  const writeString = (view: any, offset: any, string: any) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };

  const floatTo16BitPCM = (output: any, offset: any, input: any) => {
    for (let i = 0; i < input.length; i++, offset += 2) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
  };

  const encodeWAV = (samples: any) => {
    const buffer = new ArrayBuffer(44 + samples.length * 2);
    const view: any = new DataView(buffer);

    writeString(view, 0, "RIFF");
    view.setUint32(4, 32 + samples.length * 2, true);
    writeString(view, 8, "WAVE");
    writeString(view, 12, "fmt ");
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, recordSampleRate, true);
    view.setUint32(28, recordSampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(view, 36, "data");
    view.setUint32(40, samples.length * 2, true);
    floatTo16BitPCM(view, 44, samples);

    return view;
  };

  const handleSend = async (payload: any) => {
    if (state.chatText?.trim() === "" && payload === "") return;
    resetTranscript();
    setIsLoading(true);
    const qry = state.chatText;
    dispatch(setChatText(""));
    let data: any;
    if (selectedState === "chat" && payload === "") {
      data = [
        ...chatData,
        {
          name: decodeExchangeToken().userName,
          message: qry,
          time: `${moment().format("h:mmA")}, Today`,
          type: "me",
        },
      ];
      setChatData(data);
    } else {
    }
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const token = getProjectExchangeToken();

    if (payload !== "") {
      if (isSessionEnded === "True") {
        sessionId = uuidv4();
      }
      fetch(`${CHAT_URL}v1/converse/speech`, {
        method: "POST",
        body: payload,
        headers: {
          "Content-Type": "application/wave",
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
          "x-user-timezone": timezone,
          "x-portfolio-id": state?.currentPortfolio?.portfolioId,
        },
      })
        .then((response) => {
          const sessionEnded: any = response?.headers.get(
            "x-has-session-ended"
          );
          if (response?.headers.get("x-input-transcript")) {
            const from = {
              msg: response?.headers.get("x-input-transcript"),
            };
            const to = {
              msg: response?.headers.get("x-response-transcript"),
            };

            // const link: any = response?.headers.get("x-link-refs") || [];
            // const details: any = response?.headers.get("x-link-refs")?.length
            //   ? JSON.parse(link)
            //   : [];

            data = [
              ...chatData,
              {
                name: decodeExchangeToken().userName,
                message: from?.msg,
                time: `${moment().format("h:mmA")}, Today`,
                type: "me",
              },
              {
                name: "Slate",
                message: {
                  details: [],
                  longMsg: response?.headers.get("x-response-transcript"),
                },
                time: `${moment().format("h:mmA")}, Today`,
                type: "you",
              },
            ];
            setChatData(data);
          }
          setSessionEnded(sessionEnded);
          return response.body;
        })
        .then((body) => {
          const reader = body?.getReader();

          return new ReadableStream({
            start(controller) {
              return pump();

              function pump() {
                return reader?.read().then(({ done, value }): any => {
                  // When no more data needs to be consumed, close the stream
                  if (done) {
                    controller.close();
                    return;
                  }

                  // Enqueue the next data chunk into our target stream
                  controller.enqueue(value);
                  return pump();
                });
              }
            },
          });
        })
        .then((stream) => {
          setIsPlaying(true);
          return new Response(stream);
        })
        .then((response) => response.blob())
        .then((blob) => URL.createObjectURL(blob))
        .then((url) => {
          setRecorder(null);
          const audio = document.createElement("audio");
          audio.src = url;
          audio.addEventListener("ended", function () {
            setIsPlaying(false);
          });
          audio.play();
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    } else {
      if (isSessionEnded === "True") {
        sessionId = uuidv4();
      }
      const payloadData: any = {
        text: qry,
      };

      fetch(`${CHAT_URL}v1/converse/text`, {
        method: "POST",
        body: JSON.stringify(payloadData),
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-session-id": sessionId,
          "x-user-timezone": timezone,
          "x-portfolio-id": state?.currentPortfolio?.portfolioId,
        },
      })
        .then((response) => {
          const sessionEnded: any = response?.headers.get(
            "x-has-session-ended"
          );

          // const link: any = response?.headers.get("x-link-refs") || [];
          // const details: any = response?.headers.get("x-link-refs")?.length
          //   ? JSON.parse(link)
          //   : [];
          setSessionEnded(sessionEnded);
          if (qry?.toLowerCase()?.includes("what if we moved")) {
            const taskName =
              qry.split(" ")[qry.split(" ").indexOf("moved") + 1];
            return {
              details: [],
              longMsg: `${
                taskName ? taskName : ""
              } task has a float of 7 days and would not affect the critical path.`,
            };
          }
          return {
            details: [],
            longMsg: response?.headers.get("x-response-transcript"),
          };
        })
        .then((text) => {
          data = [
            ...data,
            {
              name: "Slate",
              message: text,
              time: `${moment().format("h:mmA")}, Today`,
              type: "you",
            },
          ];
          setChatData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error:", error);
        });
    }
  };

  return open ? (
    <div
      className="chat-container"
      style={{ zIndex: state?.zIndexPriority === "chatPanel" ? 3 : 0 }}
      onClick={() => dispatch(setZIndexPriority("chatPanel"))}
    >
      <div className="chat-container__header">
        <div className="chat-container__header__text">Slate Converse</div>
        <IconButton
          onClick={() => {
            handleClose();
          }}
        >
          <KeyboardArrowRightIcon className="chat-container__header__icon" />
        </IconButton>
      </div>
      <div className="chat-container__content">
        <ul
          className="chat-container__content__chat"
          style={{
            backgroundColor: chatData?.length
              ? "rgba(255, 255, 255, 0.7)"
              : "rgba(255, 255, 255, 0.4)",
          }}
        >
          {(selectedState === "chat" ? chatData : imageData).map(
            (item: any, i: number) => (
              <li className={item.type} key={i}>
                <div>
                  {item.type === "you" ? (
                    <>
                      <span className="text name">{item.name}</span>
                      <span className="text time">{item.time}</span>
                    </>
                  ) : (
                    <>
                      <span className="text time">{item.time}</span>
                      <span className="text name">{item.name}</span>
                    </>
                  )}
                </div>
                <div className="triangle"></div>
                {selectedState === "chat" ? (
                  <div className="message">
                    {item?.type === "you" ? (
                      <FeedDetailCard insightDetail={item.message} />
                    ) : (
                      item.message
                    )}
                  </div>
                ) : (
                  <div
                    className={
                      item.type === "you" ? "message img-message" : "message"
                    }
                  >
                    {" "}
                    {item.type === "you" ? (
                      <img src={item.message} width="100%" />
                    ) : (
                      item.message
                    )}
                  </div>
                )}
              </li>
            )
          )}
          {isLoading && (
            <li className="you">
              <div>
                <span className="text name">Slate</span>
                <span className="text time">{`${moment().format(
                  "h:mmA"
                )}, Today`}</span>
              </div>
              <div className="triangle"></div>
              <div className="messageTyping">
                <span className="dot dot1"></span>
                <span className="dot dot2"></span>
                <span className="dot dot3"></span>
              </div>
            </li>
          )}

          <li ref={messagesEndRef}></li>
        </ul>
        <footer className="chat-container__footer">
          <textarea
            ref={textAreaRef}
            className="textarea"
            placeholder="Type your message"
            value={state?.chatText}
            onChange={(e: any) => {
              handleTextChange(e);
            }}
            onKeyDown={(e: any) => {
              if (e.keyCode === 13 && !e.shiftKey) {
                e.preventDefault();
                handleSend("");
              }
            }}
          ></textarea>
          {
            // listening
            recording ? (
              <MicOffIcon
                className="speechIcon"
                onClick={() => {
                  stopRecording();
                }}
              />
            ) : (
              <MicIcon
                className="speechIcon"
                onClick={() => {
                  setIsVoiceEnabled(true);
                  checkIfMicrophoneIsEnabled();
                }}
              />
            )
          }
          <a onClick={() => handleSend("")}>Send</a>
        </footer>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Chat;
