#
# Helper to start and stop the test server in the example app
#

Steps = require('cucumis').Steps
childProcess = require 'child_process'
net = require 'net'
tobi = require 'tobi'

srv = null

@start = (cb) ->
	unless srv
		srv = childProcess.spawn '../bin/nails', ['server'], { cwd: 'example' }
		waitForServer cb
	else
		cb()

Steps.Runner.on 'afterTest', (cb) ->
	srv.kill 'SIGINT' if srv
	cb()

waitForServer = (cb) ->
	sock = new net.Socket
	sock.connect 3000, 'localhost'
	sock.on 'error', ->
		setTimeout (-> waitForServer cb), 10
	sock.on 'connect', ->
		sock.end
		cb()

@visit = (path, callback) ->
	browser = tobi.createBrowser 3000, 'localhost'
	browser.get path, (res, $) ->
		res.should.have.status(200)
		callback res, $
		
global.server = @
