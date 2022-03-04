function breakIntoComponents(inputString){ //this needs more work
    //first, we must first remove all line breaks and whitespace. we also assume that user written with semi colons...
    inputString = inputString.replace(/\n/g, '');
    inputString = inputString.split(/(;)/g);
    // inputString.match(/[^\;]+\;?|\;/g);
    var outputArray = new Array();

    for(x = 0; x < inputString.length; x++){
        var temp = inputString[x].split(/([}{])/g);
        for(index = 0; index < temp.length; index++){
            outputArray.push(temp[index]);
        }
    }
    //we need to do all of this because im terrible with regex.
    outputArray = trimStringInArray(outputArray);
    outputArray = removeEmptyIndices(outputArray);
    outputArray = combineSemiColonsWithPreviousLines(outputArray);
    outputArray = splitIntoTokens(outputArray);
    outputArray = removeEmptyIndices(outputArray);
    return outputArray;
}
function splitIntoTokens(array){
    var newArray = new Array();

    for(var index = 0; index< array.length; index++){
        if(isFunction(array[index])){
            var temp = array[index].split(/(function)/gm);
            console.log("temp",temp);
            for(var x = 0; x < temp.length; x++){
                newArray.push(temp[x]);
            }
        }
        if(array[index].match("var ")){
            var temp = array[index].split(/(var)/gm);
            console.log("temp",temp);
            for(var x = 0; x < temp.length; x++){
                newArray.push(temp[x]);
            }
        }
        else{
            newArray.push(array[index]);
        }
}
    return newArray;
}
function combineSemiColonsWithPreviousLines(array){
    var newArray = new Array();
    for(index = 0; index < array.length; index++){
        if(array[index].match(";")){
            var temp = array[index - 1] + array[index];
            newArray.push(temp);
        }else if(!array[index+1].match(";")){
            newArray.push(array[index]);
        }
    }
    return newArray;
}
function trimStringInArray(array){
    for(index = 0; index < array.length; index++){
        array[index].trim(); 
    }
    return array;
}
function removeEmptyIndices(array){ //clean array if nothing is detected on indexes
    var newArray = new Array();
    for(index = 0; index < array.length; index++){
        if(!(array[index].trim().length === 0)){
            newArray.push(array[index]);
        }
    }
    return newArray;
}
function findEOFLine(array, start){ //raw string -> breakIntoComponents() first. start is the index of the array where a function declartion is detected.
    var count = 0;
    var endLine = -1;
    for(index = start; index < array.length; index++){
        if(array[index].search("{") > -1){
            count = count + 1;
        }
        if(array[index].search("}") > -1){
            count = count - 1;
        }
        if(count === 0 && array[index].search("}") > -1){
            endLine = index;
            break;
        }
        // console.log(count);
    }
    return endLine;
}