# Url Save State
Save and read the state of a form or individual inputs to and from the URL query string.

# Elements
### form
`data-watch=[form|input]`
Use `data-watch="form"` at the form level, for all inputs on a form. 

`data-watch-onload=[callback function]`
Use this if you want to perform some action, such as getting results from form search  function.

### input
Use `data-watch="input"` for specific inputs on a form.

### select
`data-watch-select=[value|label]`
Use this on a select to pick the saved data from the list, either by value or by label. By default it selects by value.
