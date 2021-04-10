// jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js"); //modul nasz plik z data przeniesiony z geta stad do zewn. pliku

//console.log(date);

const app = express();

// nie zmienna, a tablica, zeby nie zamienial ostatniego rekordu w todo liscie tylko dopisywal kolejny
let items = ["Buy Food", "Do Some Tasks"]; // stworzona poza postem, zeby redirect chodzil dobrze. czyli zdefiniowac tu, a tam sie odnosic
let workItems =[];


app.set('view engine', 'ejs'); // use ejs as view engine

app.use(bodyParser.urlencoded({extended: true})); // trzeba okreslic, ze tego uzywamy a chcemy parsowac tu body.name z html do posta serwera
app.use(express.static("public")); // dodajemy css i inne folderze public do projektu bo to express

app.get("/", function(req, res) { // kiedy user chce home route to serwer pobiera dane i co wysyla, to nizej

//let day = date(); //wywolujemy ten modul nasz z data
let day = date.getDate();


  // zamiat switcha mozna uzyc js opcji i funkcji gotowych powyzej

  // var currentDay = today.getDay();
  // var day = "";

  // switch (currentDay) {
  //   case 0:
  //     day = "Sunday";
  //     break;
  //   case 1:
  //     day = "Monday";
  //     break;
  //   case 2:
  //     day = "Tuesday";
  //     break;
  //   case 3:
  //     day = "Wednesday";
  //     break;
  //   case 4:
  //     day = "Thursday";
  //     break;
  //   case 5:
  //     day = "Friday";
  //     break;
  //   case 6:
  //     day = "Saturday";
  //     break;
  //   default:
  //   console.log("Error: current day is equal to: " + currentDay);
  // }


  // if (today.getDay() === 6 || today.getDay() === 0) {
  // if (currentDay === 6 || currentDay === 0) {
  //   day = "Weekend";
  //   res.render("list", {kindOfDay: day}); // render file called list and parse that file with var kindOfDay
  // res.write("<h1>yay it's a weekend!</h1>");


  // } else {
  //   // res.write("<p>Boo! I have to work!</p>");
  //   // res.write("<h1>NOT a weekend!</h1>");
  //   // res.send();
  //   //day = "day";
  // }

//zdefiniowane obie
  res.render("list", {listTitle: day, newListItems: items});

});

app.post("/", function(req, res){

let item = req.body.newItem; // lapiemy tego posta z html po nazwie name

  if (req.body.list === "Work"){
    workItems.push(item);
  } else {
    // kazdego razu, gdy robimy post request to dodaje do items nowy rekord
    items.push(item); // z pythona append
    // zamiast render ponizej, mozna przekierowanie zrobic tu w poscie do home route, a w  get zdefiniowac obie zmienne z ejs
    res.redirect("/");
    // trzeba dodac jescze ten newListItem do geta bo nie ma zdefiniowanej co ma serwer otrzymac mimo wszystko
      // res.render("list", {newListItem: item}); // list w sensie list.ejs i potem jaki element nazwa: i value item zmienna, to wyzej.. taki parsing
  }
//  console.log(req.body);
//  console.log(item);
});

app.get("/work", function(req, res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.post("/work", function(req, res){
  let item = req.body.newItem;
  workItems.push(item);
  res.redirect("/work");
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000.");
});
