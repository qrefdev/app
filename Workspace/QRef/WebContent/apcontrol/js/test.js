var testElement = {person: {name: "aaron", age: "26", sex: "M"}};
var testElement2 = {person: {name: "relisa", age: "19", sex: "F"}};
var testElement3 = {person: {name: "debra", age: "30", sex: "F"}};
var testElement4 = {person: {name: "alex", age: "22", sex: "M"}};
var testElement5 = {person: {name: "alex", age: "30", sex: "F"}};
var testElement6 = {person: {name: "aaron", age: "22", sex: "F"}};

var testArray = new SortableArray([testElement3,testElement2,testElement4,testElement,testElement5,testElement2,testElement5,testElement,testElement6,testElement2]);

var sorted = testArray.sortBy(["person.name","person.age","person.sex"]);