<template>
  <div id="categories">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>

      <!-- 表格 -->
      <tree-table
        class="tree-table"
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <!-- 是否有效 -->
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-success" v-if="!scope.row.cat_delete" style="color: lightgreen;"></i>
          <i class="el-icon-error" v-else style="color: red;"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="operate" slot-scope="scope">
          <el-button size="mini" icon="el-icon-edit" type="primary" @click="showEditCateDialog(scope.row)">编辑</el-button>
          <el-button size="mini" icon="el-icon-delete" type="danger" @click="removeCateById(scope.row)">删除</el-button>
        </template>
      </tree-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClose"
    >
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader
            v-model="selectedKeys"
            :options="parentCateList"
            :props="cascaderProps"
            @change="parentCateChange"
            clearable
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改分类的对话框 -->
    <el-dialog title="修改分类" :visible.sync="editCateDialogVisible" width="50%">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getCateListData, addCate, showEditCateData, editCate, removeCateById } from "network/home";

export default {
  name: "Categories",
  data() {
    return {
      // 商品分类的数据列表
      cateList: [],
      // 查询条件
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总数据条数
      total: 0,
      // 为TreeTable指定列的定义
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          // 表示当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "isOk"
        },
        {
          label: "排序",
          // 表示当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "order"
        },
        {
          label: "操作",
          // 表示当前列定义为模板列
          type: "template",
          // 表示当前列使用的模板名称
          template: "operate",
          width: "200px"
        }
      ],
      // 控制添加分类对话框的显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        cat_name: "",
        cat_pid: 0,
        cat_level: 0
      },
      // 添加分类表单的验证规则对象
      addCateFormRules: {
        cat_name: [
          { required: true, message: "请添加分类名称", trigger: "blur" }
        ]
      },
      // 父级分类的列表
      parentCateList: [],
      // 级联选择器的配置对象
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children",
        checkStrictly: true
      },
      // 选中的父级分类的id数组
      selectedKeys: [],
      // 控制修改分类对话框的显示与隐藏
      editCateDialogVisible: false,
      // 修改分类的表单数据对象
      editCateForm: {
        cat_name: ''
      },
      // 修改分类表单的验证规则对象
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      // 修改分类的id
      editCateId: 0
    };
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const res = await getCateListData(this.queryInfo);
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类失败！");
      } else {
        this.cateList = res.data.result;
        this.total = res.data.total;
      }
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getCateList();
    },
    // 监听pagenum改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getCateList();
    },
    showAddCateDialog() {
      this.getParentCateList();
      this.addCateDialogVisible = true;
    },
    async getParentCateList() {
      const res = await getCateListData({ type: 2 });
      if (res.meta.status !== 200) {
        this.$message.error("获取父级分类数据失败！");
      } else {
        this.parentCateList = res.data;
      }
    },
    // 选择项发生变化触发这个函数
    parentCateChange() {
      // 如果selectedKeys数组的length大于0，说明选中了父级分类
      // 反之，说明没有选中任何父级分类
      if (this.selectedKeys.length > 0) {
        this.addCateForm.cat_pid = this.selectedKeys[
          this.selectedKeys.length - 1
        ];
        this.addCateForm.cat_level = this.selectedKeys.length;
      } else {
        this.addCateForm.cat_pid = 0;
        this.addCateForm.cat_level = 0;
      }
    },
    // 点击按钮，添加新的分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写正确信息！");
        } else {
          const res = await addCate(this.addCateForm);
          if (res.meta.status !== 201) {
            this.$message.error("添加分类失败！");
          } else {
            this.$message.success("添加分类成功！");
            this.getCateList();
            this.addCateDialogVisible = false;
          }
        }
      });
    },
    // 监听添加分类对话框的关闭事件，重置表单数据
    addCateDialogClose() {
      this.$refs.addCateFormRef.resetFields();
      this.selectedKeys = [];
      this.addCateForm.cat_pid = 0;
      this.addCateForm.cat_level = 0;
    },
    // 点击按钮，显示修改分类对话框
    async showEditCateDialog(cate) {
      this.editCateId = cate.cat_id;
      const res = await showEditCateData(this.editCateId);
      if (res.meta.status !== 200) {
        this.$message.error('获取分类信息失败！');
      } else {
        this.editCateForm.cat_name = res.data.cat_name;
        this.editCateDialogVisible = true;
      }
    },
    // 点击按钮，修改分类 
    editCate() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写分类名称！');
        } else {
          const res = await editCate(this.editCateId, this.editCateForm.cat_name);
          if (res.meta.status !== 200) {
            this.$message.error('修改分类信息失败！');
          } else {
            this.$message.success('修改分类信息成功！');
            this.getCateList();
            this.editCateDialogVisible = false;
          }
        }
      })
    },
    // 根据id删除对应的分类信息
    async removeCateById(cate) {
      const removeCateConfirm = await this.$confirm('此操作将永久删除该分类, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      if (removeCateConfirm !== 'confirm') {
        this.$message.info('已取消删除！');
      } else {
        const res = await removeCateById(cate.cat_id);
        if (res.meta.status !== 200) {
          this.$message.error('分类删除失败！');
        } else {
          this.$message.success('分类删除成功！');
          this.getCateList();
        }
      }
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style scoped>
.tree-table {
  margin-top: 15px;
}

.el-cascader {
  width: 100%;
}
</style>