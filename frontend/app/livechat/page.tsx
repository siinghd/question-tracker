import { NewLiveChatSession } from '@/components/new-chat-session';
import { Button } from '@/components/ui/button';
import React from 'react';

const LiveChat = () => {
  return (
    <div className="  h-screen p-8 transition-colors duration-500">
      <div className="flex justify-between items-center mb-6">
        <div className="text-3xl dark:text-white  text-black transition-colors duration-500">
          <h1 className="text-black  dark:text-white">Sessions</h1>
        </div>
        <NewLiveChatSession />
      </div>
      <div className="grid grid-cols-4 gap-4" />
    </div>
  );
};

export default LiveChat;
