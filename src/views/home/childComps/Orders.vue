<template>
  <div id="orders">
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索输入框 -->
      <el-row>
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getOrdersList">
            <el-button slot="append" icon="el-icon-search" @click="getOrdersList"></el-button>
          </el-input>
        </el-col>
      </el-row>

      <!-- 订单列表数据区域 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price" width="80px"></el-table-column>
        <el-table-column label="是否付款" width="80px">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'" size="mini">已付款</el-tag>
            <el-tag type="danger" v-else size="mini">未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send" width="80px"></el-table-column>
        <el-table-column label="下单时间" width="200px">
          <template slot-scope="scope">{{ scope.row.create_time | dataFormat }}</template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template>
            <el-tooltip class="item" effect="dark" content="修改地址" placement="top" :enterable="false">
              <el-button
                type="primary"
                icon="el-icon-edit"
                size="mini"
                @click="showEditAddressDialog"
              ></el-button>
            </el-tooltip>
            <el-tooltip class="item" effect="dark" content="物流信息" placement="top" :enterable="false">
              <el-button
                type="success"
                icon="el-icon-location"
                size="mini"
                @click="showLogisticsInfoDialog"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 修改地址的对话框 -->
    <el-dialog
      title="修改地址"
      :visible.sync="editAddressDialogVisible"
      width="50%"
      @close="editAddressDialogClose"
    >
      <el-form
        :model="editAddressForm"
        :rules="editAddressFormRules"
        ref="editAddressFormRef"
        label-width="100px"
      >
        <el-form-item label="省市区/县" prop="region">
          <el-cascader
            v-model="editAddressForm.region"
            :options="cityData"
            :props="cascaderProps"
            :key="editAddressForm.region.join(',')"
          ></el-cascader>
        </el-form-item>
        <el-form-item label="详细地址" prop="address">
          <el-input v-model="editAddressForm.address"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editAddressDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editAddressDialogVisible = false">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 物流信息的对话框 -->
    <el-dialog title="查看物流信息" :visible.sync="logisticsInfoDialogVisible" width="50%">
      <!-- 使用el-steps展示物流信息 -->
      <!-- <el-steps direction="vertical" :active="0">
        <el-step v-for="stepItem in logisticsInfo" :title="stepItem.ftime" :description="stepItem.context"></el-step>
      </el-steps>-->

      <!-- 使用el-timeline展示物流信息 -->
      <el-timeline>
        <el-timeline-item
          v-for="(activity, index) in logisticsInfo"
          :key="index"
          :timestamp="activity.ftime"
        >{{activity.context}}</el-timeline-item>
      </el-timeline>
    </el-dialog>
  </div>
</template>

<script>
import { getOrdersListData, getlogisticsInfoData } from "network/home";
import cityData from "common/citydata";

export default {
  name: "Orders",
  data() {
    return {
      searchInfo: "",
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 10
      },
      ordersList: [],
      total: 0,
      editAddressDialogVisible: false,
      editAddressForm: {
        region: [],
        address: ""
      },
      editAddressFormRules: {
        region: [
          { required: "true", message: "请选择地区！", trigger: "blur" }
        ],
        address: [
          { required: "true", message: "请填写详细地址！", trigger: "blur" }
        ]
      },
      cascaderProps: {
        value: "value",
        label: "label",
        children: "children"
      },
      options: "",
      logisticsInfoDialogVisible: false,
      logisticsInfo: [],
      cityData
    };
  },
  methods: {
    async getOrdersList() {
      const res = await getOrdersListData(this.queryInfo);
      if (res.meta.status !== 200) {
        this.$message.error("获取订单列表失败！");
      } else {
        this.ordersList = res.data.goods;
        this.total = res.data.total;
      }
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize;
      this.getOrdersList();
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage;
      this.getOrdersList();
    },
    showEditAddressDialog() {
      this.editAddressDialogVisible = true;
    },
    async showLogisticsInfoDialog() {
      const res = await getlogisticsInfoData(1106975712662);
      if (res.meta.status !== 200) {
        this.$message.error("获取物流信息失败！");
      } else {
        this.logisticsInfo = res.data;
        this.logisticsInfoDialogVisible = true;
      }
    },
    editAddressDialogClose() {
      this.$refs.editAddressFormRef.resetFields();
    }
  },
  created() {
    this.getOrdersList();
  }
};
</script>

<style scoped>
.el-cascader {
  width: 100%;
}
</style>