import React, { useEffect, useState } from "react";
import "./Journal.scss";
import axios from "axios";
import { Tooltip, List, Skeleton, Modal, Tabs, Select, Badge, Form } from "antd";
import { useNavigate } from "react-router-dom";
import { handleMouseDown } from "../../utils/mouseDown";

const Journal = () => {
  const navigate = useNavigate();
  const [newMissionForm] = Form.useForm();
  const [submissionForm] = Form.useForm();
  const [submissionModalVisible, setSubmissionModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [missions, setMissions] = useState([]);
  const [projectDetails, setProjectDetails] = useState({});

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
              <div className="journal-header-filter">
                <Select placeholder="זמן" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="today">היום</Select.Option>
                  <Select.Option value="week">השבוע</Select.Option>
                  <Select.Option value="month">החודש</Select.Option>
                  <Select.Option value="year">השנה</Select.Option>
                </Select>
                <Select placeholder="יוצר" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">סטודנט 1</Select.Option>
                  <Select.Option value="year">סטודנט 2</Select.Option>
                </Select>
                <Select placeholder="תגית" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">תקלה</Select.Option>
                  <Select.Option value="year">פיתוח</Select.Option>
                </Select>
                <Select placeholder="משוייך ל..." style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">סטודנט 1</Select.Option>
                  <Select.Option value="year">סטודנט 2</Select.Option>
                </Select>
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
                    backgroundColor: "#52c41a",
                  }}
                />
                <p>משימות סגורות</p>
              </div>
              <div className="journal-header-filter">
                <Select placeholder="זמן" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="today">היום</Select.Option>
                  <Select.Option value="week">השבוע</Select.Option>
                  <Select.Option value="month">החודש</Select.Option>
                  <Select.Option value="year">השנה</Select.Option>
                </Select>
                <Select placeholder="יוצר" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">סטודנט 1</Select.Option>
                  <Select.Option value="year">סטודנט 2</Select.Option>
                </Select>
                <Select placeholder="תגית" style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">תקלה</Select.Option>
                  <Select.Option value="year">פיתוח</Select.Option>
                </Select>
                <Select placeholder="משוייך ל..." style={{ width: 120 }} onChange={(value) => console.log(value)}>
                  <Select.Option value="month">סטודנט 1</Select.Option>
                  <Select.Option value="year">סטודנט 2</Select.Option>
                </Select>
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
      key: "3",
      label: "פתיחת משימה חדשה",
      children: <p></p>,
    },
  ];

  return (
    <div className="journal">
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
};

export default Journal;
