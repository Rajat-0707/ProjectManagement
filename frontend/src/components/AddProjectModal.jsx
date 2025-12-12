import React, { Fragment, memo, useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import BtnPrimary from "./BtnPrimary";
import BtnSecondary from "./BtnSecondary";
import axios from "axios";
import toast from "react-hot-toast";

const AddProjectModal = ({ isModalOpen, closeModal, edit = false, id = null }) => {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  useEffect(() => {
    if (edit && isModalOpen) {
      axios
        .get(`${import.meta.env.VITE_API_URL}/project/${id}`)
        .then((res) => {
          setTitle(res.data[0].title);
          setDesc(res.data[0].description);
        })
        .catch(() => toast.error("Something went wrong"));
    }
  }, [isModalOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = { title, description: desc };

    const apiCall = !edit
      ? axios.post(`${import.meta.env.VITE_API_URL}/project/`, payload)
      : axios.put(`${import.meta.env.VITE_API_URL}/project/${id}`, payload);

    apiCall
      .then((res) => {
        closeModal();
        document.dispatchEvent(new CustomEvent("projectUpdate", { detail: res.data }));
        toast.success(
          edit ? "Project updated successfully" : "Project created successfully"
        );
        setTitle("");
        setDesc("");
      })
      .catch((error) => {
        if (error.response?.status === 422) {
          toast.error(error.response.data.details[0].message);
        } else {
          toast.error("Something went wrong");
        }
      });
  };

  return (
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" onClose={closeModal} className="relative z-50">
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-90"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-90"
          >
            <Dialog.Panel className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden">

              {/* Header */}
              <div className="relative px-6 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
                <h1 className="text-lg font-semibold">
                  {edit ? "Edit Project" : "Create New Project"}
                </h1>

                {/* Close Button */}
                <button
                  onClick={closeModal}
                  className="absolute right-4 top-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 transition text-white"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 bg-white">
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Project Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter project title"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                    required
                    />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    rows="5"
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    placeholder="Describe your project..."
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm shadow-sm resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-indigo-500 transition"
                   required
                    ></textarea>
                  
                </div>

                <div className="flex justify-end space-x-3 pt-2">
                  <BtnSecondary onClick={closeModal}>Cancel</BtnSecondary>
                  <BtnPrimary>{edit ? "Update" : "Save"}</BtnPrimary>
                </div>

              </form>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default memo(AddProjectModal);
