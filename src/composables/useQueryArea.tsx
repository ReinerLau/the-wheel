import { Component, Ref, ref } from "vue";

export interface QueryField {
  prop?: string;
  title: string;
  slot?: (params) => JSX.Element;
}

type QueryArea = Component<{
  queryFields: QueryField[];
  onQuery: () => Promise<void>;
  onReset: () => void;
}>;

export const useQueryArea = () => {
  const params: Ref<Record<string, unknown>> = ref({});
  const QueryArea: QueryArea = ({ queryFields }, { emit }) => {
    function handleQuery(): void {
      emit("query");
    }
    function handleReset(): void {
      emit("reset");
    }
    return (
      <el-row gutter={12} class="mb-2">
        {queryFields.map((item) => (
          <el-col span={6} class="mb-2">
            {item.slot ? (
              item.slot(params)
            ) : (
              <el-input
                v-model={params.value[item.prop]}
                placeholder={item.title}
              />
            )}
          </el-col>
        ))}
        <el-col span={6}>
          <el-button type="primary" onClick={handleQuery}>
            查询
          </el-button>
          <el-button type="info" onClick={handleReset}>
            重置
          </el-button>
        </el-col>
      </el-row>
    );
  };
  return {
    QueryArea,
    params,
  };
};
