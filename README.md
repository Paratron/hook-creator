# Hook Creator
This module helps creating react hooks for your application. The hooks can return any type of data and
can work with any type of arguments. The module helps you in processing and updating the return values
of your hooks.

### Example usage
```jsx harmony
import {createHook} from 'hook-creator';

/**
 * The first argument needs to be the name of the hook - this is for debugging reasons.
 * The second argument is a curried function. The outer function body receives an update function
 * directly passed from the hook creator module. The second function is your actual hook function.
 * It has all arguments you want to actually pass in your react components.
 */
const [useUsername] = createHook('useUsername', (updateHook) => (userId) => {
    // This is the fetch function. It computes the data, the hook should return.
    switch(userId){
        case 'a':
            return 'Peter Pan';
        case 'b':
            return 'Captain Hook';
        case 'c':
            return 'Mr. Smee'
    }
});
```

And here is a component that implements the hook:

```jsx harmony
const UserLabel = ({id}) => {
    const username = useUsername(id);
    return <div className="username">The username is: {username}</div>;

};
```

Now, an app could use the component like this:
```jsx harmony
const App = () => {
    <div className="app">
        <UserLabel id="a" />
        <UserLabel id="b" />
        <UserLabel id="c" />
    </div>
}
```

Which results in this output:

```html
<div className="app">
    <div className="username">The username is: Peter Pan</div>;
    <div className="username">The username is: Captain Hook</div>;
    <div className="username">The username is: Mr. Smee</div>;
</div>
```

### Actual real world usage
The above example is simple, but pointless. The real power of this module is
the ability to to trigger component updates, when the return data of the hook changes.

Lets re-create the above username hook but this time, we fetch the user name from
an API:

```jsx harmony
let cache = {};

const [useUsername] = createHook('useUsername', (updateHook) => (id) => {
    // This is because we just want to trigger _one_ network request for each user id.
    if(cache[id]){
        return cache[id];
    }

    cache[id] = [null, {loading: true}];
    
    fetch(`/users/${id}`).then(result => {
        cache[id] = [result.username, {loading: false}];
        // Update all hooks, that use this id.
        updateHook((currentId) => currentId === id);    
    });

    return cache[id];
});
``` 

This time, the hook will return two values. First, the username and second an status
object that tells the using component if the username has already been loaded, or not.

If the first call to the hook happens, creates a new cache object and triggers a GET request
to the API. As soon as the request is being answered, the new values is written to the cache
and an update for the hook is requested. The filter function makes sure that only hooks
with the current player id are being updated.

