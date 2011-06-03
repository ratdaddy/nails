Feature: Run the server
	As a nails developer
	I want to issue a command to run the server for my app
	So that it is easy to start my app

	Scenario: Running the server
		Given an example application
		When I issue the nails server command
		Then I can get a page from the server
