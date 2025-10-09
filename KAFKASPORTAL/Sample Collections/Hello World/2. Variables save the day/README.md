In this collection we have set a variabled called `endpoint` and in the "Requesly Testing" environment you will find a variable called `base_url`. We will be using them together to send a request.

You can create variables to centralize common data, and this can be done in two ways, Environments & Collection Variables.

## Environment Variables
An Environment closely mimics the idea of `"staging`, `"dev"` or `"production"`. It's an isolated space where you can keep common stuff in a common bucket.This gets useful when you want to swap out the bucket whenever you want. 

## Collection Variables
Here you can keep the base data that doesn't rely on environment and will stay the same but is used in multiple places. The variables are essentially a property of a collection and hence can't be swapped out.