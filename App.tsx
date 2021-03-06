import React, { useState } from "react";
import type { ProColumns } from "@ant-design/pro-table";
import { EditableProTable } from "@ant-design/pro-table";
import { ProFormRadio, ProFormField } from "@ant-design/pro-form";
import ProCard from "@ant-design/pro-card";
import {
  SortableContainer,
  SortableElement,
  SortableHandle
} from "react-sortable-hoc";
import { MenuOutlined } from "@ant-design/icons";
import { arrayMoveImmutable } from "@ant-design/pro-utils";
import "./drag.css";
const DragHandle = SortableHandle(() => (
  <MenuOutlined style={{ cursor: "grab", color: "#999" }} />
));

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  created_at?: string;
  update_at?: string;
  children?: DataSourceType[];
  index: number;
};

const defaultData: DataSourceType[] = [
  {
    id: 624748504,
    title: "活动名称一",
    decs: "这个活动真好玩",
    state: "open",
    created_at: "2020-05-26T09:42:56Z",
    update_at: "2020-05-26T09:42:56Z",
    index: 0
  },
  {
    id: 624691229,
    title: "活动名称二",
    decs: "这个活动真好玩",
    state: "closed",
    created_at: "2020-05-26T08:19:22Z",
    update_at: "2020-05-26T08:19:22Z",
    index: 1
  },
  {
    id: 624691229,
    title: "活动名称三",
    decs: "这个活动真好玩",
    state: "closed",
    created_at: "2020-05-26T08:19:22Z",
    update_at: "2020-05-26T08:19:22Z",
    index: 2
  }
];

export default () => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>([]);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [position, setPosition] = useState<"top" | "bottom" | "hidden">(
    "bottom"
  );

  const columns: ProColumns<DataSourceType>[] = [
    {
      title: "Sort",
      dataIndex: "sort",
      width: 60,
      className: "drag-visible",
      render: () => <DragHandle />,
      editable: false
    },
    {
      title: "活动名称",
      dataIndex: "title",
      formItemProps: (form, { rowIndex }) => {
        return {
          rules:
            rowIndex > 2 ? [{ required: true, message: "此项为必填项" }] : []
        };
      },
      // 第二行不允许编辑
      editable: (text, record, index) => {
        return index !== 0;
      },
      width: "30%"
    },
    {
      title: "状态",
      key: "state",
      dataIndex: "state",
      valueType: "select",
      valueEnum: {
        all: { text: "全部", status: "Default" },
        open: {
          text: "未解决",
          status: "Error"
        },
        closed: {
          text: "已解决",
          status: "Success"
        }
      }
    },
    {
      title: "描述",
      dataIndex: "decs",
      fieldProps: (from, { rowKey, rowIndex }) => {
        if (from.getFieldValue([rowKey || "", "title"]) === "不好玩") {
          return {
            disabled: true
          };
        }
        if (rowIndex > 9) {
          return {
            disabled: true
          };
        }
        return {};
      }
    },
    {
      title: "活动时间",
      dataIndex: "created_at",
      valueType: "date"
    },
    {
      title: "操作",
      valueType: "option",
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            setDataSource(dataSource.filter((item) => item.id !== record.id));
          }}
        >
          删除
        </a>
      ]
    }
  ];
  const SortableItem = SortableElement((props: any) => <tr {...props} />);
  const SortContainer = SortableContainer((props: any) => <tbody {...props} />);

  const onSortEnd = ({
    oldIndex,
    newIndex
  }: {
    oldIndex: number;
    newIndex: number;
  }) => {
    if (oldIndex !== newIndex) {
      const newData = arrayMoveImmutable(
        [...dataSource],
        oldIndex,
        newIndex
      ).filter((el) => !!el);
      setDataSource([...newData]);
    }
  };

  const DraggableContainer = (props: any) => (
    <SortContainer
      useDragHandle
      disableAutoscroll
      helperClass="row-dragging"
      onSortEnd={onSortEnd}
      {...props}
    />
  );

  const DraggableBodyRow = (props: any) => {
    const { className, style, ...restProps } = props;
    // function findIndex base on Table rowKey props and should always be a right array index
    const index = dataSource.findIndex(
      (x) => x.index === restProps["data-row-key"]
    );
    return <SortableItem index={index} {...restProps} />;
  };

  return (
    <>
      <EditableProTable<DataSourceType>
        rowKey="id"
        headerTitle="可编辑表格"
        maxLength={5}
        recordCreatorProps={
          position !== "hidden"
            ? {
                position: position as "top",
                record: () => ({ id: (Math.random() * 1000000).toFixed(0) })
              }
            : false
        }
        columns={columns}
        request={async () => ({
          data: defaultData,
          total: 3,
          success: true
        })}
        value={dataSource}
        onChange={setDataSource}
        editable={{
          type: "multiple",
          editableKeys,
          onSave: async (rowKey, data, row) => {
            console.log(rowKey, data, row);
            await waitTime(2000);
          },
          onChange: setEditableRowKeys
        }}
        components={{
          body: {
            wrapper: DraggableContainer,
            row: DraggableBodyRow
          }
        }}
      />
    </>
  );
};
