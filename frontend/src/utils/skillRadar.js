import Chart from "chart.js/auto";

let userSkillRadarChart = null;

export const renderSkillRadarChart = (ctx, dataValues) => {
  if (userSkillRadarChart) {
    userSkillRadarChart.destroy();
  }

  const data = {
    labels: ["פרויקט שלי", "פרויקטים אחרים", "נחמדות", "עזרה", "שאלות"],
    datasets: [
      {
        label: "תכונות",
        data: dataValues,
        borderColor: "rgba(22, 119, 255, 1)",
        backgroundColor: "rgba(64, 150, 255, 0.2)",
      },
    ],
  };

  userSkillRadarChart = new Chart(ctx, {
    type: "radar",
    data: data,
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: "פיצול אישיות",
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
        r: {
          pointLabels: {
            font: {
              size: 16,
            },
          },
        },
      },
    },
  });

  return userSkillRadarChart;
};
