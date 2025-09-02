import { DateModelType, DateOrDates, dayjs } from "element-plus";
import { FunctionalComponent, Ref, ref } from "vue";
interface QueryTimeItem {
  label: string;
  value: "year" | "month" | "week" | "date" | "daterange";
  format: string;
  shortcuts?: { text: string; value: [Date, Date] }[];
}

interface QueryTimeItems {
  [key: string]: QueryTimeItem;
}

const queryTimeItmes: QueryTimeItems = {
  year: { label: "按年查询", value: "year", format: "YYYY 年" },
  month: { label: "按月查询", value: "month", format: "YYYY 年 MM 月" },
  week: { label: "按周查询", value: "week", format: "YYYY 年 第 w 周" },
  date: { label: "按天查询", value: "date", format: "YYYY 年 MM 月 DD 日" },
  daterange: {
    label: "按范围查询",
    value: "daterange",
    format: "YYYY 年 MM 月 DD 日",
    shortcuts: [
      {
        text: "最近三天",
        value: [dayjs().subtract(2, "day").toDate(), new Date()],
      },
      {
        text: "最近一周",
        value: [dayjs().subtract(1, "week").toDate(), new Date()],
      },
      {
        text: "最近一个月",
        value: [dayjs().subtract(1, "month").toDate(), new Date()],
      },
      {
        text: "最近三个月",
        value: [dayjs().subtract(3, "month").toDate(), new Date()],
      },
      {
        text: "最近一年",
        value: [dayjs().subtract(1, "year").toDate(), new Date()],
      },
      {
        text: "最近三年",
        value: [dayjs().subtract(3, "year").toDate(), new Date()],
      },
    ],
  },
};

export const useTimePicker = () => {
  const TimePicker: FunctionalComponent<{
    type?: string;
    modelValue?: null;
  }> = (props, { emit }) => {
    function handleChange(val) {
      emit("update:modelValue", val);
    }
    return (
      <div class="flex items-center flex-1 gap-x-5">
        <el-select
          modelValue={props.type}
          placeholder="选择时间"
          clearable
          onChange={(val: string) => {
            emit("update:modelValue", null);
            emit("update:type", val);
          }}
        >
          {Object.keys(queryTimeItmes).map((type) => (
            <el-option
              key={type}
              value={queryTimeItmes[type].value}
              label={queryTimeItmes[type].label}
            ></el-option>
          ))}
        </el-select>
        {props.type && (
          <el-date-picker
            class="flex-1"
            modelValue={props.modelValue}
            type={props.type}
            format={queryTimeItmes[props.type].format}
            shortcuts={queryTimeItmes[props.type].shortcuts}
            placeholder="请选择时间"
            start-placeholder="请选择开始时间"
            end-placeholder="请选择结束时间"
            onUpdate:modelValue={handleChange}
          />
        )}
      </div>
    );
  };

  const queryTimeType: Ref<dayjs.OpUnitType> = ref("year");

  const queryTime: Ref<DateModelType | DateOrDates> = ref(
    dayjs().startOf("year").format()
  );

  return {
    TimePicker,
    queryTimeType,
    queryTime,
  };
};
