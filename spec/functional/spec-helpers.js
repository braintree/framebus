global.toParentFrame = function(browser, cb) {
  browser._jsonWireCall(
    {
    method: 'POST',
    relPath: '/frame/parent',
    data: {},
    cb: cb
  })
}
