// 拖拽相关
export const useSortableList = () => {
  // 设备和机柜通用组件
  const SortableList = (
    {
      title = "",
      type = "primary",
      dataLength = 0,
      modelValue = "",
      searchable = false,
    }: {
      title?: string;
      type?: "primary" | "info";
      dataLength?: number;
      modelValue?: string;
      searchable?: boolean;
    },
    { slots, emit }
  ) => (
    <el-card body-style={{ padding: "0px" }} class="p-2 select-none">
      <div class="flex justify-between items-center">
        <div class="flex mb-2 items-center font-mono ">
          <div
            class={[
              "rounded-full",
              "text-white",
              "py-2",
              "px-3",
              "mr-2",
              { "bg-[#409EFF]": type === "primary" },
              { "bg-[#909399]": type === "info" },
            ]}
          >
            {title}
          </div>
          <span
            class={[
              {
                "text-[#409EFF]": type === "primary",
                "text-[#909399]": type === "info",
              },
            ]}
          >
            {dataLength}
          </span>
        </div>
        {searchable ? (
          <el-input
            modelValue={modelValue}
            onInput={(val: string): void => emit("update:modelValue", val)}
            class="w-1/4"
            suffix-icon="Search"
            clearable
          ></el-input>
        ) : null}
      </div>
      <el-scrollbar height="300px">{slots.default?.()}</el-scrollbar>
    </el-card>
  );
  return {
    SortableList,
  };
};
