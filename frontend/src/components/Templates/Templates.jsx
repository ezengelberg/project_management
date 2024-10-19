import React, { useState } from "react";
import "./Templates.scss";
import {
  InboxOutlined,
  DownloadOutlined,
  LeftOutlined,
  RightOutlined,
  RotateLeftOutlined,
  RotateRightOutlined,
  SwapOutlined,
  UndoOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { message, Upload, Image, Space } from "antd";

const imageList = [
  "https://images.unsplash.com/photo-1729097588858-276b55642ef1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://plus.unsplash.com/premium_photo-1729096976954-6e203d9439b5?q=80&w=2702&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

const Templates = () => {
  const { Dragger } = Upload;
  const [current, setCurrent] = useState(0);
  const props = {
    name: "file",
    multiple: true,
    action: "צריך להיות פה קישור לשרת",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  const onDownload = () => {
    const url = imageList[current];
    const suffix = url.slice(url.lastIndexOf("."));
    const filename = Date.now() + suffix;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(new Blob([blob]));
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        URL.revokeObjectURL(blobUrl);
        link.remove();
      });
  };

  return (
    <div>
      <div className="upload-container">
        <Dragger {...props}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">לחצו או גררו קבצים לאיזור זה כדי להעלות</p>
          <p className="ant-upload-hint">תומך בהעלאת קבצים במקביל</p>
        </Dragger>
      </div>

      <Image.PreviewGroup
        preview={{
          toolbarRender: (
            _,
            {
              transform: { scale },
              actions: { onActive, onFlipY, onFlipX, onRotateLeft, onRotateRight, onZoomOut, onZoomIn, onReset },
            }
          ) => (
            <Space size={12} className="toolbar-wrapper">
              <LeftOutlined onClick={() => onActive?.(-1)} />
              <RightOutlined onClick={() => onActive?.(1)} />
              <DownloadOutlined onClick={onDownload} />
              <SwapOutlined rotate={90} onClick={onFlipY} />
              <SwapOutlined onClick={onFlipX} />
              <RotateLeftOutlined onClick={onRotateLeft} />
              <RotateRightOutlined onClick={onRotateRight} />
              <ZoomOutOutlined disabled={scale === 1} onClick={onZoomOut} />
              <ZoomInOutlined disabled={scale === 50} onClick={onZoomIn} />
              <UndoOutlined onClick={onReset} />
            </Space>
          ),
          onChange: (index) => {
            setCurrent(index);
          },
        }}>
        <div className="images-container">
          {imageList.map((item) => (
            <Image key={item} src={item} width={200} />
          ))}
        </div>
      </Image.PreviewGroup>
    </div>
  );
};

export default Templates;
