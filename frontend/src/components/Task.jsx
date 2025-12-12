import React, { useEffect, useState } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
} from "@hello-pangea/dnd";
import { v4 as uuid } from "uuid";
import AddTaskModal from "./AddTaskModal";
import BtnPrimary from "./BtnPrimary";
import DropdownMenu from "./DropdownMenu";
import { useParams, useNavigate } from "react-router";
import ProjectDropdown from "./ProjectDropdown";
import axios from "axios";
import toast from "react-hot-toast";
import TaskModal from "./TaskModal";

function Task() {
  const [isAddTaskModalOpen, setAddTaskModal] = useState(false);
  const [columns, setColumns] = useState({});
  const [isRenderChange, setRenderChange] = useState(false);
  const [isTaskOpen, setTaskOpen] = useState(false);
  const [taskId, setTaskId] = useState(false);
  const [title, setTitle] = useState("");
  const { projectId } = useParams();
  const navigate = useNavigate();

  const onDragEnd = (result, columns, setColumns) => {
    if (!result.destination) return;

    const { source, destination } = result;
    let data = {};

    if (source.droppableId !== destination.droppableId) {
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];

      const newSourceItems = [...sourceColumn.items];
      const newDestItems = [...destColumn.items];

      const [removed] = newSourceItems.splice(source.index, 1);
      newDestItems.splice(destination.index, 0, removed);

      const updated = {
        ...columns,
        [source.droppableId]: { ...sourceColumn, items: newSourceItems },
        [destination.droppableId]: { ...destColumn, items: newDestItems },
      };

      setColumns(updated);
      data = updated;
    } else {
      const column = columns[source.droppableId];
      const copiedItems = [...column.items];

      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      const updated = {
        ...columns,
        [source.droppableId]: { ...column, items: copiedItems },
      };

      setColumns(updated);
      data = updated;
    }

    updateTodo(data);
  };

  useEffect(() => {
    if (!isAddTaskModalOpen || isRenderChange) {
      axios
        .get(`http://localhost:9000/project/${projectId}`)
        .then((res) => {
          setTitle(res.data[0].title);

          const tasks = res.data[0].task;

          setColumns({
            [uuid()]: {
              name: "Requested",
              items: tasks.filter((t) => t.stage === "Requested").sort((a, b) => a.order - b.order),
            },
            [uuid()]: {
              name: "To do",
              items: tasks.filter((t) => t.stage === "To do").sort((a, b) => a.order - b.order),
            },
            [uuid()]: {
              name: "In Progress",
              items: tasks.filter((t) => t.stage === "In Progress").sort((a, b) => a.order - b.order),
            },
            [uuid()]: {
              name: "Done",
              items: tasks.filter((t) => t.stage === "Done").sort((a, b) => a.order - b.order),
            },
          });

          setRenderChange(false);
        })
        .catch(() => toast.error("Something went wrong"));
    }
  }, [projectId, isAddTaskModalOpen, isRenderChange]);

  const updateTodo = (data) => {
    axios
      .put(`http://localhost:9000/project/${projectId}/todo`, data)
      .catch(() => toast.error("Something went wrong"));
  };

  const handleDelete = (e, taskId) => {
    e.stopPropagation();
    axios
      .delete(`http://localhost:9000/project/${projectId}/task/${taskId}`)
      .then(() => {
        toast.success("Task deleted");
        setRenderChange(true);
      })
      .catch(() => toast.error("Something went wrong"));
  };

  const handleTaskDetails = (id) => {
    setTaskId({ projectId, id });
    setTaskOpen(true);
  };

  return (
    <div className="px-4 sm:px-8 py-6 w-full">
      {/* Header */}
      <div className="flex flex-wrap gap-4 items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-800">
            {title.slice(0, 26)}
            {title.length > 26 && "..."}
          </h1>
          <ProjectDropdown id={projectId} navigate={navigate} />
        </div>

        <BtnPrimary onClick={() => setAddTaskModal(true)}>Add Task</BtnPrimary>
      </div>

      {/* Responsive Board */}
      <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
        <div
          className="
            flex gap-4 sm:gap-6 
            overflow-x-auto pb-4 
            snap-x snap-mandatory 
            md:flex-nowrap flex-wrap
          "
        >
          {Object.entries(columns).map(([columnId, column]) => (
            <div
              key={columnId}
              className="
                snap-start
                min-w-[260px] sm:min-w-[300px] md:min-w-0
                md:w-1/4 
                bg-gray-50 border border-gray-200 rounded-xl shadow-sm
                p-4 flex flex-col
              "
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-gray-700 font-semibold uppercase text-xs tracking-wide">
                    {column.name}
                  </h2>

                  {column.items.length > 0 && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-600 font-medium">
                      {column.items.length}
                    </span>
                  )}
                </div>
              </div>

              {/* Tasks Droppable */}
              <Droppable droppableId={columnId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 rounded-lg p-1 transition-colors duration-150 ${
                      snapshot.isDraggingOver
                        ? "bg-indigo-100/60 border border-indigo-300"
                        : "bg-transparent"
                    }`}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => handleTaskDetails(item._id)}
                            className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md px-4 py-3 mb-3 cursor-pointer transition-all ${
                              snapshot.isDragging ? "shadow-lg scale-[1.02]" : ""
                            }`}
                            style={provided.draggableProps.style}
                          >
                            <div className="flex justify-between items-start mb-1">
                              <h3 className="text-gray-800 font-medium text-sm">
                                {item.title.slice(0, 22)}
                                {item.title.length > 22 && "..."}
                              </h3>

                              <DropdownMenu
                                taskId={item._id}
                                handleDelete={handleDelete}
                                projectId={projectId}
                                setRenderChange={setRenderChange}
                              />
                            </div>

                            <p className="text-xs text-gray-500 leading-4 mb-2">
                              {item.description.slice(0, 70)}
                              {item.description.length > 70 && "..."}
                            </p>

                            <span className="px-2 py-1 text-xs bg-indigo-50 text-indigo-600 rounded-md font-medium">
                              Task-{item.index}
                            </span>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* Modals */}
      <AddTaskModal
        isAddTaskModalOpen={isAddTaskModalOpen}
        setAddTaskModal={setAddTaskModal}
        projectId={projectId}
      />

      <TaskModal isOpen={isTaskOpen} setIsOpen={setTaskOpen} id={taskId} />
    </div>
  );
}

export default Task;
