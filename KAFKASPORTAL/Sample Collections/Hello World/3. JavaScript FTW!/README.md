Here have a workflow where you test something and if it's true set an environment variable(like auth token) that can be used by other APIs.

We can use scripts to further customize our workflow. These scripts get executed before sending a request and after receiving a response. 

Not just that, we can write tests in this script that can make sure `1==1` is indeed true of if the shape of the data is correct or not.

These scripts also have access to variables and can set or get anything including collection variables.