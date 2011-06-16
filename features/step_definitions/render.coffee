Steps = require('cucumis').Steps

tobi = require 'tobi'

puts = console.log

dollar = title = pageName = null

Steps.When /^I go to the home page$/, (ctx) ->
	title = /Home Page/
	pageName = /^pages#home$/
	server.visit '/home', (res, $) ->
		dollar = $
		ctx.done()

Steps.When /^I go to the asynchronous home page$/, (ctx) ->
	title = /Asynchronous Home Page/
	pageName = /^pages#asyncHome$/
	server.visit '/async/home', (res, $) ->
		dollar = $
		ctx.done()

Steps.When /^I go to the alternate home page$/, (ctx) ->
	title = /Alternate Home Page/
	pageName = /^pages#home$/
	server.visit '/alt/home', (res, $) ->
		dollar = $
		ctx.done()

Steps.When /^I go to the asynchronous alternate home page$/, (ctx) ->
	title = /Asynchronous Alternate Home Page/
	pageName = /^pages#home$/
	server.visit '/alt/async/home', (res, $) ->
		dollar = $
		ctx.done()
	
Steps.Then /^I can see the home page$/, (ctx) ->
	dollar('title').should.have.text title
	dollar('h1').should.have.text pageName
	ctx.done()

Steps.export module
