export abstract class Schedule {
    static modelName = 'projectInsights';
    static selector = {
      id: 'id',
      component: 'component',
      title: 'title',
      tasks: 'tasks',
      ruleName: 'ruleName',
      msg: 'msg'
    };
    static relation= {};
}