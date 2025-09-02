import { FunctionalComponent } from "vue";

interface TableField {
  prop: string;
  label: string;
}

export const useLogTable = () => {
  const normalLogTableFields: TableField[] = [
    {
      prop: "device",
      label: "设备编号",
    },
    {
      prop: "data1",
      label: "数值1",
    },
    {
      prop: "data2",
      label: "数值2",
    },
    {
      prop: "data3",
      label: "数值3",
    },
  ];

  const errorLogTableFields: TableField[] = [
    {
      prop: "name",
      label: "设备名称",
    },
    {
      prop: "type",
      label: "设备类型",
    },
  ];

  const LogTable: FunctionalComponent<{
    data: any[];
    tableFields: TableField[];
  }> = ({ data, tableFields }) => (
    <el-table
      data={data}
      class="h-72"
      stripe={true}
      border={true}
      table-layout="auto"
    >
      {tableFields.map((item) => (
        <el-table-column
          key={item.prop}
          label={item.label}
          prop={item.prop}
        ></el-table-column>
      ))}
    </el-table>
  );
  return {
    LogTable,
    normalLogTableFields,
    errorLogTableFields,
  };
};
