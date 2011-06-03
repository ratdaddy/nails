Steps = require('cucumis').Steps

tobi = require 'tobi'
childProcess = require 'child_process'
net = require 'net'

puts = console.log

Steps.Given /^an example application$/, (ctx) ->
	ctx.done()

srv = null

Steps.When /^I issue the nails server command$/, (ctx) ->
	srv = childProcess.spawn '../bin/nails', ['server'], { cwd: 'example' }
	waitForServer ctx.done

Steps.Runner.on 'afterTest', (cb) ->
	srv.kill 'SIGINT'
	cb()

waitForServer = (cb) ->
	sock = new net.Socket
	sock.connect 3000, 'localhost'
	sock.on 'error', ->
		setTimeout (-> waitForServer cb), 10
	sock.on 'connect', ->
		sock.end
		cb()

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
