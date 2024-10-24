import React, { useEffect, useState } from "react";
import { Badge, Table } from "antd";
import axios from "axios";

const ManageProjects = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/project/get-self-projects/`, {
          withCredentials: true
        });

        // Assuming `project.candidates` contains the array of student objects
        console.log(response.data.projects);
        const projectData = response.data.projects.map((project) => ({
          key: project._id, // Assuming there's an `_id` field
          title: project.title,
          isApproved: project.isApproved ? (
            <Badge status="success" text="מאושר" />
          ) : (
            <Badge status="error" text="לא מאושר" />
          ),
          candidates: project.candidates // candidates should be an array of student objects
        }));

        setProjects(projectData);
      } catch (error) {
        console.error("Error occurred:", error);
      }
    };
    fetchData();
  }, []);

//   useEffect(() => {
//     console.log("candidates for each project");
//     projects.forEach(
//       async (project) => {
//         project.candidates = await Promise.all(
//           project.candidates.map(async (candidate) => {
//             const response = await axios.get(`http://localhost:5000/api/user/get-user-info/${candidate.student}`, {
//               withCredentials: true
//             });
//             console.log(response.data);
//             // return {
//             //   ...candidate,
//             //   student: response.data.name
//             // };
//           })
//         );
//       },
//       [projects]
//     );
//   });
  const columns = [
    {
      title: "שם הפרוייקט",
      dataIndex: "title",
      key: "title"
    },
    {
      title: "סטטוס אישור",
      dataIndex: "isApproved",
      key: "isApproved"
    },
    {
      title: "מספר רשומים",
      dataIndex: "candidates",
      key: "candidates",
      render: (candidates) => candidates.length // Display the number of candidates
    }
  ];

  const expandedRender = (record) => {
    // const expandColumns = [
    //   {
    //     name: "שם הסטודנט",
    //     key: "name",
    //     dataIndex: "student"
    //   }
    // ];
    // return <Table columns={expandColumns} dataSource={record.candidates} pagination={false} />;
  };

  return (
    <div>
      <Table columns={columns} dataSource={projects} expandable={{ expandedRowRender: expandedRender }} />
    </div>
  );
};

export default ManageProjects;
