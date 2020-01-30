<template>
  <div id="params">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="注意：只允许为第三级分类设置相关参数！" type="warning" :closable="false" show-icon></el-alert>

      <!-- 选择商品分类区域 -->
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!-- 选择商品分类的级联选择框 -->
          <el-cascader
            v-model="selectedCateKeys"
            :options="cateList"
            :props="cateCascaderProps"
            @change="handleChange"
            clearable
          ></el-cascader>
        </el-col>
      </el-row>

      <!-- tab页签区域 -->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数的面板 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParamsDialog"
          >添加参数</el-button>
          <el-table :data="manyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                >{{ item }}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性的面板 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="showAddParamsDialog"
          >添加属性</el-button>
          <el-table :data="onlyTableData" border stripe>
            <el-table-column type="expand">
              <template slot-scope="scope">
                <!-- 循环渲染Tag标签 -->
                <el-tag
                  v-for="(item, index) in scope.row.attr_vals"
                  :key="index"
                  closable
                  @close="handleClose(index, scope.row)"
                >{{ item }}</el-tag>
                <!-- 输入的文本框 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index" label="#"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  size="mini"
                  icon="el-icon-edit"
                  @click="showEditParamsDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  size="mini"
                  icon="el-icon-delete"
                  @click="removeParamsById(scope.row)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 添加参数的对话框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addParamsDialogVisible"
      width="50%"
      @close="addParamsDialogClose"
    >
      <el-form
        :model="addParamsForm"
        :rules="addParamsFormRules"
        ref="addParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改参数的对话框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editParamsDialogVisible"
      width="50%"
      @close="editParamsDialogClose"
    >
      <el-form
        :model="editParamsForm"
        :rules="editParamsFormRules"
        ref="editParamsFormRef"
        label-width="100px"
      >
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editParamsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getCateListData,
  getParamsListData,
  addParams,
  showEditParamsData,
  editParams,
  removeParamsById
} from "network/home";

