(window.webpackJsonp=window.webpackJsonp||[]).push([["chunk-4d5c5392"],{a21f:function(e,t,n){var o=n("584a"),a=o.JSON||(o.JSON={stringify:JSON.stringify});e.exports=function(e){return a.stringify.apply(a,arguments)}},b8eb:function(e,t,n){"use strict";n.r(t);var o=n("f499"),s=n.n(o),a=n("5d73"),r=n.n(a),c=n("cebc"),u=(n("cadf"),n("551c"),n("097d"),n("1273")),i={props:{tableData:{default:function(){return[]}},loading:{default:!1},selecOption:{default:function(){return[]}}},mounted:function(){this.$refs.d2Crud.$forceUpdate()},data:function(){return{options:{stripe:!0},factory:[{value:"王小虎",label:"王小虎"}],choiceFactory:"1",columns:[{title:"名称",key:"name",width:120},{title:"身份证",key:"idcard",width:120},{title:"分成",key:"percentage",width:80},{title:"性别",key:"sex",width:80},{title:"年龄",key:"age",width:80},{title:"地址",key:"address",width:80,showOverflowTooltip:!0},{title:"教育",key:"edcation",width:80},{title:"特长及工作年限",key:"des",showOverflowTooltip:!0},{title:"履历",key:"person_detail",showOverflowTooltip:!0},{title:"岗位",key:"job",width:80}],rowHandle:{columnHeader:"编辑表格",edit:{icon:"el-icon-edit",text:"编辑",size:"small",show:function(e,t){return!!t.showEditButton},disabled:function(e,t){return!!t.forbidEdit}},remove:{icon:"el-icon-delete",size:"small",fixed:"right",confirm:!0,show:function(e,t){return!!t.showRemoveButton},disabled:function(e,t){return!!t.forbidRemove}}},addTemplate:{name:{title:"名称",value:"",component:{placeholder:"请输入内容",span:6.5}},percentage:{title:"分成",value:"",component:{name:"el-input-number",span:12,offset:2}},idcard:{title:"身份证",value:""},phone:{title:"电话",value:""},age:{title:"年龄",value:""},education:{title:"教育",value:""},address:{title:"地址",value:""},person_detail:{title:"履历",value:""},des:{title:"特长及工作年限",value:""}},editTemplate:{name:{title:"名称",value:"",component:{placeholder:"请输入内容",span:6.5}},job:{title:"工作岗位",value:"",component:{name:"el-select",options:this.selecOption,span:12,offset:2}},percentage:{title:"分成",value:"",component:{name:"el-input-number",span:5}},worknight:{title:"夜班",value:"",component:{name:"el-switch",span:10,offset:4}},idcard:{title:"身份证",value:""},phone:{title:"电话",value:""},age:{title:"年龄",value:""},education:{title:"教育",value:""},address:{title:"地址",value:""},person_detail:{title:"履历",value:""},des:{title:"特长及工作年限",value:""},forbidEdit:{title:"禁用按钮",value:!1,component:{show:!1}},showEditButton:{title:"显示按钮",value:!0,component:{show:!1}}},formOptions:{labelWidth:"80px",labelPosition:"left",saveLoading:!1},currentTableData:[],multipleSelection:[]}},watch:{tableData:{handler:function(e){this.currentTableData=e},immediate:!0},selecOption:{handler:function(e){this.selecOption=e,this.editTemplate.job.component.options=this.selecOption},immediate:!0}},methods:{handleRowAdd:function(t,n){var o=this;this.formOptions.saveLoading=!0,delete t.forbidEdit,delete t.showRemoveButton,delete t.showEditButton;var e=!0,a=!1,i=void 0;try{for(var l,s=r()(this.selecOption);!(e=(l=s.next()).done);e=!0){var d=l.value;d.value==t.parent&&(t.job=d.origin,t.jobName=d.label)}}catch(e){a=!0,i=e}finally{try{e||null==s.return||s.return()}finally{if(a)throw i}}Object(u.c)().signUp(Object(c.a)({username:t.idcard,password:"123456"},t)).then(function(e){o.formOptions.saveLoading=!1,t.origin=e,t.showEditButton=!0,t.showRemoveButton=!0,o.currentTableData.splice(0,0,t),Object(u.k)().then(),o.$message({message:"添加成功",type:"success"}),n()},function(e){o.formOptions.saveLoading=!1,o.$message({message:e.message,type:"error"})})},addRow:function(){this.$refs.d2Crud.showDialog({mode:"add"})},updateRato:function(){var t=this;Object(u.b)().then(function(e){t.$message({message:"更新成功",type:"success"})})},handleEdit:function(e,t){},handleRowRemove:function(e,t){var n=this,o=e.index,a=e.row.origin;Object(u.d)({id:a.id}).then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(o,1),n.$message({message:"删除成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"}),t()})},handleSwitchChange:function(e,t){var n=this.currentTableData[t];this.$set(this.currentTableData,t,Object(c.a)({},n,{type:e}))},handleSelectionChange:function(e){this.multipleSelection=e},downloadDataTranslate:function(e){return e.map(function(e){return Object(c.a)({},e,{type:e.type?"禁用":"正常",used:e.used?"已使用":"未使用"})})},handleDownloadXlsx:function(e){var t=this;this.$export.excel({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出表格成功")})},handleDownloadCsv:function(e){var t=this;this.$export.csv({title:"D2Admin 表格示例",columns:this.downloadColumns,data:this.downloadDataTranslate(e)}).then(function(){t.$message("导出CSV成功")})},handleDialogOpen:function(e){var t=e.mode;e.row;this.$message({message:"打开模态框，模式为："+t,type:"success"})},handleRowEdit:function(e,t){var n=this,o=e.index,a=e.row;this.formOptions.saveLoading=!0;var i=a.origin,l=JSON.parse(s()(a));delete l.origin,delete l.showEditButton,delete l.showRemoveButton,delete l.forbidEdit,Object(u.l)(Object(c.a)({id:i.id},l)).then(function(e){n.formOptions.saveLoading=!1,n.currentTableData.splice(o,1,a),n.$message({message:"编辑成功",type:"success"}),t()},function(e){n.formOptions.saveLoading=!1,n.$message({message:e.message,type:"error"})})},handleDialogCancel:function(e){this.$message({message:"取消编辑",type:"warning"}),e()}}},l=n("2877"),d=Object(l.a)(i,function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("d2-crud",{ref:"d2Crud",attrs:{options:e.options,columns:e.columns,data:e.currentTableData,rowHandle:e.rowHandle,"edit-title":"修改","add-template":e.addTemplate,"edit-template":e.editTemplate,"form-options":e.formOptions,"selection-row":""},on:{"dialog-open":e.handleDialogOpen,"row-edit":e.handleRowEdit,"row-remove":e.handleRowRemove,"row-add":e.handleRowAdd,"dialog-cancel":e.handleDialogCancel,"selection-change":e.handleSelectionChange}},[n("el-button",{staticStyle:{"margin-bottom":"5px"},attrs:{slot:"header"},on:{click:e.addRow},slot:"header"},[e._v("新增")]),n("el-button",{staticStyle:{"margin-bottom":"5px"},attrs:{slot:"header"},on:{click:e.updateRato},slot:"header"},[e._v("更新分成")])],1)],1)},[],!1,null,null,null);t.default=d.exports},f499:function(e,t,n){e.exports=n("a21f")}}]);