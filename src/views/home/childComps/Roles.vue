<template>
  <div id="roles">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表区域 -->
      <el-table :data="rolesList" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', index1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, index1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级和三级权限 -->
              <el-col :span="19">
                <!-- 渲染二级权限 -->
                <el-row
                  :class="[index2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{ item2.authName }}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      type="warning"
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                    >{{ item3.authName }}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
            <pre>
              {{ scope.row }}
            </pre>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditRoleDialog(scope.row.id)">编辑</el-button>
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeRoleById(scope.row.id)">删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 分配权限的对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      width="50%"
      @close="setRightsDialogClose"
    >
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defaultKeys"
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 添加角色的对话框 -->
    <el-dialog title="添加角色" :visible.sync="addRoleDialogVisible" width="50%">
      <el-form
        :model="addRoleForm"
        :rules="addRoleFormRules"
        ref="addRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改角色的对话框 -->
    <el-dialog title="修改角色" :visible.sync="editRoleDialogVisible" width="50%">
      <el-form
        :model="editRoleForm"
        :rules="editRoleFormRules"
        ref="editRoleFormRef"
        label-width="100px"
      >
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editRoleForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editRoleForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {
  getRolesListData,
  removeRightById,
  getSetRightsData,
  allotRights,
  addRole,
  showEditRole,
  editRole,
  removeRoleById
} from "network/home";

export default {
  name: "Roles",
  data() {
    return {
      // 所有角色列表数据
      rolesList: [],
      // 控制分配权限对框框的显示与隐藏
      setRightsDialogVisible: false,
      // 所有权限的数据
      rightsList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的节点Id数组
      defaultKeys: [],
      // 当前即将分配权限的角色id
      roleId: "",
      // 控制添加角色的对话框的显示与隐藏
      addRoleDialogVisible: false,
      // 添加角色的表单数据
      addRoleForm: {
        roleName: "",
        roleDesc: ""
      },
      // 添加角色的表单的验证规则
      addRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      },
      // 控制修改角色的对话框的显示与隐藏
      editRoleDialogVisible: false,
      // 修改角色的表单数据
      editRoleForm: {},
      // 修改角色的表单的验证规则
      editRoleFormRules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" }
        ],
        roleDesc: [
          { required: true, message: "请输入角色描述", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
    // 获取所有角色的列表
    async getRolesList() {
      const res = await getRolesListData();
      if (res.meta.status !== 200) {
        this.$message.error("获取角色列表失败！");
      } else {
        this.rolesList = res.data;
      }
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      // 弹框提示用户是否要删除
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(err => err);
      if (confirmResult !== "confirm") {
        this.$message.info("取消了删除！");
      } else {
        const res = await removeRightById(role.id, rightId);

        if (res.meta.status !== 200) {
          this.$message.error("删除权限失败！");
        } else {
          this.$message.success("删除权限成功！");
          role.children = res.data;
        }
      }
    },
    // 展示分配权限的对话框
    async showSetRightsDialog(role) {
      this.roleId = role.id;
      // 获取所有权限数据
      const res = await getSetRightsData();
      if (res.meta.status !== 200) {
        this.$message.error("获取权限数据失败！");
      } else {
        // 把获取到权限数据保存到data中
        this.rightsList = res.data;
        // 获取三级节点的id
        this.getLeafKeys(role, this.defaultKeys);
        this.setRightsDialogVisible = true;
      }
    },
    // 通过递归，获取角色下所有三级权限的id，并保存到defaultKeys中
    getLeafKeys(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      } else {
        node.children.forEach(item => {
          this.getLeafKeys(item, arr);
        });
      }
    },
    // 监听分配权限对话框的关闭事件
    setRightsDialogClose() {
      this.defaultKeys = [];
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ];
      const idStr = keys.join(",");
      const res = await allotRights(this.roleId, idStr);
      if (res.meta.status !== 200) {
        this.$message.error("分配权限失败！");
      } else {
        this.$message.success("分配权限成功！");
        this.getRolesList();
        this.setRightsDialogVisible = false;
      }
    },
    // 点击添加角色
    async addRole() {
      this.$refs.addRoleFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("清填写正确信息！");
        } else {
          // 发起添加角色的网络请求
          const res = await addRole(this.addRoleForm);
          if (res.meta.status !== 201) {
            this.$message.error("添加角色失败！");
          } else {
            this.$message.success("添加角色成功！");
            this.addRoleDialogVisible = false;
            this.getRolesList();
          }
        }
      });
    },
    // 点击显示修改角色对话框
    async showEditRoleDialog(roleId) {
      const res = await showEditRole(roleId);
      if (res.meta.status !== 200) {
        this.$message.error('查询角色信息失败！');
      } else {
        this.editRoleForm = res.data;
        this.editRoleDialogVisible = true;
      }
    },
    // 点击修改角色
    editRole() {
      this.$refs.editRoleFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写正确信息！');
        } else {
          const res = await editRole(this.editRoleForm);
          if (res.meta.status !== 200) {
            this.$message.error('修改角色信息失败！');
          } else {  
            this.editRoleDialogVisible = false;
            this.getRolesList();
            this.$message.success('修改角色信息成功！');
          }
        }
      })
    },
    // 根据id删除对应的角色信息
    async removeRoleById(roleId) {
      const removeRoleConfirm = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err);
      if (removeRoleConfirm !== 'confirm') {
        this.$message.info("已取消删除！");
      } else {
        const res = await removeRoleById(roleId);
        if (res.meta.status !== 200) {
          this.$message.error('删除角色失败！');
        } else {
          this.$message.success('删除角色成功！');
          this.getRolesList();
        }
      }
    }
  },
  created() {
    this.getRolesList();
  }
};
</script>

<style scoped>
.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>