export default {
  name: "Params",
  data() {
    return {
      cateList: [],
      cateCascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      selectedCateKeys: [],
      // 被激活的页签的名称
      activeName: "many",
      // 动态参数数据
      manyTableData: [],
      // 静态属性数据
      onlyTableData: [],
      // 控制添加参数对话框的显示与隐藏
      addParamsDialogVisible: false,
      // 添加参数对话框的表单数据
      addParamsForm: {
        attr_name: ""
      },
      // 添加参数表单数据的验证规则对象
      addParamsFormRules: {
        attr_name: [
          { required: true, message: "请添加参数名称", trigger: "blur" }
        ]
      },
      // 控制修改参数对话框的显示与隐藏
      editParamsDialogVisible: false,
      // 修改参数对话框的表单数据
      editParamsForm: {
        attr_name: ""
      },
      // 修改参数表单数据的验证规则对象
      editParamsFormRules: {
        attr_name: [
          { required: true, message: "请添加参数名称", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    async getCateList() {
      const res = await getCateListData({ type: 3 });
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类失败！");
      } else {
        this.cateList = res.data;
      }
    },
    // 级联选择框选中变化，会触发这个函数
    handleChange() {
      // 说明选中的不是三级分类
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = [];
        this.manyTableData = [];
        this.onlyTableData = [];
      } else {
        // 说明选中的是三级分类
        this.getParamsList();
      }
    },
    // tab页签点击事件的处理函数
    handleTabClick() {
      this.getParamsList();
    },
    async getParamsList() {
      if (this.selectedCateKeys.length !== 3) {
        return;
      } else {
        // 根据所选分类的id，和当前所处的面板，获取对应的参数
        const res = await getParamsListData(this.cateId, this.activeName);
        if (res.meta.status !== 200) {
          this.$message.error("获取参数列表失败！");
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
            // 控制文本框的显示与隐藏
            item.inputVisible = false;
            // 文本框中输入的值
            item.inputValue = '';
          });
          if (this.activeName === "many") {
            this.manyTableData = res.data;
          } else {
            this.onlyTableData = res.data;
          }
        }
      }
    },
    // 点击按钮，显示添加动态参数的对话框
    showAddParamsDialog() {
      this.addParamsDialogVisible = true;
    },
    // 点击按钮，添加参数
    addParams() {
      this.$refs.addParamsFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写参数名称");
        } else {
          const res = await addParams(
            this.cateId,
            this.addParamsForm.attr_name,
            this.activeName
          );
          if (res.meta.status !== 201) {
            this.$message.error("添加参数失败！");
          } else {
            this.$message.success("添加参数成功！");
            this.getParamsList();
            this.addParamsDialogVisible = false;
          }
        }
      });
    },
    // 监听添加参数对话框的关闭事件
    addParamsDialogClose() {
      this.$refs.addParamsFormRef.resetFields();
    },
    // 点击按钮，显示修改参数的对话框
    async showEditParamsDialog(attr) {
      const res = await showEditParamsData(
        this.cateId,
        attr.attr_id,
        this.activeName
      );
      if (res.meta.status !== 200) {
        this.$message.error("获取参数信息失败！");
      } else {
        this.editParamsForm = res.data;
        this.editParamsDialogVisible = true;
      }
    },
    // 点击按钮，修改参数
    editParams() {
      this.$refs.editParamsFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写参数名称！");
        } else {
          const res = await editParams(
            this.cateId,
            this.editParamsForm.attr_id,
            this.editParamsForm.attr_name,
            this.activeName
          );
          if (res.meta.status !== 200) {
            this.$message.error("更新参数失败！");
          } else {
            this.$message.success("更新参数成功！");
            this.getParamsList();
            this.editParamsDialogVisible = false;
          }
        }
      });
    },
    // 监听修改参数对话框的关闭事件
    editParamsDialogClose() {
      this.$refs.editParamsFormRef.resetFields();
    },
    // 根据id删除对应的参数
    async removeParamsById(attr) {
      const removeParamsConfirm = await this.$confirm(
        "此操作将永久删除该参数, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (removeParamsConfirm !== "confirm") {
        this.$message.info("已取消删除！");
      } else {
        const res = await removeParamsById(this.cateId, attr.attr_id);
        if (res.meta.status !== 200) {
          this.$message.error("删除参数失败！");
        } else {
          this.$message.success("删除参数成功！");
          this.getParamsList();
        }
      }
    },
    // 文本框失去焦点，或按下了enter键都会触发
    handleInputConfirm(row) {
      if (row.inputValue.trim() === '') {
        row.inputValue = '';
      } else {
        // 输入的内容有效，需要做后续处理
        row.attr_vals.push(row.inputValue.trim());
        row.inputValue = '';
        this.saveAttrVals(row);
      }
      row.inputVisible = false;
    },
    // 点击按钮，展示文本输入框
    showInput(row) {
      row.inputVisible = true;
      // 让文本框自动获得焦点
      // $nextTick方法的作用，就是当页面上的元素被重新渲染之后，才会执行的回调函数
      this.$nextTick(_ => {
          this.$refs.saveTagInput.$refs.input.focus();
        });
    },
    // 删除对应的参数可选项
    handleClose(index, row) {
      row.attr_vals.splice(index,1);
      this.saveAttrVals(row);
    },
    // 将attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const res = await editParams(this.cateId, row.attr_id, row.attr_name, this.activeName, row.attr_vals.join(' '));
        if (res.meta.status !== 200) {
          this.$message.error('修改参数项失败！');
        } else {
          this.$message.success('修改参数项成功！');
        }
    }
  },
  computed: {
    // 如果按钮需要被禁用，则返回true，否则返回false
    isBtnDisabled() {
      return this.selectedCateKeys.length !== 3;
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectedCateKeys.length === 3) {
        return this.selectedCateKeys[2];
      } else {
        return null;
      }
    },
    titleText() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style scoped>
.cat_opt {
  margin: 15px 0;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>