import React, { useCallback, useEffect, useState } from "react";
import AddProjectModal from "./AddProjectModal";
import axios from "axios";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const [isModalOpen, setModalState] = useState(false);
  const [projects, setProjects] = useState([]);
  const [paramsWindow, setParamsWindow] = useState(
    window.location.pathname.slice(1)
  );

  const openModal = useCallback(() => setModalState(true), []);
  const closeModal = useCallback(() => setModalState(false), []);

  const handleLocation = (e) => {
    setParamsWindow(new URL(e.currentTarget.href).pathname.slice(1));
  };

  const projectData = () => {
    axios.get(`${import.meta.env.VITE_API_URL}/projects/`).then((res) => {
      setProjects(res.data);
    });
  };

  useEffect(() => {
    projectData();
    document.addEventListener("projectUpdate", projectData);

    return () => document.removeEventListener("projectUpdate", projectData);
  }, []);

  return (
    <>
      <div className="md:hidden w-full bg-white border-b border-gray-200">
        <SidebarContent
          projects={projects}
          paramsWindow={paramsWindow}
          openModal={openModal}
          handleLocation={handleLocation}
          variant="horizontal"
        />
      </div>

      <aside className="hidden md:block h-full w-[240px] bg-white border-r border-gray-200">
        <SidebarContent
          projects={projects}
          paramsWindow={paramsWindow}
          openModal={openModal}
          handleLocation={handleLocation}
          variant="vertical"
        />
      </aside>

      <AddProjectModal isModalOpen={isModalOpen} closeModal={closeModal} />
    </>
  );
};

export default Sidebar;


/* ------------------ REUSABLE SIDEBAR CONTENT ------------------ */
 
const SidebarContent = ({ projects, paramsWindow, openModal, handleLocation, variant = "vertical" }) => {
  const isHorizontal = variant === "horizontal";
  return (
    <div className={isHorizontal ? "py-3 px-2" : "py-6 pr-3 h-full bg-white"}>
      <div className={isHorizontal ? "px-2 mb-2 flex items-center justify-between" : "px-4 mb-4 flex items-center justify-between"}>
        <h2 className="text-sm font-semibold text-gray-700 tracking-wide">
          Projects
        </h2>

        <button
          onClick={openModal}
          className="p-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-600 rounded-full shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-offset-1"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            className="w-5 h-5"
            viewBox="0 0 24 24"
          >
            <path d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z" />
          </svg>
        </button>
      </div>

      {isHorizontal ? (
        <ul className="flex gap-2 overflow-x-auto px-2 pb-2">
          {projects.length === 0 && (
            <div className="text-gray-400 text-sm py-3 px-2">No projects yet</div>
          )}
          {projects.map((project) => (
            <Link key={project._id} to={project._id} onClick={handleLocation}>
              <li
                className={`shrink-0 px-3 py-1.5 rounded-full text-sm border transition-all
                  ${
                    paramsWindow === project._id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-white text-gray-700 border-gray-200 hover:bg-indigo-50 hover:text-indigo-600"
                  }
                `}
              >
                {project.title}
              </li>
            </Link>
          ))}
        </ul>
      ) : (
        <ul className="space-y-1 overflow-y-auto max-h-[calc(100vh-150px)] px-2">
          {projects.length === 0 && (
            <div className="text-center text-gray-400 text-sm py-8 px-4">
              No projects yet  
              <span className="block text-xs mt-1">Click + to create one</span>
            </div>
          )}
          {projects.map((project) => (
            <Link key={project._id} to={project._id} onClick={handleLocation}>
              <li
                className={`px-4 py-2 rounded-lg text-sm cursor-pointer transition-all
                  ${
                    paramsWindow === project._id
                      ? "bg-indigo-100 text-indigo-600 font-medium"
                      : "text-gray-600 hover:bg-indigo-50 hover:text-indigo-600"
                  }
                `}
              >
                {project.title}
              </li>
            </Link>
          ))}
        </ul>
      )}
    </div>
  );
};
