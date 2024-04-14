"use client"
import React, { useEffect, useState } from 'react';
import { Separator } from "@/components/ui/separator"
import { useChatContext } from "./ChatContext";

const Chat: React.FC = () => {
  const jsonArray = useChatContext();

  const [, forceUpdate] = useState<{}>({}); // State for triggering re-render

  useEffect(() => {
    console.log('Chat component rendered');
  });

  useEffect(() => {
    forceUpdate({}); // Trigger re-render when jsonArray changes
  }, [jsonArray]);

  return (
    <div className='w-full h-[65%] p-6'>
      {jsonArray.map((obj, index) => (
        <div key={index}>
          <div className='font-bold text-white mt-1'>You</div>
          <div className='text-gray-300 mt-1'>{obj.you}</div>
          <Separator className='mt-2 h-[1px] bg-gray-600' />
          <div className='font-bold text-orange-400 mt-2'>CFassist</div>
          <div className='text-gray-300 mt-1'>{obj.cfassist}</div>
          {index !== jsonArray.length - 1 && <Separator className='mt-2 h-[1px] bg-gray-600' />}
        </div>
      ))}
    </div>
  );
};

export default Chat;

