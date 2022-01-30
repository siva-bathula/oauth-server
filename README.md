
# Coding Assessment, for simple OAuth

This project creates a REST API, for authentication and
authorization of users. The endpoint http://localhost:32223/login/
is used for authenticating a user. A set of access token and refresh token
are allotted to the user. The user has to authorize his request
using http://localhost:32223/authorize which will tell whether a 
request is valid or not, and whether the user has access to a resource.
For further securing the refresh token from CSRF attacks, an additional CSRF token
can be added when using within a web application scenario, which can then be
added to the headers.
## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT`

`ACCESS_TOKEN_SECRET`
`ACCESS_TOKEN_LIFE`
`REFRESH_TOKEN_SECRET`
`REFRESH_TOKEN_LIFE`

