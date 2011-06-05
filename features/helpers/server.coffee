#
# Helper to start and stop the test server in the example app
#

Steps = require('cucumis').Steps
childProcess = require 'child_process'
net = require 'net'

srv = null

this.start = (cb) ->
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

global.server = this
