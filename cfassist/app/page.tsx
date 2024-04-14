"use client"
import Image from "next/image";
import Siriwave from 'react-siriwave';
import { useEffect, useState } from "react";
import CameraComponent from "./(components)/camera";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Chat from "./(components)/chat";
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChatContextProvider } from "./(components)/ChatContext";
import ImageUploader from "./(components)/imageuploader";
import Navbar from "./(components)/Navbar";
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie";

require('dotenv').config();

interface ConvoItem {
  index: number;
  you: string;
  cfassist: string;
}

interface usernameState {
  parent: string;
  attribute: string;
  value: string;
}

interface convoState {
  parent: string;
  attribute: string;
  id: number;
  value: ConvoItem[]; // Array of id values
}


export default function Home() {
  // const [username, setUsername] = useState<string>("");
  // useEffect(() => {
  //   // On component mount, check if there is a cookie for the switch state
  //   const savedSwitchState = Cookies.get("usernameState");
  //   if (savedSwitchState) {
  //     const switchState: usernameState = JSON.parse(savedSwitchState);
  //     setUsername(switchState.value);
  //   }
  // }, []);

  const [convoId, setConvoId] = useState<string>("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');

    if (idParam) {
      // If id parameter exists in the URL, set convoId to its value
      setConvoId(idParam);
    } else {
      // If id parameter doesn't exist, generate a random id
      const randomId = generateRandomId();
      // Update the URL with the generated id
      const url = new URL(window.location.href);
      url.searchParams.set('id', randomId);
      window.history.replaceState({}, '', url.toString());
      // Set convoId to the generated id
      setConvoId(randomId);
    }

    let savedconvoState 
    if(idParam!==null){
      savedconvoState= Cookies.get(idParam);
    }
    if (savedconvoState) {
      const convoState: convoState = JSON.parse(savedconvoState);
      setConvoJsonArray(convoState.value);
    }
  }, []);

  // Function to generate a random id
  const generateRandomId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  // async function saveId(){

  // }
  async function saveConversation(){
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get('id');
    const newtime = await getCurrentDateAndTime();
    if(idParam!==null){
      Cookies.set(idParam, JSON.stringify({
        parent: "Conversations",
        attribute: newtime,
        id: convoId,
        value: convoJsonArray
      }));
    }
  }

  function getCurrentDateAndTime(): string {
    const months: string[] = [
      "January", "February", "March", "April", "May", "June", 
      "July", "August", "September", "October", "November", "December"
    ];
    
    const date: Date = new Date();
    const day: number = date.getDate();
    const month: string = months[date.getMonth()];
    const year: number = date.getFullYear();
    const hours: number = date.getHours();
    const minutes: number = date.getMinutes();
    
    // Function to add ordinal suffix to day
    const getOrdinalSuffix = (number: number): string => {
      if (number > 3 && number < 21) return 'th';
      switch (number % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
      }
    };
    
    const ordinalDay: string = day + getOrdinalSuffix(day);
    
    // Function to add leading zero if necessary
    const addLeadingZero = (number: number): string => {
      return number < 10 ? '0' + number : number.toString();
    };
    
    const formattedTime: string = addLeadingZero(hours) + ':' + addLeadingZero(minutes);
    
    return `${ordinalDay} ${month}, ${year} | ${formattedTime}`;
  }

  const [count, setCount] = useState(0);
  let convo: ConvoItem[] = [{
    index: 0,
    you: "Hi!",
    cfassist: `Hello , I'm Cfassist. How can I help you?`,
  }];

  // Initialize state with the initial convo value
  const [convoJsonArray, setConvoJsonArray] = useState<ConvoItem[]>(convo);

  async function changeCount() {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (count === 0) {
      setCount(1);
    } else {
      setCount(0);
    }
  }

  const [pressTimer, setPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPress, setIsLongPress] = useState(false);

  // Function to handle long press
  const longPressHandler = () => {
    setIsLongPress(true);
    // Invoke your function for long press here
    setCount(1);
    runSpeechRecog()
  };

  const [shouldCapture, setShouldCapture] = useState(false);
  const [shouldrecorded, setShouldRecorded] = useState(false);
  const [changeMode, setChangeMode] = useState(false);
  const [cameraVal, setCameraval] = useState<string>('');

  const cameraValClickHandler = (newValue: string) => {
    setCameraval(newValue);
  };

  const modeHandler = () => {
    if (changeMode === false) {
      setChangeMode(true);
    } else {
      setChangeMode(false);
    }
    console.log(changeMode);
  };

  const recordClickhandler = () =>{
    if(shouldrecorded===false){
      setShouldRecorded(true);
    }else{
      setShouldRecorded(false);
    }
    console.log("Click detected!");
  }

  // Function to handle click
  const clickHandler = () => {
    if (!isLongPress) {
      // Invoke your function for click here
      if(shouldCapture===false){
        setShouldCapture(true);
      }else{
        setShouldCapture(false);
      }
      console.log("Click detected!");
    }
  };


  const handleMouseDown = () => {
    const timer = setTimeout(longPressHandler, 300); // Adjust duration for your preference
    setPressTimer(timer);
  };

  // Event handler for mouse up (end of press)
  const handleMouseUp = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      if (isLongPress) {
        // If it was a long press, reset the long press flag
        setIsLongPress(false);
        setCount(0);
        speak("Please wait !");
      } else {
        // If it was a short press, handle it as click
        clickHandler();
      }
    }
  };

  async function speak(text: string) {
    // Create a SpeechSynthesisUtterance
    const utterance = new SpeechSynthesisUtterance(text);
  
    // Select a voice
    const voices = await speechSynthesis.getVoices();
    utterance.voice = voices[0]; // Choose a specific voice
  
    // Speak the text
    await speechSynthesis.speak(utterance);
  }

  const [isSpeechRecog, setIsSpeechRecog] = useState("");
  const [isFinalSpeechRecog, setIsFinalSpeechRecog] = useState("");

  function runSpeechRecog() {
    let recognition: any;
    let mediaRecorder: any;
    let audioChunks: any[] = [];

    // @ts-ignore
    recognition = new webkitSpeechRecognition();

    recognition.onstart = () => {
        console.log("Listening...");
        startRecording();
    }

    recognition.onresult = (e: any) => {
       var transcript = e.results[0][0].transcript;
       setIsFinalSpeechRecog(isFinalSpeechRecog + transcript);
       setIsSpeechRecog(transcript);
    }

    recognition.onend = () => {
        console.log("Recording stopped.");
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    }

    recognition.start();

    function startRecording() {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(function (stream) {
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.ondataavailable = function (e: any) {
                    audioChunks.push(e.data);
                };
                mediaRecorder.onstop = function () {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                    convertAndSendAudio(audioBlob);
                };
                mediaRecorder.start();
            })
            .catch(function (err) {
                console.log('The following getUserMedia error occurred: ' + err);
            });
    }

    function convertAndSendAudio(blob: Blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64data = reader.result?.toString().split(',')[1];
            if (base64data) {
                if(shouldrecorded===true){
                  uploadAudioAndImage(base64data,cameraVal);
                }else{
                  uploadAudio(base64data);
                }
            }
        };
    }

    function uploadAudioAndImage(audioBase64: string, cameravalue: string) {
        fetch(process.env.NEXT_PUBLIC_SERVER_URL+'/imagetotext', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: audioBase64, image: cameravalue  }),
        })
            .then(response => response.text())
            .then(data => {
                console.log('Transcription response:', data);
                // Parse the JSON string into a JavaScript object
                const responseData = JSON.parse(data);

                convo = convoJsonArray;
                // Determine the index for the new object
                const newIndex = convo.length > 0 ? convo[convo.length - 1].index + 1 : 0;

                // Add the new object to the conversation array
                convo.push({
                    index: newIndex,
                    //@ts-ignore
                    you: responseData.you,
                    //@ts-ignore
                    cfassist: responseData.cfassist,
                });
                setConvoJsonArray(convo);
                speak(responseData.cfassist);
                console.log("Convo", convo);
                handleButtonClick();
                saveConversation();

            })
            .catch(error => {
                console.error('Error:', error);
            });

        recordClickhandler();
    }

    function uploadAudio(audioBase64: string) {
        fetch(process.env.NEXT_PUBLIC_SERVER_URL+'/transcribe', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ audio: audioBase64 }),
        })
            .then(response => response.text())
            .then(data => {
                console.log('CFassist response:', data);
                // Parse the JSON string into a JavaScript object
                const responseData = JSON.parse(data);

                convo = convoJsonArray;
                // Determine the index for the new object
                const newIndex = convo.length > 0 ? convo[convo.length - 1].index + 1 : 0;

                // Add the new object to the conversation array
                convo.push({
                    index: newIndex,
                    //@ts-ignore
                    you: responseData.you,
                    //@ts-ignore
                    cfassist: responseData.cfassist,
                });
                setConvoJsonArray(convo);
                speak(responseData.cfassist);
                console.log("Convo", convoJsonArray);
                handleButtonClick();
                saveConversation();
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }
}

