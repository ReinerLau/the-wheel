import { Component, Ref, ref } from "vue";

type TableArea = Component<{
  onCurrentChange?: (row: any) => void;
  tableData: Record<string, any>[];
  tableFields: Field[];
}>;

type ExpandTable = Component<{
  expandTableFields: Field[];
  tableData: Record<string, any>[];
  tableFields: Field[];
}>;

export interface Field {
  prop?: string;
  title: string;
  slot?: (row: any) => JSX.Element;
}

interface TableRowData {
  row: Record<string, unknown>;
}

export const useTableArea = () => {
  const loading: Ref<boolean> = ref(false);
  const TableArea: TableArea = ({ tableData, tableFields }, { emit }) => (
    <el-table
      v-loading={loading.value}
      data={tableData}
      stripe={true}
      border={true}
      table-layout="auto"
      highlight-current-row
      onCurrentChange={(row: Record<string, unknown>) =>
        emit("currentChange", row)
      }
    >
      {tableFields.map(
        (item: Field): JSX.Element => (
          <el-table-column
            prop={item.prop}
            label={item.title}
            header-align="center"
            align="center"
          >
            {{
              default: ({ row }: TableRowData) => item.slot && item.slot(row),
            }}
          </el-table-column>
        )
      )}
    </el-table>
  );

  const ExpandTable: ExpandTable = ({
    expandTableFields,
    tableData,
    tableFields,
  }) => (
    <el-table
      v-loading={loading.value}
      data={tableData}
      border={true}
      table-layout="auto"
      default-expand-all
      row-style={{ backgroundColor: "#ecf5fe" }}
    >
      <el-table-column type="expand">
        {{
          default: ({ row }: TableRowData) => (
            <el-table
              v-loading={loading.value}
              data={row.children}
              stripe={true}
              border={true}
              table-layout="auto"
            >
              {expandTableFields.map((item: Field): JSX.Element => {
                return (
                  <el-table-column
                    prop={item.prop}
                    label={item.title}
                    header-align="center"
                    align="center"
                  >
                    {{
                      default: ({ row }: TableRowData): JSX.Element =>
                        item.slot?.(row),
                    }}
                  </el-table-column>
                );
              })}
            </el-table>
          ),
        }}
      </el-table-column>
      {tableFields.map(
        (item: Field): JSX.Element => (
          <el-table-column
            prop={item.prop}
            label={item.title}
            header-align="center"
            align="center"
          >
            {{
              default: ({ row }: TableRowData): JSX.Element => item.slot?.(row),
            }}
          </el-table-column>
        )
      )}
    </el-table>
  );

  return {
    TableArea,
    ExpandTable,
    loading,
  };
};
