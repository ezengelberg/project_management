import React, { useState } from "react";
import "./SystemControl.scss";
import { Button, Switch } from "antd";
import { Tooltip } from "antd";
import { CloseCircleOutlined } from "@ant-design/icons";

const SystemControl = () => {
  const [createProject, setCreateProject] = useState(true);
  const [registerToProjects, setRegisterToProjects] = useState(true);
  const [manageStudents, setManageStudents] = useState(true);
  return (
    <div className="system">
      <h1 className="system-title">לוח בקרת מערכת</h1>
      <div className="control-options">
        <div className="box switches">
          <h3 className="box-title">סוויטצ'ים להדלקה \ כיבוי מהירים</h3>
          <div className="switch">
            <label className="switch-label">הזנת פרוייקטים חדשים</label>
            <Switch checked={createProject} />
          </div>
          <Tooltip title="רישום של הסטודנטים עצמם לפרוייקט">
            <div className="switch">
              <label className="switch-label">רישום לפרוייקטים</label>
              <Switch checked={registerToProjects} />
            </div>
          </Tooltip>
          <Tooltip title="אישור, דחיה והסרה של סטודנטים מפרויקט">
            <div className="switch">
              <label className="switch-label">ניהול סטודנטים בפרוייקט</label>
              <Switch checked={manageStudents} />
            </div>
          </Tooltip>
          <div className="switch">
            <label className="switch-label">pending action</label>
            <Switch />
          </div>
        </div>
        <div className="box finish-projects">
          <h3 className="box-title">סיים פרוייקטים</h3>
          <Tooltip title="סיים את כל הפרוייקטים">
            <Button shape="circle" type="primary" icon={<CloseCircleOutlined />}></Button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default SystemControl;
