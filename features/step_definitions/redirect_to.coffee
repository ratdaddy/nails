#
# Step definitions for the redirect test
#

Steps = require('cucumis').Steps

http = require 'http'

puts = console.log

result = null
body = ''

Steps.Given /^a running server$/, (ctx) ->
	server.start ctx.done

Steps.When /^I issue the test redirect command$/, (ctx) ->
	req = http.get { host: 'localhost', port: 3000, path: '/tests/redirect' }, (res) ->
		result = res
		res.on 'data', (chunk) ->
			body += chunk.toString()
		res.on 'end', ->
			ctx.done()
	
Steps.Then /^I get a redirect to a new page$/, (ctx) ->
	result.should.have.status 303
	result.should.have.header 'Location', '/tests/redirect_to'
	body.length.should.equal 0
	ctx.done()

Steps.export module
