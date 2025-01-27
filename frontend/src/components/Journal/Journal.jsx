import React, { useEffect, useState } from "react";
import "./Journal.scss";
import axios from "axios";
import { Tooltip, List, Skeleton, Modal, Tabs, Select, Badge } from "antd";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";

const Journal = () => {
  const [loading, setLoading] = useState(false);

  const items = [
    {
      key: "1",
      label: "משימות פתוחות",
      children: (
        <List
          loading={loading}
          pagination={{
            pageSize: 10,
          }}
          header={
            <div className="journal-header">
              <div className="journal-header-counter">
                <Badge
                  count={99}
                  overflowCount={999}
                  style={{
                    backgroundColor: "#faad14",
                  }}
                />
                <p>משימות פתוחות</p>
              </div>
            </div>
          }>
          <List.Item>
            <div className="journal-item">
              <div className="journal-item__title">תקלה במערכת הגילוי</div>
              <div className="journal-item__date">12.12.2021</div>
            </div>
          </List.Item>
          <List.Item>
            <div className="journal-item">
              <div className="journal-item__title">תקלה במערכת הגילוי</div>
              <div className="journal-item__date">12.12.2021</div>
            </div>
          </List.Item>
          <List.Item>
            <div className="journal-item">
              <div className="journal-item__title">תקלה במערכת הגילוי</div>
              <div className="journal-item__date">12.12.2021</div>
            </div>
          </List.Item>
          <List.Item>
            <div className="journal-item">
              <div className="journal-item__title">תקלה במערכת הגילוי</div>
              <div className="journal-item__date">12.12.2021</div>
            </div>
          </List.Item>
        </List>
      ),
    },
    {
      key: "2",
      label: "משימות סגורות",
      children: (
        <div className="journal-item">
          <div className="journal-item__title">תקלה במערכת הגילוי</div>
          <div className="journal-item__date">12.12.2021</div>
        </div>
      ),
    },
  ];

  return (
    <div className="journal">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Journal;
