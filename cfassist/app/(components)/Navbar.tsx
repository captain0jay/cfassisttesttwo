import React, { FunctionComponent, useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch"
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import Cookies from "js-cookie";
import { url } from 'inspector';

interface ConvoItem {
  index: number;
  you: string;
  cfassist: string;
}

interface CookieObject {
  parent: string;
  attribute: string;
  id: number;
  value: ConvoItem[];
}

interface NavbarProps {
  modeHandler: () => void; // Define the type of modeHandler prop
  handleButtonClick: () => void;
}

interface SwitchState {
  parent: string;
  attribute: string;
  value: boolean;
}


const Navbar: FunctionComponent<NavbarProps> = ({ modeHandler, handleButtonClick }) => {
  const [cameraPermission, setCameraPermission] = useState<boolean>(false);
  const [audioPermission, setAudioPermission] = useState<boolean>(false);
  const [conversationCookies, setConversationCookies] = useState<CookieObject[]>([]);

  useEffect(() => {
    checkCameraPermission();
    checkAudioPermission();

    const allCookies = Object.entries(Cookies.get());
    const conversationCookies: CookieObject[] = [];

    allCookies.forEach(([cookieName, cookieValue]) => {
      try {
        const parsedCookie: CookieObject = JSON.parse(cookieValue);
        if (parsedCookie.parent === "Conversations") {
          conversationCookies.push(parsedCookie);
        }
      } catch (error) {
        // Ignore non-JSON cookies
      }
    });

    setConversationCookies(conversationCookies);
  }, []);

  async function requestMediaAccess(mediaType: 'audio' | 'video'): Promise<MediaStream> {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        reject("getUserMedia is not supported in this browser");
      } else {
        navigator.mediaDevices.getUserMedia({ audio: mediaType === 'audio', video: mediaType === 'video' })
          .then(stream => {
            resolve(stream);
          })
          .catch(err => {
            reject(err);
          });
      }
    });
  }
  
  async function requestNotificationPermission() {
    return new Promise((resolve, reject) => {
      if (!('Notification' in window)) {
        reject("Notifications not supported in this browser");
      } else if (Notification.permission === 'granted') {
        //@ts-ignore
        resolve();
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            //@ts-ignore
            resolve();
          } else {
            reject("Permission denied for notifications");
          }
        });
      } else {
        reject("Permission denied for notifications");
      }
    });
  }

  async function checkCameraPermission() {
    try {
      await requestNotificationPermission();
      await requestMediaAccess('video');
      setCameraPermission(true);
    } catch (err) {
      console.error("Error:", err);
      alert("Camera Permission denied by User. Please enable camera access in your browser settings.");
      setCameraPermission(false);
    }
  }
  
  async function checkAudioPermission() {
    try {
      await requestNotificationPermission();
      await requestMediaAccess('audio');
      setAudioPermission(true);
    } catch (err) {
      console.error("Error:", err);
      alert("Audio Permission denied by User. Please enable camera access in your browser settings.");
      setAudioPermission(false);
    }
  }

  const [isChecked, setIsChecked] = useState<boolean>(false);
  const [firstTime,setFirstTime] = useState<boolean>(false);

  useEffect(() => {
    // On component mount, check if there is a cookie for the switch state
    const savedSwitchState = Cookies.get("switchState");
    if (savedSwitchState) {
      const switchState: SwitchState = JSON.parse(savedSwitchState);
      setIsChecked(prevState => {
        if (!prevState && switchState.value) {
          modeHandler(); // Call modeHandler if the switch state is true
        }
        return switchState.value;
      });
    }
  }, []);

  const handleSwitchChange = (checked: boolean) => {
    setIsChecked(checked);
    modeHandler();
    // Save the switch state in a cookie
    Cookies.set("switchState", JSON.stringify({
      parent: "settings",
      attribute: "switch",
      value: checked
    }));
  };
  
 const [username, setUsername] = useState<string>("");

 async function saveSettings(){
  Cookies.set("usernameState", JSON.stringify({
    parent: "settings",
    attribute: "username",
    value: username
  }));
 }
 //const currentUrl = usePathname(); // Get the current pathname
 //const searchParams = useSearchParams(); // Get the search parameters
 //const router = useRouter()

