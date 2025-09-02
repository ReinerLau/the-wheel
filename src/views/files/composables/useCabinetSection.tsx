import { cabinet } from "@/api";
import { ListReponse } from "@/utils";
import { UseVirtualListItem, useVirtualList } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { isEqual } from "lodash";
import Sortable from "sortablejs";
import { FunctionalComponent, Ref, computed, ref, watch } from "vue";

// 每项机柜数据类型
interface CabinetItem {
  id: number;
  cabinetName: string;
  rid: string;
  x: string;
  y: string;
  theta: string;
}

// 机柜相关
export const useCabinetSection = (currentRoomId: Ref<string>) => {
  // 机柜数据加载 loading
  const loading = ref(false);

  // 当前选中的机柜 id
  const currentCabinetId = ref(0);

  // 点选机柜
  function handleSelectCabinet(id: number) {
    currentCabinetId.value = id;
  }

  // 机柜数据
  const cabinetData: Ref<CabinetItem[]> = ref([]);

  // 当前选中机房关联的机柜数据
  const cabinetRelevantData: Ref<CabinetItem[]> = ref([]);

  // 机柜坐标采集
  async function handleCabinetCollect(data: CabinetItem, robotCode: string) {
    if (!data.rid) {
      ElMessage({ type: "warning", message: "未绑定机房" });
      return;
    } else if (!robotCode) {
      ElMessage({ type: "warning", message: "请选择机器人" });
      return;
    }
    try {
      loading.value = true;
      await cabinet.collectCoordinate({
        robotId: robotCode,
        cabinetId: data.id,
        roomId: data.rid,
      });
      ElMessage({ type: "success", message: "采集成功" });
    } finally {
      loading.value = false;
    }
  }

  // 获取机柜数据
  async function getCabinetData() {
    try {
      loading.value = true;
      const res: ListReponse<CabinetItem> = await cabinet.queryAll({
        limit: 999999,
      });
      cabinetData.value = res.data?.list || [];
    } finally {
      loading.value = false;
    }
  }

  // 获取选中机房关联机柜数据
  async function getCabinetRelevantData() {
    try {
      loading.value = true;
      const res: { data: CabinetItem[] } = await cabinet.queryByRid(
        currentRoomId.value
      );
      cabinetRelevantData.value = res.data || [];
    } finally {
      loading.value = false;
    }
  }

  // 未关联机柜的搜索关键字
  const cabinetIrrelevantFilter = ref("");

  // 未关联机柜数据
  const cabinetIrrelevantData = computed(() => {
    const relevantIds = cabinetRelevantData.value.map((item) => item.id);
    return cabinetData.value.filter(
      (item) =>
        !relevantIds.includes(item.id) &&
        item.cabinetName.includes(cabinetIrrelevantFilter.value)
    );
  });

  // 已关联机柜 DOM 元素
  const cabinetRelevantRef: Ref<HTMLElement> = ref();

  // 未关联机柜 DOM 元素
  const cabinetRef: Ref<HTMLElement> = ref();

  // 使已关联机柜和未关联机柜可拖拽
  function createCabinetSortable() {
    Sortable.create(cabinetRelevantRef.value, {
      animation: 150,
      group: "cabinet",
      onEnd() {
        updateCabinetRelevant();
      },
    });
    Sortable.create(containerProps.ref.value.querySelector("div"), {
      animation: 150,
      group: "cabinet",
      onEnd() {
        updateCabinetRelevant();
      },
    });
  }

  // 监听到未关联机柜搜索关键字变化则滚动到顶部
  watch(cabinetIrrelevantFilter, () => {
    scrollTo(0);
  });

  // 关联机柜到机房上
  async function updateCabinetRelevant() {
    const ids = Array.from(
      cabinetRelevantRef.value.getElementsByClassName("item")
    ).map((item: Node) => Number(item.textContent));
    const newData = ids.map((id) =>
      cabinetData.value.find((item) => item.id === id)
    );
    if (isEqual(cabinetRelevantData.value, newData)) return;
    cabinetRelevantData.value = newData;
    try {
      loading.value = true;
      await cabinet.batchBind({
        ids,
        rid: currentRoomId.value,
      });
    } finally {
      loading.value = false;
    }
  }

  // 虚拟滚动相关
  const { list, containerProps, wrapperProps, scrollTo } = useVirtualList(
    cabinetIrrelevantData,
    {
      itemHeight: 100,
    }
  );

  // 未关联机柜组件
  const CabinetVirtualList: FunctionalComponent<{ robotCode: string }> = ({
    robotCode,
  }) => {
    return (
      <div
        ref={containerProps.ref}
        style={containerProps.style}
        class="h-[300px]"
        onScroll={containerProps.onScroll}
      >
        <div {...wrapperProps.value}>
          {list.value.map(
            (props: UseVirtualListItem<CabinetItem>): JSX.Element => (
              <CabinetItem
                key={props.data.id}
                data={props.data}
                robotCode={robotCode}
              ></CabinetItem>
            )
          )}
        </div>
      </div>
    );
  };

  // 已关联机柜组件
  const CabinetList: FunctionalComponent<{
    data: CabinetItem[];
    sortableRef: Ref<HTMLElement>;
    robotCode: string;
  }> = ({ data, sortableRef, robotCode }) => (
    <div ref={sortableRef} v-loading={loading.value} class="h-[300px]">
      {data.map(
        (item: CabinetItem): JSX.Element => (
          <CabinetItem
            key={item.id}
            data={item}
            robotCode={robotCode}
          ></CabinetItem>
        )
      )}
    </div>
  );

  // 单个机柜组件
  const CabinetItem: FunctionalComponent<{
    data: CabinetItem;
    robotCode: string;
  }> = ({ data, robotCode }) => (
    <div
      class={[
        "mb-2",
        "px-5",
        "bg-slate-100",
        "font-mono",
        "font-bold",
        "flex",
        "justify-between",
        "items-center",
        "cursor-pointer",
        "h-[100px]",
        { "bg-slate-300": currentCabinetId.value === data.id },
      ]}
      onClick={() => handleSelectCabinet(data.id)}
    >
      <div>
        <span>{data.cabinetName}</span>
        <span>{data.x && data.y && data.theta && "✅"}</span>
        <span class="hidden item">{data.id}</span>
      </div>
      <el-popconfirm
        title="确定采集吗?"
        onConfirm={() => handleCabinetCollect(data, robotCode)}
      >
        {{
          reference: () => (
            <div class="text-3xl" onClick={(e) => e.stopPropagation()}>
              🎦
            </div>
          ),
        }}
      </el-popconfirm>
    </div>
  );

  return {
    CabinetVirtualList,
    CabinetList,
    currentCabinetId,
    getCabinetData,
    cabinetData,
    cabinetRelevantData,
    getCabinetRelevantData,
    cabinetIrrelevantData,
    cabinetIrrelevantFilter,
    createCabinetSortable,
    cabinetRelevantRef,
    cabinetRef,
  };
};
