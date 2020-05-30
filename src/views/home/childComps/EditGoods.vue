<template>
  <div id="edit-goods">
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>修改商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 警告区域 -->
      <el-alert title="修改商品信息" type="info" show-icon center></el-alert>

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
        :model="editGoodsForm"
        :rules="editGoodsFormRules"
        ref="editGoodsFormRef"
        label-position="top"
      >
        <el-tabs :tab-position="'left'" v-model="activeIndex" :before-leave="beforeTabsLeave">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="editGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="editGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight" type="number">
              <el-input v-model="editGoodsForm.goods_weight"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number" type="number">
              <el-input v-model="editGoodsForm.goods_number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader
                v-model="editGoodsForm.goods_cat"
                :options="cateList"
                :props="cascaderProps"
                @change="handleChange"
                clearable
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item
              v-for="item in editGoodsForm.attrs"
              v-if="item.attr_sel === 'many'"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox
                  v-for="(cbItem, cbIndex) in item.attr_vals"
                  :label="cbItem"
                  :key="cbIndex"
                  border
                  size="small"
                  disabled
                ></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item
              v-for="item in editGoodsForm.attrs"
              v-if="item.attr_sel === 'only'"
              :label="item.attr_name"
              :key="item.attr_id"
            >
              <el-input v-model="item.attr_vals" disabled></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              :action="uploadURL"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              :on-success="handleSuccess"
              :file-list="editGoodsForm.pics"
              list-type="picture"
              :headers="headersObj"
            >
              <el-button size="small" type="primary">点击上传</el-button>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <quill-editor v-model="editGoodsForm.goods_introduce"></quill-editor>
            <el-button type="primary" class="btn-edit-goods" @click="editGoods">修改商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>

    <!-- 图片预览对话框 -->
    <el-dialog title="图片预览" :visible.sync="previewDialogVisible" width="50%">
      <img :src="previewPath" alt class="preview-img" />
    </el-dialog>
  </div>
</template>

<script>
import {
  getGoodsInfoData,
  getCateListData,
  editGoods,
  editPics,
  editAttrs
} from "network/home";

import _ from "lodash";

export default {
  name: "EditGoods",
  data() {
    return {
      activeIndex: 0,
      goodsId: 0,
      goodsInfo: {},
      editGoodsForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        goods_cat: [],
        attrs: [],
        pics: [],
        goods_introduce: ""
      },
      editGoodsFormRules: {
        goods_name: [
          { required: "true", message: "请填写商品名称！", trigger: "blur" }
        ],
        goods_price: [
          { required: "true", message: "请填写商品价格！", trigger: "blur" }
        ],
        goods_weight: [
          { required: "true", message: "请填写商品重量！", trigger: "blur" }
        ],
        goods_number: [
          { required: "true", message: "请填写商品数量！", trigger: "blur" }
        ],
        goods_cat: [
          { required: "true", message: "请选择商品分类！", trigger: "blur" }
        ]
      },
      cascaderProps: {
        expandTrigger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      cateList: [],
      previewDialogVisible: false,
      previewPath: "",
      headersObj: {
        Authorization: window.sessionStorage.getItem("token")
      },
      uploadURL: "https://www.liulongbin.top:8888/api/private/v1/upload"
    };
  },
  methods: {
    async getGoodsInfo() {
      const res = await getGoodsInfoData(this.goodsId);
      if (res.meta.status !== 200) {
        this.$message.error("获取商品信息失败！");
      } else {
        this.goodsInfo = res.data;
        // 深拷贝goodsInfo作为修改表单数据对象
        this.editGoodsForm = _.cloneDeep(this.goodsInfo);
        // 修改goods_cat数据项
        this.editGoodsForm.goods_cat = this.editGoodsForm.goods_cat
          .split(",")
          .map(item => item - 0);
        // 修改attr_vals数据项
        this.editGoodsForm.attrs.forEach(item => {
          if (item.attr_sel === "many") {
            item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
          }
        });
        // 修改pics数据项
        this.editGoodsForm.pics.forEach((item, index) => {
          item.name = `第${index + 1}张图片`;
          item.url = item.pics_mid_url;
        });
      }
    },
    async getCateList() {
      const res = await getCateListData();
      if (res.meta.status !== 200) {
        this.$message.error("获取分类数据失败！");
      } else {
        this.cateList = res.data;
      }
    },
    // 监听级联选择器的切换
    handleChange() {
      if (this.editGoodsForm.goods_cat.length !== 3) {
        this.editGoodsForm.goods_cat = [];
      }
    },
    // 切换tabs页面之前的钩子
    beforeTabsLeave(activeName, oldActiveName) {
      if (oldActiveName === "0" && this.editGoodsForm.goods_cat.length !== 3) {
        this.$message.error("请先选择商品分类！");
        return false;
      }
    },
    handlePreview(file) {
      this.previewPath = file.url;
      this.previewDialogVisible = true;
    },
    handleRemove(file, fileList) {
      this.editGoodsForm.pics = fileList;
    },
    handleSuccess(response, file, fileList) {
      const fileInfo = {
        name: file.name,
        pic: response.data.tmp_path,
        url: response.data.url
      };
      this.editGoodsForm.pics.push(fileInfo);
    },
    editGoods() {
      this.$refs.editGoodsFormRef.validate(async valid => {
        if (!valid) {
          this.$message.error("请填写必要的表单项！");
        } else {
          const editGoodsInfo = _.cloneDeep(this.editGoodsForm);
          editGoodsInfo.goods_cat = editGoodsInfo.goods_cat.join(",");
          const res = await editGoods(this.goodsId, editGoodsInfo);
          if (res.meta.status !== 200) {
            if (res.meta.msg !== {}) {
              this.$message.error(`${res.meta.msg}！`);
            } else {
              this.$message.error("修改商品信息失败！");
            }
          } else {
            this.$message.success("修改商品信息成功！");
            this.$router.push("/goods");
          }
        }
      });
    }
  },
  created() {
    this.goodsId = this.$route.params.id;
    this.getGoodsInfo();
    this.getCateList();
  }
};
</script>

<style scoped>
.preview-img {
  width: 100%;
}

.btn-edit-goods {
  margin-top: 15px;
}
</style>