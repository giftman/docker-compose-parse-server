import Parse from 'parse';
//生成数据报表
export  class Report extends Parse.Object {
    constructor() {
        // Pass the ClassName to the Parse.Object constructor
        super('Report');
        // All other initialization
        this.user = 'Rawr';
    }
    spawn({uptimes,downtimes,uphours,calIncome,realIncome,month}) {
        // Report.name = data.name
        console.log(uptimes)
        this.set('parent',Parse.User.current())
        //考勤天数
        this.set('uptimes',uptimes)
        this.set('downtimes',downtimes)
        this.set('uphours',uphours)
        this.set('calIncome',calIncome)
        this.set('realIncome',realIncome)
        this.set('month',month)

        //这两个先搬到User属性
        //营利 因为招其它人所获得的利润 这个与工作时间，工种无关，只与招的人有关
        // this.set('revenue',revenue)
        // //员工数量 招了多少人
        // this.set('count',0)
    }
}


