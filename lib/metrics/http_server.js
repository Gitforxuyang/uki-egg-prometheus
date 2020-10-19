'use strict';

const { Summary, Counter } = require('prom-client');

module.exports = app => {
  // const ResponseTime = new Summary({
  //   name: 'http_response_time_ms',
  //   help: 'ms to handle a request',
  //   labelNames: ['method', 'path', 'status', 'code', 'message'],
  // });

  /**
   * number of requests to a route
   *
   * @deprecated since version 1.1.1
   * will be deleted in version 1.2.0
   * prefer to use http_request_total
   */
  const RequestTotal = new Counter({
    name: 'http_request_total',
    help: 'number of requests to a route',
    labelNames: ['method', 'path', 'status', 'code', 'overtime', 'rt', 'message'],
  });

  // const RequestHistogram = new Histogram({
  //   name: 'http_request_histogram',
  //   help: '请求耗时的分布',
  //   labelNames: ['method', 'path', 'rt'],
  // });


  app.on('response', ctx => {
    const { method, path, status, } = ctx;
    const code = ctx.body && (ctx.body.code || ctx.body.errcode) || 0
    const message = ctx.body && (ctx.body.message || ctx.body.errmsg || ctx.body.msg)
    const rt = Date.now() - ctx.starttime;
    const body = { method, path }
    if (status != 200) {
      body.status = status
    } else if (code != 0) {
      body.code = code
      body.message = message
    }
    //请求耗时超过1s的才记录更详细的信息，为了节约资源
    if (rt > 1000) {
      body.overtime = 1
      body.rt = rt
    }
    RequestTotal.inc(body, 1)
  });
};
