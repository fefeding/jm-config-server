<template>
    <div style="min-width: 95%;">
        <el-row>
            <el-form :inline="true">
                <el-form-item label="资金账户">
                    <el-input v-model="searchForm.accountId"></el-input>
                </el-form-item>
                <el-form-item label="uid">
                    <el-input v-model="searchForm.uid"></el-input>
                </el-form-item>
                <el-form-item label="login id">
                    <el-input v-model="searchForm.loginId"></el-input>
                </el-form-item>
                <el-form-item label="手机号">
                    <el-input v-model="searchForm.telNo"></el-input>
                </el-form-item>
                <el-form-item label="身份证号">
                    <el-input v-model="searchForm.idNo"></el-input>
                </el-form-item>

                <el-form-item>
                    <el-button type="primary" @click="searchData"
                        >查询</el-button
                    >
                </el-form-item>
            </el-form>
        </el-row>
        <el-table
            :data="userData"
            border
            stripe
            highlight-current-row
            style="width: 100%"
        >
            <el-table-column label="login id">
                <template slot-scope="scope">
                    {{ scope.row | loginId }}
                </template>
            </el-table-column>
            <el-table-column label="uid">
                <template slot-scope="scope">
                    {{ scope.row | uid }}
                </template>
            </el-table-column>
            <el-table-column label="资金账户">
                <template slot-scope="scope">
                    {{ scope.row | accountId }}
                </template>
            </el-table-column>
            <el-table-column label="券商客户号">
                <template slot-scope="scope">
                    {{ scope.row | clientId }}
                </template>
            </el-table-column>
            <el-table-column label="lctJvid">
                <template slot-scope="scope">
                    {{ scope.row.lct ? scope.row.lct.lctJvid : "-" }}
                </template>
            </el-table-column>
            <!-- <el-table-column label="姓名">
                <template slot-scope="scope">
                    {{ scope.row.cert ? scope.row.cert.name : "-" }}
                </template>
            </el-table-column> -->
            <el-table-column label="投顾id">
                <template slot-scope="scope">
                    {{ scope.row.consult ? scope.row.consult.consultId : "-" }}
                </template>
            </el-table-column>
            <el-table-column label="投顾">
                <template slot-scope="scope">
                    {{ scope.row.consult ? scope.row.consult.name : "-" }}
                </template>
            </el-table-column>
        </el-table>

        <!-- <el-pagination
      @size-change="onPageSizeChange"
      @current-change="onPageCurrentPageChange"
      :current-page="currentPage"
      :page-sizes="[10, 50, 100, 200, 300, 400, 1000]"
      :page-size="currentPageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="currentTotalCount">
    </el-pagination> -->
    </div>
</template>
<style>
.el-table .unique-row {
    background: #f0f9eb;
}
</style>
<script lang="ts" src="./userInfo.ts"></script>
