import { Component, Ref } from "vue";

type Pagination = Component<{
  total: number;
  params: Ref<Record<string, unknown>>;
  onChange: () => void;
}>;

export const usePagination = () => {
  const Pagination: Pagination = ({ total, params }, { emit }) => {
    function handleChange() {
      emit("change");
    }

    return (
      <div class="flex justify-end mt-2">
        <el-pagination
          layout="sizes, prev, pager, next"
          total={total}
          v-model:current-page={params.value.page}
          v-model:page-size={params.value.limit}
          page-sizes={[10, 20, 50, 100, 200, 500]}
          onSizeChange={handleChange}
          onCurrentChange={handleChange}
        />
      </div>
    );
  };
  return {
    Pagination,
  };
};
