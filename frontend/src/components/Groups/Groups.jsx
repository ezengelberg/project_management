import React, { useEffect, useState, useContext } from "react";
import "./Groups.scss";
import { toJewishDate, formatJewishDateInHebrew } from "jewish-date";
import { Button, Form, Input, Select, message, Transfer, Divider, Tag, Table } from "antd";

// ------------------------------------------------
const TableTransfer = (props) => {
  const { leftColumns, rightColumns, ...restProps } = props;
  return (
    <Transfer
      style={{
        width: "100%",
      }}
      {...restProps}>
      {({
        direction,
        filteredItems,
        onItemSelect,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled,
      }) => {
        const columns = direction === "left" ? leftColumns : rightColumns;
        const rowSelection = {
          getCheckboxProps: () => ({
            disabled: listDisabled,
          }),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, "replace");
          },
          selectedRowKeys: listSelectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
        };
        return (
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size="small"
            style={{
              pointerEvents: listDisabled ? "none" : undefined,
            }}
            onRow={({ key, disabled: itemDisabled }) => ({
              onClick: () => {
                if (itemDisabled || listDisabled) {
                  return;
                }
                onItemSelect(key, !listSelectedKeys.includes(key));
              },
            })}
          />
        );
      }}
    </Transfer>
  );
};
const mockTags = ["cat", "dog", "bird"];
const mockData = Array.from({
  length: 20,
}).map((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
  tag: mockTags[i % 3],
}));
const columns = [
  {
    dataIndex: "title",
    title: "Name",
  },
  {
    dataIndex: "tag",
    title: "Tag",
    render: (tag) => (
      <Tag
        style={{
          marginInlineEnd: 0,
        }}
        color="cyan">
        {tag.toUpperCase()}
      </Tag>
    ),
  },
  {
    dataIndex: "description",
    title: "Description",
  },
];
const filterOption = (input, item) => item.title?.includes(input) || item.tag?.includes(input);
//   ------------------------------------------------

const Groups = () => {
  // ------------------------------------------------
  const [targetKeys, setTargetKeys] = useState([]);
  const [disabled, setDisabled] = useState(false);
  const onChange = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };
  const toggleDisabled = (checked) => {
    setDisabled(checked);
  };
  // ------------------------------------------------

  const currentYear = new Date().getFullYear();
  const currentHebrewYear = formatJewishDateInHebrew(toJewishDate(new Date(currentYear, 10, 10)))
    .split(" ")
    .pop()
    .replace(/^ה/, "");
  const [form] = Form.useForm();
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleOnFinish = (values) => {
    console.log(values);
    message.success("Group created successfully");
  };

  return (
    <div className="groups-container">
      <Form className="groups-form" form={form} layout="vertical" onFinish={handleOnFinish}>
        <Form.Item label="שם קבוצה" name="name" rules={[{ required: true, message: "שדה חובה" }]}>
          <Input />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            צור קבוצה
          </Button>
        </Form.Item>
      </Form>
      <Divider />
      <TableTransfer
        dataSource={mockData}
        targetKeys={targetKeys}
        disabled={disabled}
        showSearch
        showSelectAll={false}
        onChange={onChange}
        filterOption={filterOption}
        leftColumns={columns}
        rightColumns={columns}
      />
    </div>
  );
};

export default Groups;
