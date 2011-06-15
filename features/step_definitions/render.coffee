Steps = require('cucumis').Steps

tobi = require 'tobi'

puts = console.log

dollar = title = null

Steps.When /^I go to the home page$/, (ctx) ->
	title = /Home Page/
	server.visit '/home', (res, $) ->
		dollar = $
		ctx.done()

Steps.When /^I go to the alternate home page$/, (ctx) ->
	title = /Alternate Home Page/
	server.visit '/alt/home', (res, $) ->
		dollar = $
		ctx.done()

Steps.Then /^I can see the home page$/, (ctx) ->
	dollar('title').should.have.text title
	dollar('h1').should.have.text /^pages#home$/
	ctx.done()

Steps.export module
