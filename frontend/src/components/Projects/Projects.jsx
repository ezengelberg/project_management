import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Projects.scss";
import { Tooltip } from "antd";
import ProjectBox from "./ProjectBox";

const Projects = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const grabProjects = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/project/available-projects", {
          withCredentials: true
        });

        // Attach isFavorite to each project
        const projectsWithFavorites = await Promise.all(
          response.data.map(async (project) => {
            const responsePerProject = await axios.get(
              `http://localhost:5000/api/user/ensure-favorite/${project._id}`,
              {
                withCredentials: true
              }
            );
            return {
              ...project,
              isFavorite: responsePerProject.data.favorite
            };
          })
        );

        setProjects(sortProjects(projectsWithFavorites)); // Set sorted projects
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    grabProjects();
  }, []);

  const toggleFavorite = async (projectId) => {
    try {
      await axios.post(
        "http://localhost:5000/api/user/toggle-favorite",
        {
          projectId: projectId
        },
        { withCredentials: true }
      );

      // Update project state
      const updatedProjects = projects.map((project) => {
        if (project._id === projectId) {
          return { ...project, isFavorite: !project.isFavorite }; // Toggle the isFavorite status
        }
        return project; // Return the project unchanged
      });

      setProjects(sortProjects(updatedProjects)); // Update state with sorted projects
    } catch (error) {
      console.error("Error occurred:", error);
    }
  };

  const sortProjects = (projectList) => {
    projectList.sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      return 0;
    });
    return projectList;
  };

  return (
    <div className="projects">
      <h2>רשימת פרוייקטים</h2>
      <div className="list-projects">
        {projects.length > 0 ? (
          projects.map((project) => (
            <ProjectBox
              key={project._id} // Assuming each project has a unique _id field
              {...project}
              markFavorite={() => {
                toggleFavorite(project._id);
              }}
            />
          ))
        ) : (
          <p>אין פרוייקטים זמינים כרגע</p>
        )}
      </div>
    </div>
  );
};

export default Projects;