//  useEffect(() => {
//    console.log("Mounted!");
//  }, []);

//  const convohandleClick = (yourVariable: any) => {
//    const id = yourVariable; // Use the variable passed to the function
//    const newSearchParams = new URLSearchParams(searchParams);
//    newSearchParams.set('id', id); // Set the 'id' query parameter
//    const urlWithId = `${currentUrl}?${newSearchParams.toString()}`; // Update the URL with the modified search parameters
//    console.log("New URL:", urlWithId);
//    window.location.search = urlWithId;
//    router.push(urlWithId);
//    handleButtonClick(); // Call the handleButtonClick function to update the URL
//    // Navigate to the updated URL or perform other actions as needed
//  };

  return (
    <>
      <div className='h-[60px] w-full flex'>
        <div className="ml-1 p-2">
          <Sheet>
            <SheetTrigger>
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="feather feather-menu">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            </SheetTrigger>
            <SheetContent side={"left"} className='bg-gray-800 backdrop-blur-md w-full sm:w-[300px] pr-2 pl-2'>
              <SheetHeader>
                <SheetTitle className='text-white'>Previous conversations</SheetTitle>
              </SheetHeader>
              <div className='flex flex-col gap-2 w-full mt-5'>
                  {conversationCookies.map((cookie, index) => (
                    <div className='w-full p-1 h-[35px] rounded-md bold border border-white text-lime-300 flex justify-center items-center' key={index} onClick={() => window.location.search = `?id=${cookie.id}`}

                    >
                      {cookie.attribute}
                    </div>
                  ))}
                  </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className='mt-2 ml-auto mr-3 flex gap-2'>
            <Dialog>
              <DialogTrigger asChild>
                
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="feather feather-settings"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Settings</DialogTitle>
                  <DialogDescription>
                    Choose your preferred settings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4 ">
                  <div className='flex grid grid-cols-2 gap-5'>
                    <Label htmlFor="audio" className='my-auto col-span-1'>Audio Permission</Label>
                    {audioPermission? 
                    <Button variant="secondary" disabled>Granted Already</Button>
                    :
                    <Button variant="destructive" onClick={checkAudioPermission} className='col-span-1'>Grant Access</Button> 
                    }
                  </div>

                  <div className='flex grid grid-cols-2 gap-5'>
                    <Label htmlFor="audio" className='my-auto col-span-1'>Camera Permission</Label>
                    {cameraPermission? 
                    <Button variant="secondary" disabled>Granted Already</Button>
                    :
                    <Button variant="destructive" onClick={checkCameraPermission} className='col-span-1'>Grant Access</Button> 
                    }
                  </div>
                  <div className='flex grid grid-cols-2 gap-5'>
                    <Label htmlFor="audio" className='my-auto col-span-1'>CFassist mode</Label>
                    <div className='flex items-center justify-center col-span-1'>
                    <Switch checked={isChecked} onCheckedChange={handleSwitchChange} />
                    </div>
                  </div>

                  <div className='flex grid grid-cols-2 gap-5'>
                    <Label htmlFor="audio" className='my-auto col-span-1'>Username</Label>
                    <Input placeholder="Coming soon..." value={username} onChange={e => setUsername(e.target.value)} disabled/>
                  </div>

                </div>
                <DialogFooter>
                  <Button type="submit" onClick={saveSettings}>Save changes</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Switch onCheckedChange={handleSwitchChange} onChange={modeHandler} checked={isChecked}/>
          </div>
      </div>
    </>
  );
}

export default Navbar;
