(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-63246606"],{"0a90":function(e,t,n){var a=n("63b6"),o=n("10ff");a(a.G+a.F*(parseFloat!=o),{parseFloat:o})},"10ff":function(e,t,n){var a=n("e53d").parseFloat,o=n("a1ce").trim;e.exports=1/a(n("e692")+"-0")!=-1/0?function(e){var t=o(String(e),3),n=a(t);return 0===n&&"-"==t.charAt(0)?-0:n}:a},"59ad":function(e,t,n){e.exports=n("7be7")},"7be7":function(e,t,n){n("0a90"),e.exports=n("584a").parseFloat},a1ce:function(e,t,n){var s=n("63b6"),a=n("25eb"),l=n("294c"),r=n("e692"),o="["+r+"]",i=RegExp("^"+o+o+"*"),d=RegExp(o+o+"*$"),c=function(e,t,n){var a={},o=l(function(){return!!r[e]()||"​"!="​"[e]()}),i=a[e]=o?t(u):r[e];n&&(a[n]=i),s(s.P+s.F*o,"String",a)},u=c.trim=function(e,t){return e=String(a(e)),1&t&&(e=e.replace(i,"")),2&t&&(e=e.replace(d,"")),e};e.exports=c},a21f:function(e,t,n){var a=n("584a"),o=a.JSON||(a.JSON={stringify:JSON.stringify});e.exports=function(e){return o.stringify.apply(o,arguments)}},a449:function(e,t,n){"use strict";n.r(t);var a=n("59ad"),l=n.n(a),o=n("f499"),r=n.n(o),d=n("cebc"),i=n("1273"),s={props:{tableData:{default:function(){return[]}},loading:{default:!1}},data:function(){return{options:{stripe:!0},columns:[{title:"编号",key:"serial",width:80},{title:"名称",key:"name",width:120},{title:"简称",key:"shortName",width:80},{title:"行业",key:"industry"},{title:"地址",key:"address"},{title:"联系人",key:"contackName",width:80},{title:"电话",key:"contackPhone"},{title:"备注",key:"des",showOverflowTooltip:!0}],rowHandle:{columnHeader:"编辑表格",edit:{icon:"el-icon-edit",text:"编辑",size:"small",show:function(e,t){return!!t.showEditButton},disabled:function(e,t){return!!t.forbidEdit}},remove:{icon:"el-icon-delete",size:"small",fixed:"right",confirm:!0,show:function(e,t){return!!t.showRemoveButton},disabled:function(e,t){return!!t.forbidRemove}}},addTemplate:{serial:{title:"编号",value:""},name:{title:"工厂名称",value:""},shortName:{title:"简称",value:""},industry:{title:"行业",value:""},address:{title:"地址",value:""},contackName:{title:"联系人",value:""},contackPhone:{title:"电话",value:""},des:{title:"备注",value:""}},editTemplate:{serial:{title:"编号",value:""},name:{title:"工厂名称",value:""},shortName:{title:"简称",value:""},industry:{title:"行业",value:""},address:{title:"地址",value:""},contackName:{title:"联系人",value:""},contackPhone:{title:"电话",value:""},des:{title:"备注",value:""}},formOptions:{labelWidth:"80px",labelPosition:"left",saveLoading:!1},currentTableData:[],multipleSelection:[]}},watch:{tableData:{handler:function(e){this.currentTableData=e},immediate:!0}},methods:{handleRowAdd:function(t,n){var a=this;this.formOptions.saveLoading=!0,delete t.forbidEdit,delete t.showRemoveButton,delete t.showEditButton,Object(i.a)("Factory").save(Object(d.a)({},t)).then(function(e){a.formOptions.saveLoading=!1,t.origin=e,t.showEditButton=!0,t.showRemoveButton=!0,t.createdAt=e.createdAt,a.currentTableData.push(t),a.$message({message:"添加成功",type:"success"}),n()},function(e){a.formOptions.saveLoading=!1,a.$message({message:e.message,type:"error"})})},addRow:function(){this.$refs.d2Crud.showDialog({mode:"add"})},handleRowRemove:function(e,t){var n=this,a=e.index,o=e.row;o.origin.destroy().then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(a,1),n.$message({message:"删除成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"}),t()})},handleSwitchChange:function(e,t){var n=this.currentTableData[t];this.$set(this.currentTableData,t,Object(d.a)({},n,{type:e}))},handleSelectionChange:function(e){this.multipleSelection=e},downloadDataTranslate:function(e){return e.map(function(e){return Object(d.a)({},e,{type:e.type?"禁用":"正常",used:e.used?"已使用":"未使用"})})},handleDownloadXlsx:function(e){var t=this;this.$export.excel({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出表格成功")})},handleDownloadCsv:function(e){var t=this;this.$export.csv({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出CSV成功")})},handleDialogOpen:function(e){var t=e.mode;e.row;this.$message({message:"打开模态框，模式为："+t,type:"success"})},handleRowEdit:function(e,t){var n=this,a=e.index,o=e.row;this.formOptions.saveLoading=!0;var i=o.origin,s=JSON.parse(r()(o));delete s.origin,delete s.showEditButton,delete s.showRemoveButton,delete s.forbidEdit,i.save(Object(d.a)({},s,{dincome:l()(o.dincome),nincome:l()(o.nincome),revenue:l()(o.revenue),cost:l()(o.cost)})).then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(a,1,o),n.$message({message:"编辑成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"})})},handleDialogCancel:function(e){this.$message({message:"取消编辑",type:"warning"}),e()}}},c=n("2877"),u=Object(c.a)(s,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("d2-crud",{ref:"d2Crud",attrs:{options:e.options,columns:e.columns,data:e.currentTableData,rowHandle:e.rowHandle,"edit-title":"我的修改","add-template":e.addTemplate,"edit-template":e.editTemplate,"form-options":e.formOptions,"selection-row":""},on:{"dialog-open":e.handleDialogOpen,"row-edit":e.handleRowEdit,"row-remove":e.handleRowRemove,"row-add":e.handleRowAdd,"dialog-cancel":e.handleDialogCancel,"selection-change":e.handleSelectionChange}},[n("el-button",{staticStyle:{"margin-bottom":"5px"},attrs:{slot:"header"},on:{click:e.addRow},slot:"header"},[e._v("新增")])],1)],1)},[],!1,null,null,null);t.default=u.exports},e692:function(e,t){e.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},f499:function(e,t,n){e.exports=n("a21f")}}]);