/*
 * Software: PCbi / tools / converter / obj2component
 * 
 */

"use strict";

// Generates a version 4 UUID and returns it as a string. Adapted with
// superficial modifications from https://stackoverflow.com/a/2117523,
// which is based on https://gist.github.com/jed/982883.
function generate_uuid_v4()
{
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c=>(c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}
