Steps = require('cucumis').Steps;

Steps.Given(/^I run my program$/, function (ctx) {
	ctx.done();
});

Steps.When(/^I do something$/, function (ctx) {
	ctx.done();
});

Steps.Then(/^This test will pass$/, function (ctx) {
		true.should.be.true;
		ctx.done();
});

Steps.export(module);
