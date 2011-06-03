Steps = require('cucumis').Steps
require.paths.unshift '../rd-tobi/lib'
jsdom = require 'jsdom'
http = require 'http'
tobi = require 'tobi'
childProcess = require 'child_process'
net = require 'net'

puts = console.log

srv = null

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

Steps.Given /^an example application$/, (ctx) ->
	ctx.done()

Steps.When /^I issue the nails server command$/, (ctx) ->
	srv = childProcess.spawn '../bin/nails', ['server'], { cwd: 'example' }
	waitForServer ctx.done

Steps.Then /^I can get a page from the server$/, (ctx) ->
#	visit '/index.html', (dom) ->
#		dom.$('h1').html().should.include.string 'Nails'
	visit '/indexhtml', (res, $) ->
		$('h1').should.have.text /^Nails/
		ctx.done()

visit = (path, callback) ->
	browser = tobi.createBrowser 3000, 'localhost'
	browser.get path, (res, $) ->
		#if res.statusCode >= 400
			#res.on 'end', ->
				#res.should.have.status(200)
				#callback res, $
		#else
			res.should.have.status(200)
			callback res, $


visit_jsdom = (path, callback) ->
	get path, (html) ->
		window = jsdom.jsdom(html).createWindow()
		jsdom.env html, ['http://code.jquery.com/jquery-1.5.min.js'], (errors, window) ->
			callback window

get = (path, callback) ->
	options =
		host: 'localhost'
		port: 3000
		path: path

	clientReq = http.get options, (res) ->
		data = ''

		res.on 'data', (chunk) ->
			data += chunk.toString()

		res.on 'end', ->
			throw new Error(res.statusCode + ': ' + data) if  res.statusCode != 200
			callback data

Steps.export module
