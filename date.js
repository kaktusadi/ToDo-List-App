//jshint esversion:6

//console.log(module);
//module.exports = "Hello world";
//module.exports = getDate; // export tego, zeby w app.js mozna bylo uzywac

//module. //to jest do tego ponizej ze module.exports, ale w node mozna to uciac
exports.getDate = getDate; // nie exportujemy calego obiektu, tylko czesc w porownaniu wyzej


function getDate() {

const today = new Date(); //js funkcja

const options = {
weekday: "long",
day: "numeric",
month: "long"
};

return today.toLocaleDateString("en-US", options);
}



//inny sposob deklaracji funkcji w js to samo, co wyzej
exports.getDate = function() {

const today = new Date(); //js funkcja

const options = {
weekday: "long"
};

return today.toLocaleDateString("en-US", options); // ponizej ze zmienna, ale nie trzeba
// let day = today.toLocaleDateString("en-US", options);
// return day;
};
