import React, { useEffect, useRef } from "react";
import { Table, Descriptions } from "antd";
import Chart from "chart.js/auto";

const GradeDistributionChart = ({ data, additionalData }) => {
  const chartRef = useRef(null);
  const gradeRanges = ["0-54", "55-64", "65-69", "70-74", "75-79", "80-84", "85-89", "90-94", "95-100"];

  useEffect(() => {
    const chartInstance = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels: gradeRanges,
        datasets: [
          {
            data: data.map((item) => item.percentage),
            backgroundColor: "#e6f4ff",
            borderColor: "#91caff",
            borderWidth: 1,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grace: "5%",
          },
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (context) {
                const index = context.dataIndex;
                const percentage = data[index].percentage;
                const count = data[index].count;
                return [`אחוז פרויקטים: ${percentage}%`, `מספר פרויקטים: ${count}`];
              },
            },
          },
        },
      },
    });

    return () => {
      chartInstance.destroy();
    };
  }, [data]);

  const columns = [
    {
      title: "טווח ציונים",
      dataIndex: "range",
      key: "range",
      width: 200,
    },
    {
      title: "אחוז פרויקטים",
      dataIndex: "percentage",
      key: "percentage",
      width: 200,
      render: (text) => `${text}%`,
    },
    {
      title: "מספר פרויקטים",
      dataIndex: "count",
      key: "count",
      width: 200,
    },
  ];

  return (
    <div>
      <Descriptions style={{ marginBottom: "20px" }} bordered>
        <Descriptions.Item label="ממוצע ציונים בהגשה">{additionalData.average}</Descriptions.Item>
        <Descriptions.Item span={{ md: 2 }} label="שם ההגשה">
          {additionalData.submissionName}
        </Descriptions.Item>
        <Descriptions.Item label="הציון שלך בהגשה">{additionalData.userGrade}</Descriptions.Item>
        <Descriptions.Item span={{ md: 2 }} label="שנה">
          {additionalData.projectYear}
        </Descriptions.Item>
        <Descriptions.Item label="חציון">{additionalData.median}</Descriptions.Item>
        <Descriptions.Item span={{ md: 2 }} label="מיקומך">
          {additionalData.userRank}
        </Descriptions.Item>
        <Descriptions.Item label="הציון הנמוך ביותר">{additionalData.lowest}</Descriptions.Item>
        <Descriptions.Item span={{ md: 2 }} label="הציון הגבוה ביותר">
          {additionalData.highest}
        </Descriptions.Item>
        <Descriptions.Item label="אחוז נכשלים">{additionalData.failPercentage}%</Descriptions.Item>
      </Descriptions>
      <div className="grade-distribution-chart">
        <div style={{ flex: 1 }}>
          <Table
            columns={columns}
            dataSource={data.map((item, index) => ({
              key: index,
              range: gradeRanges[index],
              percentage: item.percentage,
              count: item.count,
            }))}
            pagination={false}
            bordered
          />
        </div>
        <div className="bar-grade-chart" style={{ flex: 2 }}>
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

export default GradeDistributionChart;
