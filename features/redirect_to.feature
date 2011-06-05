Feature: Redirect
	As a nails developer
	I want to specify a redirect
	So that I can direct a user to another page rather than rendering the default one.

	Scenario: Redirecting to another page
		Given a running server
		When I issue the test redirect command
		Then I get a redirect to a new page
