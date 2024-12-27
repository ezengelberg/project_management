import Chart from "chart.js/auto";
import axios from "axios";

let userProjectStatisticsChart = null;

export const fetchUserProjectStatistics = async (userId) => {
  try {
    const response = await axios.get(
      `${process.env.REACT_APP_BACKEND_URL}/api/user/get-user-project-statistics/${userId}`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user project statistics:", error);
    return null;
  }
};

export const renderUserProjectStatisticsChart = (ctx, statistics) => {
  if (userProjectStatisticsChart) {
    userProjectStatisticsChart.destroy();
  }

  const labels = statistics.map((stat) => stat.year);
  const projectsData = statistics.map((stat) => stat.projects);
  const takenProjectsData = statistics.map((stat) => stat.takenProjects);

  userProjectStatisticsChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "כל הפרויקטים",
          data: projectsData,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
        },
        {
          label: "פרויקטים שנלקחו",
          data: takenProjectsData,
          backgroundColor: "rgba(153, 102, 255, 0.2)",
          borderColor: "rgba(153, 102, 255, 1)",
          borderWidth: 1,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "סטטיסטיקת פרויקטים",
          font: {
            size: 20,
          },
        },
        legend: {
          labels: {
            font: {
              size: 16,
            },
          },
        },
      },
      scales: {
        x: {
          grace: "5%",
          ticks: {
            font: {
              size: 14,
            },
          },
        },
        y: {
          ticks: {
            font: {
              size: 14,
            },
          },
        },
      },
    },
  });

  return userProjectStatisticsChart;
};
