Steps = require('cucumis').Steps

tobi = require 'tobi'

puts = console.log

Steps.Given /^an example application$/, (ctx) ->
	ctx.done()

Steps.When /^I issue the nails server command$/, (ctx) ->
	server.start ctx.done

Steps.Then /^I can get a page from the server$/, (ctx) ->
	visit '/index.html', (res, $) ->
		$('h1').should.have.text /^Nails/
		ctx.done()

visit = (path, callback) ->
	browser = tobi.createBrowser 3000, 'localhost'
	browser.get path, (res, $) ->
		res.should.have.status(200)
		callback res, $

Steps.export module
