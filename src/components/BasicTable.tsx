import { ElMessage, ElMessageBox, FormInstance } from "element-plus";
import { Fragment, PropType, defineComponent, ref, toRaw } from "vue";
interface QueryFields {
  prop?: string;
  title?: string;
  slot?: (params) => JSX.Element;
}

interface TableFields {
  prop?: string;
  title: string;
  action?: boolean;
  slot?: (row) => JSX.Element;
  formatter?: (val, row) => string;
}

interface FormFields {
  prop: string;
  title: string;
  slot?: (form) => JSX.Element;
}

export default defineComponent({
  name: "BasicTable",
  props: {
    initialParams: {
      type: Object,
      default: () => ({}),
    },
    formRules: {
      type: Object,
      default: () => ({}),
    },
    queryApi: {
      type: Function,
      required: true,
    },
    createApi: {
      type: Function,
      default: () => Promise,
    },
    updateApi: {
      type: Function,
      default: () => Promise,
    },
    deleteApi: {
      type: Function,
      default: () => Promise,
    },
    queryFields: {
      type: Array as PropType<QueryFields[]>,
      default: () => [],
    },
    tableFields: {
      type: Array as PropType<TableFields[]>,
      default: () => [],
    },
    formFields: {
      type: Array as PropType<FormFields[]>,
      default: () => [],
    },
    fieldFilter: {
      type: Object,
      default: () => ({}),
    },
    hasAdd: {
      type: Boolean,
      default: true,
    },
    hasDel: {
      type: Boolean,
      default: true,
    },
    hasPagination: {
      type: Boolean,
      default: false,
    },
    buttonPermissions: {
      type: Object as PropType<{
        create: string;
        edit: string;
        delete: string;
      }>,
      default: () => ({}),
    },
  },
  emits: ["resetQuery", "closeForm", "openForm"],
  setup(props, { emit, expose }) {
    const params = ref(Object.assign({}, props.initialParams));
    const loading = ref(false);
    const data = ref([]);
    const dialogVisible = ref(false);
    const form = ref<any>({});
    const formRef = ref<FormInstance>();
    const total = ref(0);

    function handleQuery() {
      getList();
    }
    function handleReset() {
      params.value = Object.assign({}, props.initialParams);
      getList();
      emit("resetQuery");
    }
    async function getList() {
      loading.value = true;
      try {
        const res = await props.queryApi(params.value);
        data.value = res.data ? res.data.list : [];
        total.value = res.data ? res.data.total : 0;
      } finally {
        loading.value = false;
      }
    }
    function handleAdd() {
      dialogVisible.value = true;
      emit("openForm", form);
    }

    async function handleDelete(id: number) {
      loading.value = true;
      try {
        const { message } = await props.deleteApi(id);
        ElMessage({ type: "success", message });
        getList();
      } finally {
        loading.value = false;
      }
    }

    function handleEdit(data) {
      dialogVisible.value = true;
      form.value = Object.assign({}, toRaw(data), props.fieldFilter);
      emit("openForm", form);
    }

    async function handleSubmit(formRef: FormInstance) {
      await formRef.validate(async (valid) => {
        if (valid) {
          loading.value = true;
          try {
            if (form.value.id) {
              const { message } = await props.updateApi(form.value);
              ElMessage({ type: "success", message });
              handleCancel(formRef);
              getList();
            } else {
              const { message } = await props.createApi(form.value);
              ElMessage({ type: "success", message });
              ElMessageBox.confirm("是否继续添加?", "", {
                confirmButtonText: "是",
                cancelButtonText: "否",
                type: "info",
              })
                .then(() => {
                  formRef.resetFields();
                  form.value = {};
                })
                .catch(() => {
                  handleCancel(formRef);
                  getList();
                });
            }
          } finally {
            loading.value = false;
          }
        }
      });
    }
    function handleCancel(formRef: FormInstance) {
      formRef.resetFields();
      form.value = {};
      dialogVisible.value = false;
      emit("closeForm");
    }

    getList();

    expose({
      getList,
    });

    const QueryArea = () => (
      <el-row gutter={12} class="mb-2">
        {props.queryFields.map((item) => (
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

    const ActionArea = () => (
      <div class="mb-2">
        <el-button
          v-has={props.buttonPermissions.create}
          type="primary"
          onClick={handleAdd}
        >
          添加
        </el-button>
      </div>
    );

    const FormArea = () => (
      <el-dialog
        model-value={dialogVisible.value}
        title="添加"
        close-on-click-modal={false}
        close-on-press-escape={false}
        onClose={() => handleCancel(formRef.value)}
      >
        {{
          default: () => (
            <el-form
              ref={formRef}
              model={form}
              rules={props.formRules}
              label-width="100"
            >
              {props.formFields.map((item) => (
                <el-form-item label={item.title} prop={item.prop}>
                  {item.slot ? (
                    item.slot(form)
                  ) : (
                    <el-input v-model={form.value[item.prop]} />
                  )}
                </el-form-item>
              ))}
            </el-form>
          ),
          footer: () => (
            <Fragment>
              <el-button
                loading={loading.value}
                type="primary"
                onClick={() => handleSubmit(formRef.value)}
              >
                确定
              </el-button>
              <el-button onClick={() => handleCancel(formRef.value)}>
                取消
              </el-button>
            </Fragment>
          ),
        }}
      </el-dialog>
    );

    const TableArea = () => (
      <el-table
        v-loading={loading.value}
        data={data.value}
        stripe={true}
        border={true}
        table-layout="auto"
        class="w-full"
      >
        {props.tableFields.map((item) => {
          return (
            <el-table-column
              prop={item.prop}
              label={item.title}
              header-align="center"
              align="center"
            >
              {{
                default: ({ row }) => {
                  return (
                    <Fragment>
                      {item.action
                        ? [
                            <el-button
                              v-has={props.buttonPermissions.edit}
                              link
                              type="primary"
                              onClick={() => handleEdit(row)}
                            >
                              编辑
                            </el-button>,
                            <el-popconfirm
                              title="确定删除？"
                              onConfirm={() => handleDelete(row.id)}
                            >
                              {{
                                reference: () => (
                                  <el-button
                                    v-has={props.buttonPermissions.delete}
                                    v-show={props.hasDel}
                                    loading={loading.value}
                                    link
                                    type="danger"
                                  >
                                    删除
                                  </el-button>
                                ),
                              }}
                            </el-popconfirm>,
                          ]
                        : null}
                      {item.slot
                        ? item.slot(row)
                        : item.formatter
                        ? item.formatter(row[item.prop], row)
                        : row[item.prop]}
                    </Fragment>
                  );
                },
              }}
            </el-table-column>
          );
        })}
      </el-table>
    );

    function handleSizeChange() {
      getList();
    }

    function handleCurrentChange() {
      getList();
    }

    const Pagination = () => (
      <div class="flex justify-end mt-2">
        <el-pagination
          layout="sizes, prev, pager, next"
          total={total.value}
          v-model:current-page={params.value.page}
          v-model:page-size={params.value.limit}
          page-sizes={[10, 20, 50, 100, 200, 500]}
          onSizeChange={handleSizeChange}
          onCurrentChange={handleCurrentChange}
        />
      </div>
    );

    return () => (
      <Fragment>
        <QueryArea />
        {props.hasAdd ? <ActionArea /> : null}
        <TableArea />
        <FormArea />
        {props.hasPagination ? <Pagination /> : null}
      </Fragment>
    );
  },
});
