(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-dfd1a008"],{a21f:function(e,t,n){var o=n("584a"),a=o.JSON||(o.JSON={stringify:JSON.stringify});e.exports=function(e){return a.stringify.apply(a,arguments)}},d761:function(e,t,n){"use strict";n.r(t);var o=n("f499"),s=n.n(o),a=n("5d73"),r=n.n(a),u=n("cebc"),c=n("1273"),i={props:{tableData:{default:function(){return[]}},loading:{default:!1},selecOption:{default:function(){return[]}}},mounted:function(){},data:function(){return{options:{stripe:!0},factory:[{value:"王小虎",label:"王小虎"}],choiceFactory:"1",columns:[{title:"名称",key:"name",width:120},{title:"时薪",key:"dincome",width:100},{title:"日时间段",key:"dtime"},{title:"夜工资",key:"nincome",width:100},{title:"夜时间段",key:"ntime"},{title:"收益",key:"revenue",width:80},{title:"花费",key:"cost",width:80},{title:"所属工厂",key:"factoryName"},{title:"备注",key:"des"}],rowHandle:{columnHeader:"编辑表格",edit:{icon:"el-icon-edit",text:"编辑",size:"small",show:function(e,t){return!!t.showEditButton},disabled:function(e,t){return!!t.forbidEdit}},remove:{icon:"el-icon-delete",size:"small",fixed:"right",confirm:!0,show:function(e,t){return!!t.showRemoveButton},disabled:function(e,t){return!!t.forbidRemove}}},addTemplate:{name:{title:"名称",value:"",component:{placeholder:"请输入内容",span:6.5}},parent:{title:"所属工厂",value:"",component:{name:"el-select",options:this.selecOption,span:12,offset:2}},dincome:{title:"白班工资",value:"",component:{name:"el-input-number"}},dtime:{title:"日时间段",value:""},nincome:{title:"夜班工资",value:"",component:{name:"el-input-number"}},ntime:{title:"夜时间段",value:""},revenue:{title:"收益",value:"",component:{name:"el-input-number"}},cost:{title:"成本",value:"",component:{name:"el-input-number"}},des:{title:"备注",value:""},forbidEdit:{title:"禁用按钮",value:!1,component:{show:!1}},showEditButton:{title:"显示按钮",value:!0,component:{show:!1}}},editTemplate:{name:{title:"名称",value:"",component:{placeholder:"请输入内容",span:6.5}},dincome:{title:"白班工资",value:"",component:{name:"el-input-number"}},dtime:{title:"日时间段",value:""},nincome:{title:"夜班工资",value:"",component:{name:"el-input-number"}},ntime:{title:"夜时间段",value:""},revenue:{title:"收益",value:"",component:{name:"el-input-number"}},cost:{title:"成本",value:"",component:{name:"el-input-number"}},des:{title:"备注",value:""},forbidEdit:{title:"禁用按钮",value:!1,component:{show:!1}},showEditButton:{title:"显示按钮",value:!0,component:{show:!1}}},formOptions:{labelWidth:"80px",labelPosition:"left",saveLoading:!1},currentTableData:[],multipleSelection:[]}},watch:{tableData:{handler:function(e){this.currentTableData=e},immediate:!0},selecOption:{handler:function(e){this.selecOption=e,this.addTemplate.parent.component.options=this.selecOption},immediate:!0}},methods:{handleRowAdd:function(t,n){var o=this;this.formOptions.saveLoading=!0,delete t.forbidEdit,delete t.showRemoveButton,delete t.showEditButton;var e=!0,a=!1,i=void 0;try{for(var l,s=r()(this.selecOption);!(e=(l=s.next()).done);e=!0){var d=l.value;d.value==t.parent&&(t.parent=d.origin,t.factoryName=d.label)}}catch(e){a=!0,i=e}finally{try{e||null==s.return||s.return()}finally{if(a)throw i}}Object(c.a)("Vocation").save(Object(u.a)({},t)).then(function(e){o.formOptions.saveLoading=!1,t.origin=e,t.showEditButton=!0,t.showRemoveButton=!0,o.currentTableData.push(t),o.$message({message:"添加成功",type:"success"}),n()},function(e){o.formOptions.saveLoading=!1,o.$message({message:e.message,type:"error"})})},addRow:function(){this.$refs.d2Crud.showDialog({mode:"add"})},handleEdit:function(e,t){},handleRowRemove:function(e,t){var n=this,o=e.index;e.row.origin.destroy().then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(o,1),n.$message({message:"删除成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"}),t()})},handleSwitchChange:function(e,t){var n=this.currentTableData[t];this.$set(this.currentTableData,t,Object(u.a)({},n,{type:e}))},handleSelectionChange:function(e){this.multipleSelection=e},downloadDataTranslate:function(e){return e.map(function(e){return Object(u.a)({},e,{type:e.type?"禁用":"正常",used:e.used?"已使用":"未使用"})})},handleDownloadXlsx:function(e){var t=this;this.$export.excel({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出表格成功")})},handleDownloadCsv:function(e){var t=this;this.$export.csv({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出CSV成功")})},handleDialogOpen:function(e){var t=e.mode;e.row;this.$message({message:"打开模态框，模式为："+t,type:"success"})},handleRowEdit:function(e,t){var n=this,o=e.index,a=e.row;this.formOptions.saveLoading=!0;var i=a.origin,l=JSON.parse(s()(a));delete l.origin,delete l.showEditButton,delete l.showRemoveButton,delete l.forbidEdit,l.parent=a.parent,i.save(Object(u.a)({},l)).then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(o,1,a),n.$message({message:"编辑成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"})})},handleDialogCancel:function(e){this.$message({message:"取消编辑",type:"warning"}),e()}}},l=n("2877"),d=Object(l.a)(i,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("d2-crud",{ref:"d2Crud",attrs:{options:e.options,columns:e.columns,data:e.currentTableData,rowHandle:e.rowHandle,"edit-title":"修改","add-template":e.addTemplate,"edit-template":e.editTemplate,"form-options":e.formOptions,"selection-row":""},on:{"dialog-open":e.handleDialogOpen,"row-edit":e.handleRowEdit,"row-remove":e.handleRowRemove,"row-add":e.handleRowAdd,"dialog-cancel":e.handleDialogCancel,"selection-change":e.handleSelectionChange}},[n("el-button",{staticStyle:{"margin-bottom":"5px"},attrs:{slot:"header"},on:{click:e.addRow},slot:"header"},[e._v("新增")])],1)],1)},[],!1,null,null,null);t.default=d.exports},f499:function(e,t,n){e.exports=n("a21f")}}]);