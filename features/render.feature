Feature: Render
	As a nails developer
	I want to specify a template file to render my action
	So that I can easily create html output

	As a nails developer
	I want to specify a template file different from my action name
	So that I can reuse the same template for multiple actions

	Scenario: Render a page
		Given a running server
		When I go to the home page
		Then I can see the home page

	Scenario: Render a page asynchronously
		Given a running server
		When I go to the asynchronous home page
		Then I can see the home page

	Scenario: Render using the specified template file
		Given a running server
		When I go to the alternate home page
		Then I can see the home page

	Scenario: Render asynchronously using the specified template file
		Given a running server
		When I go to the asynchronous alternate home page
		Then I can see the home page
