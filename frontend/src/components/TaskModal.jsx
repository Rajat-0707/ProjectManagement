import React, { Fragment, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import axios from "axios";
import toast from "react-hot-toast";

const TaskModal = ({ isOpen, setIsOpen, id }) => {
  const [taskData, setTaskData] = useState({});

  const capitalizeFirstLetter = (string) =>
    string ? string.charAt(0).toUpperCase() + string.slice(1) : "";

  useEffect(() => {
    if (!isOpen || !id?.projectId || !id?.id) return;

    axios
      .get(`${import.meta.env.VITE_API_URL}/project/${id.projectId}/task/${id.id}`)
      .then((res) => {
        setTaskData(res.data); // ✔ FIXED
      })
      .catch(() => toast.error("Something went wrong"));
  }, [isOpen]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="relative z-50"
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-75 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-75 scale-95"
          >
            <Dialog.Panel className="bg-white rounded-xl shadow-2xl max-w-5xl w-[85%] h-[85%] flex flex-col overflow-hidden">

              {/* HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b bg-white sticky top-0 z-10 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">
                  Task Details
                </h2>

                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
                >
                  ✕
                </button>
              </div>

              {/* BODY */}
              <div className="flex flex-1 overflow-hidden">
                {/* LEFT */}
                <div className="w-8/12 px-8 py-6 overflow-y-auto space-y-6">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {capitalizeFirstLetter(taskData.title)}
                  </h1>
                  <p className="text-gray-600">
                    {capitalizeFirstLetter(taskData.description)}
                  </p>

                  <div className="grid grid-cols-2 gap-6 mt-6">
                    <div>
                      <h3 className="text-sm text-gray-500 font-medium">Stage</h3>
                      <span className="inline-block bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded">
                        {taskData.stage}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500 font-medium">
                        Task Index
                      </h3>
                      <span className="inline-block bg-gray-100 text-gray-700 text-xs font-medium px-2 py-1 rounded">
                        #{taskData.index}
                      </span>
                    </div>
                  </div>
                </div>

                {/* RIGHT PANEL */}
                <div className="w-4/12 border-l bg-gray-50 px-6 py-6 overflow-y-auto">
                  <p className="text-gray-600 text-sm font-medium mb-2">
                    More Options
                  </p>
                  <p className="text-xs text-gray-500">
                    (Add comments, attachments, activity logs later.)
                  </p>
                </div>
              </div>

            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TaskModal;
