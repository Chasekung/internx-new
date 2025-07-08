'use client';

import { useState } from 'react';
import { 
  HashtagIcon,
  BellIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  PaperAirplaneIcon,
  FaceSmileIcon,
  PaperClipIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

const messages = [
  {
    id: 1,
    type: 'announcement',
    author: 'Step Up Bot',
    avatar: '/stepupflat.png',
    timestamp: '10:30 AM',
    content: {
      title: '🎉 Congratulations! You\'ve been accepted!',
      body: 'Through our AI matching system and the Employers at Step Up, you have been chosen to intern as a <b>Finance Intern</b> at <b>Step Up</b>!',
      details: {
        position: 'Finance Intern',
        company: 'Step Up',
        duration: '10 weeks (June - August 2024)',
        location: 'Boston, Massachusetts',
        compensation: '$11/hour'
      },
      action: 'Connect with your new team and start your journey!'
    }
  },
  {
    id: 2,
    type: 'update',
    author: 'Step Up Notifications',
    avatar: '/stepupflat.png',
    timestamp: 'Yesterday',
    content: {
      title: 'Application Status Update',
      body: 'Your application to Microsoft has been reviewed and moved to the next round.'
    }
  },
  {
    id: 3,
    type: 'message',
    author: 'Microsoft Recruiting',
    avatar: '/stepupflat.png',
    timestamp: '2 days ago',
    content: {
      title: 'Thank you for applying',
      body: 'We have received your application for the Software Engineering Intern position and will be in touch soon.'
    }
  }
];

const SectionDivider = ({ icon, label }: { icon: any; label: string }) => (
  <div className="flex items-center my-8">
    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white mr-3 shadow">
      {icon}
    </span>
    <span className="text-lg font-semibold text-gray-700 tracking-wide">{label}</span>
    <div className="flex-1 h-0.5 bg-gradient-to-r from-blue-100 to-purple-100 ml-4 rounded-full" />
  </div>
);

const TABS = [
  {
    key: 'announcement',
    label: 'Announcements',
    icon: <MegaphoneIcon className="h-5 w-5" />,
  },
  {
    key: 'update',
    label: 'Updates',
    icon: <CheckCircleIcon className="h-5 w-5" />,
  },
  {
    key: 'message',
    label: 'Messages',
    icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
  },
];

export default function MailPage() {
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('announcement');

  const filteredMessages = messages.filter(m => m.type === activeTab);
  const tabLabel = TABS.find(t => t.key === activeTab)?.label;
  const tabIcon = TABS.find(t => t.key === activeTab)?.icon;

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 to-green-50 flex flex-col items-center" style={{ marginTop: '5rem' }}>
      {/* Floating Sidebar Card */}
      <div className="absolute left-8 top-0 w-72 mt-8 z-10">
        <div className="rounded-3xl shadow-xl bg-white/90 border border-blue-100 p-6 flex flex-col items-center">
          <div className="w-14 h-14 rounded-full mb-3 shadow bg-[linear-gradient(135deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] flex items-center justify-center"></div>
          <h1 className="text-2xl font-bold text-blue-700 mb-1">Connect</h1>
          <p className="text-gray-500 text-center text-sm mb-2">Your Step Up messaging hub</p>
        </div>
      </div>

      {/* Main Feed Card */}
      <div className="w-full max-w-2xl mx-auto mt-12 mb-32">
        {/* Tab Interface */}
        <div className="flex justify-center gap-4 mb-8">
          {TABS.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-lg font-semibold shadow transition-all duration-200 border-2 focus:outline-none
                ${activeTab === tab.key
                  ? 'text-black border-blue-300 scale-105 shadow-lg bg-[linear-gradient(90deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)]'
                  : 'bg-white/80 text-gray-500 border-gray-200 hover:bg-blue-50 hover:text-blue-700'}
              `}
              style={{ minWidth: 170 }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Section Divider for current tab */}
        <SectionDivider icon={tabIcon} label={tabLabel || ''} />

        {/* Tab Content */}
        <div className="transition-all duration-300">
          {filteredMessages.length === 0 && (
            <div className="text-center text-gray-400 py-12 text-lg">No {tabLabel?.toLowerCase()} yet.</div>
          )}
          {filteredMessages.map(message => (
            <div key={message.id} className="relative mb-8">
              <div className={`absolute left-4 top-0 bottom-0 w-1 rounded-full ${
                activeTab === 'announcement'
                  ? 'bg-[linear-gradient(180deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] opacity-30'
                  : activeTab === 'update'
                  ? 'bg-[linear-gradient(180deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] opacity-20'
                  : 'bg-[linear-gradient(180deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] opacity-10'
              }`} />
              <div className={`ml-12 rounded-2xl shadow border p-6 flex flex-col ${
                activeTab === 'announcement'
                  ? 'bg-white border-purple-100 shadow-lg'
                  : activeTab === 'update'
                  ? 'bg-white border-blue-100'
                  : 'bg-white border-gray-100'
              }`}>
                <div className="flex items-center mb-2">
                  <div className={`w-8 h-8 rounded-full mr-2 flex items-center justify-center bg-[linear-gradient(135deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)]`}></div>
                  <span className={`font-semibold ${
                    activeTab === 'announcement'
                      ? 'text-blue-700'
                      : activeTab === 'update'
                      ? 'text-blue-700'
                      : 'text-gray-700'
                  }`}>{message.author}</span>
                  <span className="ml-2 text-xs text-gray-400">{message.timestamp}</span>
                </div>
                <h3 className={`text-xl font-bold mb-2 ${
                  activeTab === 'announcement'
                    ? 'text-blue-800'
                    : activeTab === 'update'
                    ? 'text-blue-800'
                    : 'text-gray-800'
                }`} dangerouslySetInnerHTML={{ __html: message.content.title }} />
                <p className="text-gray-700 mb-3" dangerouslySetInnerHTML={{ __html: message.content.body }} />
                {message.content.details && (
                  <div className="bg-[linear-gradient(90deg,_rgb(232,236,250)_0%,_rgb(221,218,250)_100%)] rounded-lg p-4 mb-3 border border-purple-100 text-black">
                    <h4 className="font-semibold text-gray-900 mb-1">Position Details:</h4>
                    <ul className="text-sm text-gray-900 grid grid-cols-2 gap-x-4 gap-y-1">
                      <li><b>Position:</b> {message.content.details.position}</li>
                      <li><b>Company:</b> {message.content.details.company}</li>
                      <li><b>Duration:</b> {message.content.details.duration}</li>
                      <li><b>Location:</b> {message.content.details.location}</li>
                      <li className="col-span-2"><b>Compensation:</b> {message.content.details.compensation}</li>
                    </ul>
                  </div>
                )}
                {message.content.action && (
                  <>
                    <p className="text-gray-700 mb-4">{message.content.action}</p>
                    <div className="text-center">
                      <button className="inline-flex items-center px-8 py-3 font-semibold rounded-full shadow-lg transition-all text-lg text-black bg-[linear-gradient(90deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] hover:brightness-105">
                        <UserGroupIcon className="h-6 w-6 mr-2" />
                        Connect with Your Team
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Message Input */}
      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 w-full max-w-2xl z-20">
        <div className="flex items-center bg-white rounded-full shadow-lg border border-blue-100 px-6 py-3">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent outline-none text-gray-800 text-base placeholder-gray-400"
          />
          <button className="p-2 hover:bg-blue-50 rounded-full">
            <FaceSmileIcon className="h-5 w-5 text-blue-400" />
          </button>
          <button className="p-2 hover:bg-blue-50 rounded-full">
            <PaperClipIcon className="h-5 w-5 text-blue-400" />
          </button>
          <button className="ml-2 px-4 py-2 rounded-full font-semibold shadow text-white bg-[linear-gradient(90deg,_rgb(199,222,252)_0%,_rgb(172,177,246)_100%)] hover:brightness-105 transition-all">
            <PaperAirplaneIcon className="h-5 w-5 inline-block mr-1" />
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 