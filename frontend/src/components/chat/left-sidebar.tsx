"use client";

import { Logo } from "../ui/logo";

const ChatLeftSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-48 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
      <>
        <div className="flex items-center mb-6">
          <Logo />
        </div>
      </>
    </aside>
  );
};

export default ChatLeftSidebar;
