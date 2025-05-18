"use client";

import { LogOutIcon, PiIcon } from "lucide-react";
import Link from "next/link";
import { Logo } from "../ui/logo";

const ChatLeftSidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-50 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 p-4">
      <>
        <div className="flex items-center mb-6">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Logo />
          </Link>
        </div>
        <div className="flex items-center mb-6">
          <h1 className="text-xl font-semibold text-slate-700 dark:text-slate-100">Valora Chats</h1>
        </div>
        <nav className="flex-grow space-y-2">
          <Link href="#" className="flex items-center p-2 text-slate-600 dark:text-slate-300 bg-blue-100 dark:bg-blue-700 dark:text-white rounded-lg font-medium">
            <PiIcon className="w-5 h-5 mr-3" />
            AI Seller Assistant
          </Link>
          {/* More chat links */}
        </nav>
        <div className="mt-auto">
          <button className="w-full flex items-center justify-center p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors">
            <LogOutIcon className="w-5 h-5 mr-2" />
            Logout
          </button>
        </div>
      </>
    </aside>
  );
};

export default ChatLeftSidebar;