const [updateTrigger, setUpdateTrigger] = useState(false);

const handleButtonClick = () => {
  // Set updateTrigger to true to trigger a state update
  if(updateTrigger===false){
    setUpdateTrigger(true);
  }else{
    setUpdateTrigger(false);
  }
};

const [chatmessage, setChatMessage] = useState<string>(''); // State to manage the textarea value

// Function to handle textarea value change
const handleMessageChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
  setChatMessage(event.target.value); // Update the message state with the new value
};

const [chatphoto,setChatPhoto] = useState(false);

async function chatstate(){
  if(chatphoto===false && shouldrecorded===false){
    clickHandler();
    setChatPhoto(true);
  }else if(chatphoto===false && shouldrecorded===true){
    setShouldRecorded(false);
  }else if(chatphoto===true && shouldrecorded===true){
    setShouldRecorded(false);
    setChatPhoto(false);
  }else{
    setChatPhoto(false);
  }
}
async function runChatCombo(){
  console.log(shouldrecorded);
  console.log("cameraVal:",cameraVal);
  if(chatphoto===false && shouldrecorded===true){
    await uploadTextAndImage(chatmessage,cameraVal);
  }else if(chatphoto===true && shouldrecorded===false){
    setShouldRecorded(false);
  }else if(chatphoto===true && shouldrecorded===true){
    await uploadTextAndImage(chatmessage,cameraVal);
    console.log("error in states!");
  }else{
    await sendMessage();
  }
}

