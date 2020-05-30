<template>
  <div id="add-goods">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="添加商品信息" type="info" show-icon center></el-alert>

      <!-- 进度条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>

      <!-- tab栏区域 -->
      <el-form
        :model="addGoodsForm"
        :rules="addGoodsFormRules"
        ref="addGoodsFormRef"
        label-position="top"
      >
        <el-tabs
          :tab-position="'left'"
          v-model="activeIndex"
          :before-leave="beforeTabLeave"
          @tab-click="tabClick"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name "></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="addGoodsForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item v-for="item in manyTabData" :label="item.attr_name" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cbItem, cbIndex) in item.attr_vals"
                  :label="cbItem"
                  :key="cbIndex"
                  border
                  disabled
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <!-- 渲染表单的item项 -->
            <el-form-item v-for="item in onlyTabData" :label="item.attr_name" :key="item.attr_id">
              <el-input v-model="item.attr_vals" disabled></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headersObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器 -->
            <quill-editor v-model="addGoodsForm.goods_introduce"></quill-editor>
            <!-- 添加商品的按钮 -->
            <el-button type="primary" class="btn-add-goods" @click="addGoods">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt="" class="preview-img">
    </el-dialog>
  </div>
</template>

<script>
import { getCateListData, getParamsListData, addGoods } from "network/home";

import _ from 'lodash'

export default {
  name: "AddGoods",
  data() {
    return {
      activeIndex: "0",
      // 添加商品的表单数据对象
      addGoodsForm: {
        goods_name: "",
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        // 图片的数组
        pics: [],
        // 商品的详情描述
        goods_introduce: '',
        // 商品参数的数组
        attrs: []
      },
      // 添加商品表单的验证规则对象
      addGoodsFormRules: {
        goods_name: [
          { required: "true", message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: "true", message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: "true", message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: "true", message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cat: [
          { required: "true", message: "请选择商品分类", trigger: "blur" }
        ]
      },
      cateList: [],
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      // 动态参数列表数据
      manyTabData: [],
      // 静态属性列表数据
      onlyTabData: [],
      // 图片上传的URL地址
      uploadURL: "https://www.liulongbin.top:8888/api/private/v1/upload",
      // 图片上传组件的headers请求头对象
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      // 图片预览时的路径
      previewPath: "",
      previewDialogVisible: false
    };
  },
  methods: {
    async getCateList() {
      const res = await getCateListData();
      if (res.meta.status !== 200) {
        this.$message.error("获取商品分类失败！");
      } else {
        this.cateList = res.data;
      }
    },
    // 级联选择器选中项变化，会触发这个函数
    handleChange() {
      if (this.addGoodsForm.goods_cat.length !== 3) {
        this.addGoodsForm.goods_cat = [];
      }
    },
    // 切换tabs页面的时候触发这个函数
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.addGoodsForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    // 点击tab页面时触发这个函数
    async tabClick() {
      if (this.activeIndex === "1") {
        const res = await getParamsListData(this.cateId, "many");
        if (res.meta.status !== 200) {
          this.$message.error("获取动态参数失败！");
        } else {
          res.data.forEach(item => {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          });
          this.manyTabData = res.data;
        }
      } else if (this.activeIndex === "2") {
        const res = await getParamsListData(this.cateId, "only");
        if (res.meta.status !== 200) {
          this.$message.error("获取静态属性失败！");
        } else {
          this.onlyTabData = res.data;
        }
      }
    },
    // 处理图片预览效果
    handlePreview(file) {
      this.previewPath = file.response.data.url;
      this.previewDialogVisible = true;
    },
    // 处理移除图片的操作
    handleRemove(file) {
      // 1.获取将要删除的图片的临时路径
      const filePath = file.response.data.tmp_path;
      // 2.从pics数组中找到这个图片对应的索引值
      const fileIndex = this.addGoodsForm.pics.findIndex(
        item => item.pic === filePath
      );
      // 3.调用数组的splice方法，把图片信息对象从pics数组中移除
      this.addGoodsForm.pics.splice(fileIndex, 1);
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.data.tmp_path };
      // 2.将图片信息对象，push到pics数组中
      this.addGoodsForm.pics.push(picInfo);
    },
    // 点击按钮，添加商品
    addGoods() {
      this.$refs.addGoodsFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error('请填写必要的表单项！');
        } else {
          // 处理动态参数
          this.manyTabData.forEach(item => {
            const newParam = { 
              attr_id: item.attr_id, 
              attr_value: item.attr_vals.join(' ')
            };
            this.addGoodsForm.attrs.push(newParam);
          })
          // 处理静态属性
          this.onlyTabData.forEach(item => {
            const newAttr = {
              attr_id: item.attr_id, 
              attr_value: item.attr_vals
            };
              this.addGoodsForm.attrs.push(newAttr);
          })
          // 处理goods_cat，不能直接改变goods_cat，会影响前面的级联选择器，必须深拷贝
          const newAddGoodsForm = _.cloneDeep(this.addGoodsForm);
          newAddGoodsForm.goods_cat = newAddGoodsForm.goods_cat.join(',');
          
          const res = await addGoods(newAddGoodsForm);
          if (res.meta.status !== 201) {
            if (res.meta.msg === ('商品名称已存在')) {
              this.$message.error(res.meta.msg + '！');
            } else {
              this.$message.error('添加商品失败！');
            }
          } else {
            this.$message.success('添加商品成功！');
            this.$router.push('/goods');
          }
        }
      })
    }
  },
  computed: {
    cateId() {
      if (this.addGoodsForm.goods_cat.length === 3) {
        return this.addGoodsForm.goods_cat[2];
      } else {
        return null;
      }
    }
  },
  created() {
    this.getCateList();
  }
};
</script>

<style scoped>
.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.preview-img {
  width: 100%;  
}

.btn-add-goods {
  margin-top: 15px;
}
</style>