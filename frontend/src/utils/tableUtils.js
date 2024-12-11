import React from "react";
import { Input, Button, Space } from "antd";
import { SearchOutlined } from "@ant-design/icons";

export const getColumnSearchProps = (dataIndex, searchInput, handleSearch, handleReset, searchText) => ({
  filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
    <div style={{ padding: 8 }} onKeyDown={(e) => e.stopPropagation()}>
      <Input
        ref={searchInput}
        value={selectedKeys[0]}
        onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
        onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
        style={{ marginBottom: 8, display: "block" }}
      />
      <Space>
        <Button
          type="primary"
          onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
          icon={<SearchOutlined />}
          size="small"
          style={{ width: 90 }}>
          חיפוש
        </Button>
        <Button onClick={() => clearFilters && handleReset(clearFilters)} size="small" style={{ width: 90 }}>
          איפוס
        </Button>
        <Button
          type="link"
          size="small"
          onClick={() => {
            close();
          }}>
          סגור
        </Button>
      </Space>
    </div>
  ),
  filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#1677ff" : undefined }} />,
  filterDropdownProps: {
    onOpenChange: (visible) => {
      if (visible) {
        setTimeout(() => searchInput.current?.select(), 100);
      }
    },
  },
  onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
});