function uploadTextAndImage(chatintext: string, cameravalue: string) {
  fetch(process.env.NEXT_PUBLIC_SERVER_URL+'/chatimagetotext', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: chatintext, image: cameravalue  }),
  })
      .then(response => response.text())
      .then(data => {
          console.log('Transcription response:', data);
          // Parse the JSON string into a JavaScript object
          const responseData = JSON.parse(data);

          convo = convoJsonArray;
          // Determine the index for the new object
          const newIndex = convo.length > 0 ? convo[convo.length - 1].index + 1 : 0;

          // Add the new object to the conversation array
          convo.push({
              index: newIndex,
              //@ts-ignore
              you: responseData.you,
              //@ts-ignore
              cfassist: responseData.cfassist,
          });
          setConvoJsonArray(convo);
          speak(responseData.cfassist);
          console.log("Convo", convo);
          handleButtonClick();
          saveConversation();

      })
      .catch(error => {
          console.error('Error:', error);
      });

  chatstate();
  return 0;
}

async function sendMessage() {
  try {
      const requesturl = process.env.NEXT_PUBLIC_SERVER_URL+'/chat';
      const response = await fetch(requesturl, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text: chatmessage }),
      });
      
      if (!response.ok) {
          throw new Error('Failed to send message');
      }
      
      const responseData = await response.json();

      convo = convoJsonArray;
      // Determine the index for the new object
      const newIndex = convo.length > 0 ? convo[convo.length - 1].index + 1 : 0;

      // Add the new object to the conversation array
      convo.push({
          index: newIndex,
          //@ts-ignore
          you: responseData.you,
          //@ts-ignore
          cfassist: responseData.cfassist,
      });
      setConvoJsonArray(convo);
      await speak(responseData.cfassist);
      console.log("Convo", convoJsonArray);
      handleButtonClick();
      saveConversation();
      return 0;
  } catch (error) {
      console.error('Error:', error);
      // Handle error
      throw error;
  }
}

  return (
    <>
    <ChatContextProvider value={convoJsonArray}>
    <div className='h-screen w-full bg-gray-900'>
      <Navbar modeHandler={modeHandler} handleButtonClick={handleButtonClick} />
      <div className="h-[60%] p-6 pt-0 flex flex-col items-center justify-center">
      <Carousel className="w-full h-full">
      <CarouselContent>
        <CarouselItem className="w-full h-full flex flex-col items-center justify-center">
        <div className="mt-6 rounded h-full md:max-w-[500px] max-w-[350px]">
        <button id="hiddenButton" onClick={handleButtonClick} className="hidden"></button>
          <CameraComponent 
            shouldCapture={shouldCapture} 
            onCaptureComplete={clickHandler}
            shouldRecorded={shouldrecorded}  
            recordClickhandler={recordClickhandler}
            cameraVal={cameraVal}
            cameraValClickHandler={cameraValClickHandler}
            updateTrigger={updateTrigger}
          />
        </div>
        </CarouselItem>
        <CarouselItem className="w-full h-full flex flex-col items-center justify-center">
          <ImageUploader 
          shouldRecorded={shouldrecorded}  
          recordClickhandler={recordClickhandler}
          cameraVal={cameraVal}
          cameraValClickHandler={cameraValClickHandler}
          updateTrigger={updateTrigger}
          />
        </CarouselItem>
        <CarouselItem className="w-full h-full">
        <ScrollArea className="h-[calc(55vh)] w-full">
          <Chat />
          </ScrollArea>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious className="sm:ml-10 ml-[95%] mt-[47%] sm:mt-0"/>
      <CarouselNext className="sm:mr-10 mr-10 mt-[47%] sm:mt-0"/>
    </Carousel>
      </div>
      <div className="h-[5%] w-full flex flex-col items-center justify-center overflow-y-scroll overflow-x-hidden" style={{ scrollBehavior: 'smooth' }}>
        <h3 id="output" className="text-white font-bold ml-6">
          {isFinalSpeechRecog} 
          {count === 1 ? isSpeechRecog : ""}
        </h3>
      </div>


      {changeMode===true?
      <div 
        className="h-[22%] overflow-hidden flex items-center justify-center " 
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        <Siriwave theme="ios9" amplitude={count}/>

        </div>
        :
        <div className="flex w-full h-[22%] gap-2 p-2">
          <Textarea className="w-full border border-white h-[50px] rounded-lg bg-primary mt-auto"placeholder="Type your message here." 
          value={chatmessage} // Set the value of the textarea to the message state
          onChange={handleMessageChange} />
          <div className="h-full flex flex-col sm:flex-row justify-center items-center gap-2">
            <Button className="text-black bg-lime-400 mt-auto mb-auto" onClick={runChatCombo}>Send</Button>
            <Button className="text-black bg-blue-400 mt-auto mb-auto" onClick={chatstate}>Photo</Button>
            {/* <Button variant="destructive" className="text-white mt-auto mb-auto"
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}>Record</Button> */}
          </div>
        </div>
        }
    </div>
    </ChatContextProvider>
    </>
  );
}
