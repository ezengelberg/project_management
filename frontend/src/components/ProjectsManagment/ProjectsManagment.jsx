import React from "react";
import "./ProjectsManagment.scss";
import { Tabs } from "antd";

const ProjectsManagment = () => {
  const OpenIcon = () => (
    <svg className="tab-icon-special" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <path
          d="M12.1999 11.8L10.7899 13.21C10.0099 13.99 10.0099 15.26 10.7899 16.04C11.5699 16.82 12.8399 16.82 13.6199 16.04L15.8399 13.82C17.3999 12.26 17.3999 9.72999 15.8399 8.15999C14.2799 6.59999 11.7499 6.59999 10.1799 8.15999L7.75988 10.58C6.41988 11.92 6.41988 14.09 7.75988 15.43"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"></path>
        <path
          d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
          stroke="#000000"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"></path>
      </g>
    </svg>
  );

  const TakenIcon = () => (
    <svg className="tab-icon" height="24" width="24" version="1.1" id="Capa_1" viewBox="0 0 363.868 363.868">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <g>
          <path
            fill="#000000"
            d="M92.723,274.945c-3.178,3.178-5.747,9.388-5.747,13.875v58.444h33.929v-92.373 c0-4.487-2.569-5.56-5.747-2.382L92.723,274.945z"></path>
          <path
            fill="#000000"
            d="M241.752,219.573c-3.17,3.178-5.747,9.389-5.747,13.884v113.816h33.929V199.487 c0-4.487-2.569-5.552-5.747-2.374L241.752,219.573z"></path>
          <path
            fill="#000000"
            d="M291.418,169.834c-3.178,3.17-5.755,9.38-5.755,13.867v163.563h31.547V152.212 c0-4.487-2.577-5.56-5.755-2.382L291.418,169.834z"></path>
          <path
            fill="#000000"
            d="M193.078,268.239c0,0-1.512,1.52-3.381,3.39c-1.861,1.87-3.373,7.031-3.373,11.518v64.118h33.929 v-98.047c0-4.487-2.577-5.56-5.755-2.382L193.078,268.239z"></path>
          <path
            fill="#000000"
            d="M142.405,250.998c-3.178-3.17-5.755-2.105-5.755,2.382v93.885h33.929v-60.03 c0-4.487-2.439-10.559-5.454-13.558l-5.454-5.43L142.405,250.998z"></path>
          <path
            fill="#000000"
            d="M50.023,317.669l-10.957,10.974c-3.17,3.178-5.739,8.633-5.739,12.193v6.438h37.871V304.59 c0-4.487-2.569-5.552-5.747-2.374L50.023,317.669z"></path>
          <path
            fill="#000000"
            d="M358.121,150.724c3.17,3.178,5.747,2.105,5.747-2.382V32.193c0-8.316-7.966-15.599-16.233-15.599 H232.16c-4.487,0-5.56,2.577-2.382,5.755l41.074,41.106l-16.753,16.68l-77.701,77.774L135.3,116.82 c-3.178-3.178-8.316-3.17-11.494,0L9.519,231.189C-3.178,243.894-3.17,264.484,9.527,277.18l0.797,0.805 c12.697,12.697,33.287,12.697,45.975-0.008l73.247-73.287l41.098,41.057c3.178,3.17,8.324,3.17,11.502,0l135.479-135.503 L358.121,150.724z"></path>
        </g>
      </g>
    </svg>
  );

  const FinishedIcon = () => (
    <svg className="tab-icon" viewBox="0 0 32 32" version="1.1" fill="#000000">
      <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
      <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
      <g id="SVGRepo_iconCarrier">
        <defs></defs>
        <g id="Page-1" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
          <g id="Icon-Set" transform="translate(-100.000000, -1139.000000)" fill="#000000">
            <path
              d="M122.027,1148.07 C121.548,1147.79 120.937,1147.96 120.661,1148.43 L114.266,1159.51 L110.688,1156.21 C110.31,1155.81 109.677,1155.79 109.274,1156.17 C108.871,1156.54 108.85,1157.18 109.228,1157.58 L113.8,1161.8 C114.177,1162.2 114.81,1162.22 115.213,1161.84 C115.335,1161.73 122.393,1149.43 122.393,1149.43 C122.669,1148.96 122.505,1148.34 122.027,1148.07 L122.027,1148.07 Z M116,1169 C108.268,1169 102,1162.73 102,1155 C102,1147.27 108.268,1141 116,1141 C123.732,1141 130,1147.27 130,1155 C130,1162.73 123.732,1169 116,1169 L116,1169 Z M116,1139 C107.164,1139 100,1146.16 100,1155 C100,1163.84 107.164,1171 116,1171 C124.836,1171 132,1163.84 132,1155 C132,1146.16 124.836,1139 116,1139 L116,1139 Z"
              id="checkmark-circle"></path>
          </g>
        </g>
      </g>
    </svg>
  );

  const icons = [OpenIcon, TakenIcon, FinishedIcon];
  const tabNames = ["פרויקטים פתוחים", "פרויקטים לקוחים", "פרויקטים שהושלמו"];

  return (
    <div>
      <Tabs
        defaultActiveKey="1"
        items={icons.map((Icon, i) => {
          const id = String(i + 1);
          return {
            key: id,
            label: `${tabNames[i]}`,
            children: `Tab ${id}`,
            icon: <Icon />,
          };
        })}
      />
    </div>
  );
};

export default ProjectsManagment;
