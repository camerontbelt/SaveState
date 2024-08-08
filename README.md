# Save State
Save and read the state of a form or individual inputs to and from the URL query string or browser cache.

### Add to your project
`<script src="https://cdn.jsdelivr.net/gh/camerontbelt/SaveState/SaveState.js"></script>`

### form
`data-watch-[url|cache]="[form|input]"`
Use `data-watch-[url|cache]="form"` at the form level, for all inputs on a form.

Use `data-watch-url="form"` to read/write to the query string in the address bar.  
Use `data-watch-cache="form"` to read/write to the browser cache.

`data-watch-onload=[callback function name]`
Use this if you want to perform some action, such as getting results from form search  function.

### input
Use `data-watch-[url|cache]="input"` for specific inputs on a form. Can also be used on selects.

Use `data-watch-url="input"` to read/write to the query string in the address bar.
Use `data-watch-cache="input"` to read/write to the browser cache.

### select
`data-watch-select=[value|label]`
Use this on a select to pick the saved data from the list of options in the select, either by value or by label. By default it selects by value.

`data-watch-select-onload=[callback function name]`
Use this to tell SaveState.js to call this function first before calling the form onload function. If you are dynamically loading the select elements with data, use this to explicitly wait for that data to load first before moving on to perform some action on the form as a whole.
